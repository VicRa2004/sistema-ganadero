import { errorResponse } from "./errorResponses";
import type { Context, MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/bun";
import { env } from "@/core/config/env";

interface RateLimitOptions {
	/** Ventana de tiempo en milisegundos. */
	windowMs: number;
	/** Máximo de peticiones permitidas por clave dentro de la ventana. */
	max: number;
	/** Genera la clave de agrupación. Por defecto, la IP del cliente. */
	keyGenerator?: (c: Context) => string | Promise<string>;
	/** Si es true, las respuestas exitosas (< 400) no consumen cupo. */
	skipSuccessfulRequests?: boolean;
	message?: string;
}

interface Bucket {
	count: number;
	resetAt: number;
}

/**
 * Obtiene la IP del cliente. Solo confía en X-Forwarded-For si TRUST_PROXY=true
 * (detrás de un proxy de confianza); de lo contrario usa la IP de la conexión.
 */
export function getClientIp(c: Context): string {
	if (env.TRUST_PROXY) {
		const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
		if (forwarded) return forwarded;
	}

	try {
		return getConnInfo(c).remote.address ?? "unknown";
	} catch {
		return "unknown";
	}
}

/**
 * Rate limiter en memoria con ventana fija. Cada instancia tiene su propio
 * almacén; no se comparte entre procesos (para varias réplicas usar Redis).
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
	const {
		windowMs,
		max,
		keyGenerator = getClientIp,
		skipSuccessfulRequests = false,
		message = "Demasiadas solicitudes, inténtalo de nuevo más tarde",
	} = options;

	const buckets = new Map<string, Bucket>();
	let nextSweep = Date.now() + windowMs;

	const sweep = (now: number) => {
		if (now < nextSweep) return;
		for (const [key, bucket] of buckets) {
			if (bucket.resetAt <= now) buckets.delete(key);
		}
		nextSweep = now + windowMs;
	};

	return async (c, next) => {
		const now = Date.now();
		sweep(now);

		const key = await keyGenerator(c);
		let bucket = buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			bucket = { count: 0, resetAt: now + windowMs };
			buckets.set(key, bucket);
		}

		if (bucket.count >= max) {
			const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
			c.header("Retry-After", String(retryAfter));
			return errorResponse(c, 429, message);
		}

		bucket.count++;
		await next();

		if (skipSuccessfulRequests && c.res.status < 400) {
			bucket.count = Math.max(0, bucket.count - 1);
		}
	};
}

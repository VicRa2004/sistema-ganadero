import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Usuario autenticado que `authMiddleware` guarda en el contexto de Hono. */
export interface AuthUser {
	id: number;
	email?: string;
	role: string;
}

// Tipa `c.get("user")` / `c.set("user", ...)` en toda la API
declare module "hono" {
	interface ContextVariableMap {
		user: AuthUser;
	}
}

const ESTADOS_VALIDOS = new Set<number>([
	200, 201, 202, 203, 206, 207, 208, 226, 300, 301, 302, 303, 305, 306, 307,
	308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
	414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
	500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
]);

/** Convierte el código numérico de un `BaseError` al tipo de estado de Hono. */
export function toStatusCode(code: number): ContentfulStatusCode {
	return (ESTADOS_VALIDOS.has(code) ? code : 500) as ContentfulStatusCode;
}

import type { Context, Next } from "hono";
import { inject, injectable } from "tsyringe";
import { logger } from "@/core/config/logger";
import { getClientIp } from "@/core/shared/infrastructure/http/rateLimit";
import type { AuditLogRepository } from "../../../domain/repository/AuditLogRepository";

const METODOS_ESCRITURA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Registra cada escritura con éxito de un usuario autenticado. Va global sobre `/api/*`:
 * el usuario lo pone `authMiddleware` dentro de cada router y se lee tras `next()`.
 */
@injectable()
export class AuditMiddleware {
	constructor(
		@inject("AuditLogRepository")
		private readonly repository: AuditLogRepository,
	) {}

	handle = async (c: Context, next: Next): Promise<void> => {
		await next();

		const user = c.get("user");
		if (!user || !METODOS_ESCRITURA.has(c.req.method) || c.res.status >= 400) {
			return;
		}

		// Sin await: un fallo de auditoría no debe romper ni retrasar la respuesta
		this.repository
			.registrar({
				usuarioId: user.id,
				metodo: c.req.method,
				ruta: c.req.path.slice(0, 255),
				estado: c.res.status,
				ip: getClientIp(c).slice(0, 64),
				requestId: (c.get("requestId") as string | undefined) ?? null,
			})
			.catch((error) => logger.error("Error al registrar auditoría", error));
	};
}

import { errorResponse } from "@/core/shared/infrastructure/http/errorResponses";
import type { Context, Next } from "hono";
import { toStatusCode } from "@/core/shared/infrastructure/http/context";
import { injectable, inject } from "tsyringe";
import type { CheckUserPermissionUseCase } from "@/modules/authorization/application/useCases/CheckUserPermissionUseCase";
import { ForbiddenError } from "@/modules/authorization/domain/error/ForbiddenError";
import type { Recurso } from "@/modules/authorization/domain/Recursos";
import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Middleware de autorización granular (RBAC).
 * Clase inyectable que proporciona validación de permisos.
 *
 * Uso en rutas:
 * ```ts
 * app.post("/ganado",
 * authMiddleware.handle,
 * requirePermissionMiddleware.handle("ganado", "create"),
 * controller.run.bind(controller)
 * );
 * ```
 *
 * IMPORTANTE: Debe ir DESPUÉS de `authMiddleware`, ya que depende de
 * que el usuario esté disponible en el contexto de Hono.
 */
@injectable()
export class RequirePermissionMiddleware {
	constructor(
		@inject("CheckUserPermissionUseCase")
		private readonly checkUserPermissionUseCase: CheckUserPermissionUseCase,
	) {}

	/**
	 * Retorna un middleware configurado para validar un recurso y acción específicos.
	 *
	 * @param resource - Nombre del recurso (ver `RECURSOS`)
	 * @param action   - Acción requerida (ej: "create", "read", "update", "delete")
	 */
	handle = (resource: Recurso, action: string) => {
		return async (c: Context, next: Next): Promise<Response | void> => {
			// En Hono, la convención para pasar variables entre middlewares es usar c.get()
			// Asumiendo que tu authMiddleware hace algo como: c.set('user', user)
			const user = c.get("user");
			const userId: number | undefined = user?.id;

			if (!userId) {
				return errorResponse(
					c,
					401,
					"Usuario no autenticado. Ejecuta authMiddleware antes.",
				);
			}

			try {
				await this.checkUserPermissionUseCase.run(userId, resource, action);
				await next(); // Hono requiere el await en el next()
			} catch (error) {
				if (error instanceof ForbiddenError || error instanceof BaseError) {
					return errorResponse(c, toStatusCode(error.code), error.message);
				}

				return errorResponse(c, 500, "Error interno al verificar permisos");
			}
		};
	};
}

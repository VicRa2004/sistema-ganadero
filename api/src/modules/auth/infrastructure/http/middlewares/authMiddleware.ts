import { errorResponse } from "@/core/shared/infrastructure/http/errorResponses";
import type { Context, Next } from "hono";
import type { AuthUser } from "@/core/shared/infrastructure/http/context";
import { injectable, inject } from "tsyringe";
import { env } from "@/core/config/env";
import type { JwtService } from "../../service/JwtService";
import { logger } from "@/core/config/logger";

/**
 * Middleware de autenticación mediante JWT.
 * Intercepta la petición para validar la existencia y validez de un token Bearer.
 * Si el token es válido, inyecta los datos del usuario decodificados en el contexto de Hono.
 *
 * @example
 * app.use("/api/*", authMiddleware.handle);
 * app.get("/api/perfil", authMiddleware.handle, controller.run.bind(controller));
 */
@injectable()
export class AuthMiddleware {
	constructor(
		@inject("JwtService")
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Manejador del middleware para Hono.
	 * Verifica el header 'Authorization', extrae el token y lo valida.
	 *
	 * @param {Context} c - Contexto de la petición de Hono (contiene req, res y variables de estado).
	 * @param {Next} next - Función asíncrona para ceder el control al siguiente middleware o controlador.
	 * @returns {Promise<Response | void>} Retorna una respuesta HTTP 401 si falla, o cede el control con `await next()`.
	 */
	handle = async (c: Context, next: Next): Promise<Response | void> => {
		// En Hono, los headers se obtienen a través de c.req.header()
		const authHeader = c.req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return errorResponse(
				c,
				401,
				"No se proporcionó un token de autenticación",
			);
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			return errorResponse(c, 401, "Token inválido");
		}

		try {
			const decoded = this.jwtService.verifyToken(token);

			// Un JWT válido pero sin la forma esperada no identifica a ningún usuario
			if (
				typeof decoded === "string" ||
				typeof (decoded as { id?: unknown }).id !== "number"
			) {
				return errorResponse(c, 401, "Token inválido");
			}

			// En lugar de mutar req (ej. req.user), en Hono guardamos datos en el contexto
			// usando c.set() para que otros middlewares/controladores puedan leerlo con c.get()
			c.set("user", decoded as AuthUser);

			await next(); // Siempre debe llevar await en Hono
		} catch (error) {
			// Un token inválido o expirado es un caso normal; solo se anota en desarrollo
			if (env.NODE_ENV === "dev") {
				logger.debug(
					`Token rechazado: ${error instanceof Error ? error.message : "desconocido"}`,
				);
			}

			return errorResponse(c, 401, "Token inválido o expirado");
		}
	};
}

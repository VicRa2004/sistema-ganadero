import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import { env } from "@/core/config/env";
import {
	getClientIp,
	rateLimit,
} from "@/core/shared/infrastructure/http/rateLimit";

import type { LoginController } from "../controllers/LoginController";
import type { RegisterController } from "../controllers/RegisterController";
import type { RefreshTokenController } from "../controllers/RefreshTokenController";
import type { LogoutController } from "../controllers/LogoutController";

@injectable()
export class AuthRouter {
	public readonly router: Hono;

	constructor(
		@inject("LoginController")
		private readonly loginController: LoginController,
		@inject("RegisterController")
		private readonly registerController: RegisterController,
		@inject("RefreshTokenController")
		private readonly refreshTokenController: RefreshTokenController,
		@inject("LogoutController")
		private readonly logoutController: LogoutController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		const QUINCE_MINUTOS = 15 * 60 * 1000;
		const UNA_HORA = 60 * 60 * 1000;

		// Login: 5 intentos fallidos por IP + email y 20 por IP cada 15 minutos
		const loginPorCuenta = rateLimit({
			windowMs: QUINCE_MINUTOS,
			max: 5,
			skipSuccessfulRequests: true,
			message: "Demasiados intentos de inicio de sesión, inténtalo más tarde",
			keyGenerator: async (c) => {
				const body = await c.req.json().catch(() => null);
				const email =
					typeof body?.email === "string"
						? body.email.trim().toLowerCase()
						: "";
				return `${getClientIp(c)}:${email}`;
			},
		});
		const loginPorIp = rateLimit({
			windowMs: QUINCE_MINUTOS,
			max: 20,
			skipSuccessfulRequests: true,
			message: "Demasiados intentos de inicio de sesión, inténtalo más tarde",
		});
		// Registro: 4 por IP cada hora
		const registroPorIp = rateLimit({
			windowMs: UNA_HORA,
			max: 4,
			message: "Demasiados registros desde esta dirección, inténtalo más tarde",
		});
		// Refresh: 30 por IP cada 15 minutos
		const refreshPorIp = rateLimit({ windowMs: QUINCE_MINUTOS, max: 30 });

		/**
		 * @openapi
		 * /api/auth/login:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Iniciar sesión
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             properties:
		 *               email:
		 *                 type: string
		 *               password:
		 *                 type: string
		 *     responses:
		 *       200:
		 *         description: Login exitoso, devuelve accessToken y guarda refreshToken en una cookie HttpOnly.
		 *       401:
		 *         description: Credenciales inválidas
		 */
		this.router.post(
			"/login",
			loginPorIp,
			loginPorCuenta,
			this.loginController.run,
		);

		/**
		 * @openapi
		 * /api/auth/register:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Registrar un nuevo usuario
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             properties:
		 *               email:
		 *                 type: string
		 *               password:
		 *                 type: string
		 *               name:
		 *                 type: string
		 *     responses:
		 *       201:
		 *         description: Usuario registrado exitosamente, devuelve accessToken y guarda refreshToken en una cookie HttpOnly.
		 *       403:
		 *         description: Registro público deshabilitado (ALLOW_PUBLIC_REGISTER=false)
		 */
		this.router.post(
			"/register",
			async (c, next) => {
				if (!env.ALLOW_PUBLIC_REGISTER) {
					return c.json(
						{ error: "El registro público está deshabilitado" },
						403,
					);
				}
				await next();
			},
			registroPorIp,
			this.registerController.run,
		);

		/**
		 * @openapi
		 * /api/auth/refresh:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Renovar tokens usando un refresh token válido
		 *     description: >
		 *       Rota el refresh token: el token enviado en la cookie se revoca y se genera
		 *       un nuevo accessToken (devuelto en respuesta JSON) y se guarda el nuevo refreshToken en la cookie (Refresh Token Rotation).
		 *     responses:
		 *       200:
		 *         description: Tokens renovados exitosamente, devuelve accessToken.
		 *       401:
		 *         description: Refresh token inválido o expirado en la cookie
		 */
		this.router.post("/refresh", refreshPorIp, this.refreshTokenController.run);

		/**
		 * @openapi
		 * /api/auth/logout:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Cerrar sesión (revocar refresh token)
		 *     description: >
		 *       Revoca el refresh token almacenado en la cookie y expira dicha cookie.
		 *     responses:
		 *       200:
		 *         description: Sesión cerrada correctamente
		 *       401:
		 *         description: Refresh token inválido o expirado en la cookie
		 */
		this.router.post("/logout", this.logoutController.run);
	}
}

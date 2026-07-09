import { Hono } from "hono";
import { inject, injectable } from "tsyringe";

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
		// TODO: Implement rate limiting for Hono (e.g., using a custom middleware or a package)
		// - Rate limiting: máx 5 intentos por IP en 15 minutos para login
		// - Rate limiting: máx 4 registros por IP en 1 hora

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
		this.router.post("/login", this.loginController.run);

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
		 */
		this.router.post("/register", this.registerController.run);

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
		this.router.post("/refresh", this.refreshTokenController.run);

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

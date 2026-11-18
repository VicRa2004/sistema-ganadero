import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { ObtenerDashboardResumenController } from "../controllers/ObtenerDashboardResumenController";

@injectable()
export class DashboardRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("ObtenerDashboardResumenController")
		private readonly obtenerResumenController: ObtenerDashboardResumenController,
	) {
		this.router = new Hono();
		this.router.use(this.authMiddleware.handle);
		this.router.get(
			"/resumen",
			this.obtenerResumenController.run.bind(this.obtenerResumenController),
		);
	}
}

import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { EvaluarAlertasSanitariasController } from "../controllers/EvaluarAlertasSanitariasController";

@injectable()
export class SaludRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("EvaluarAlertasSanitariasController")
		private readonly evaluarController: EvaluarAlertasSanitariasController,
	) {
		this.router = new Hono();
		this.router.use(this.authMiddleware.handle);
		this.router.post(
			"/evaluar-alertas",
			this.evaluarController.run.bind(this.evaluarController),
		);
	}
}

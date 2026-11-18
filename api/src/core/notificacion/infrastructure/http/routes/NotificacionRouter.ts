import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { ActualizarPreferenciasNotificacionController } from "../controllers/ActualizarPreferenciasNotificacionController";
import type { ListarNotificacionesController } from "../controllers/ListarNotificacionesController";
import type { MarcarNotificacionLeidaController } from "../controllers/MarcarNotificacionLeidaController";
import type { MarcarTodasLeidasController } from "../controllers/MarcarTodasLeidasController";
import type { ObtenerPreferenciasNotificacionController } from "../controllers/ObtenerPreferenciasNotificacionController";

@injectable()
export class NotificacionRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("ListarNotificacionesController")
		private readonly listarController: ListarNotificacionesController,
		@inject("MarcarNotificacionLeidaController")
		private readonly marcarLeidaController: MarcarNotificacionLeidaController,
		@inject("MarcarTodasLeidasController")
		private readonly marcarTodasController: MarcarTodasLeidasController,
		@inject("ObtenerPreferenciasNotificacionController")
		private readonly obtenerPrefsController: ObtenerPreferenciasNotificacionController,
		@inject("ActualizarPreferenciasNotificacionController")
		private readonly actualizarPrefsController: ActualizarPreferenciasNotificacionController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		this.router.get("/", this.listarController.run.bind(this.listarController));
		this.router.get(
			"/preferencias",
			this.obtenerPrefsController.run.bind(this.obtenerPrefsController),
		);
		this.router.put(
			"/preferencias",
			this.actualizarPrefsController.run.bind(this.actualizarPrefsController),
		);
		this.router.post(
			"/leer-todas",
			this.marcarTodasController.run.bind(this.marcarTodasController),
		);
		this.router.post(
			"/:id/leer",
			this.marcarLeidaController.run.bind(this.marcarLeidaController),
		);
	}
}

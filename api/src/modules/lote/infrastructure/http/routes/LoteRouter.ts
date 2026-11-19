import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarLoteController } from "../controllers/ActualizarLoteController";
import type { AgregarMiembrosLoteController } from "../controllers/AgregarMiembrosLoteController";
import type { CrearLoteController } from "../controllers/CrearLoteController";
import type { EliminarLoteController } from "../controllers/EliminarLoteController";
import type { ListarLotesController } from "../controllers/ListarLotesController";
import type { ObtenerDetalleLoteController } from "../controllers/ObtenerDetalleLoteController";
import type { PesajeMasivoLoteController } from "../controllers/PesajeMasivoLoteController";
import type { QuitarMiembroLoteController } from "../controllers/QuitarMiembroLoteController";
import type { TrasladoMasivoLoteController } from "../controllers/TrasladoMasivoLoteController";
import type { VacunacionMasivaLoteController } from "../controllers/VacunacionMasivaLoteController";

@injectable()
export class LoteRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("ListarLotesController")
		private readonly listarController: ListarLotesController,
		@inject("ObtenerDetalleLoteController")
		private readonly obtenerDetalleController: ObtenerDetalleLoteController,
		@inject("CrearLoteController")
		private readonly crearController: CrearLoteController,
		@inject("ActualizarLoteController")
		private readonly actualizarController: ActualizarLoteController,
		@inject("EliminarLoteController")
		private readonly eliminarController: EliminarLoteController,
		@inject("AgregarMiembrosLoteController")
		private readonly agregarMiembrosController: AgregarMiembrosLoteController,
		@inject("QuitarMiembroLoteController")
		private readonly quitarMiembroController: QuitarMiembroLoteController,
		@inject("PesajeMasivoLoteController")
		private readonly pesajeMasivoController: PesajeMasivoLoteController,
		@inject("TrasladoMasivoLoteController")
		private readonly trasladoMasivoController: TrasladoMasivoLoteController,
		@inject("VacunacionMasivaLoteController")
		private readonly vacunacionMasivaController: VacunacionMasivaLoteController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("lotes", "read"),
			this.listarController.run,
		);
		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("lotes", "read"),
			this.obtenerDetalleController.run,
		);
		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("lotes", "create"),
			this.crearController.run,
		);
		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.actualizarController.run,
		);
		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("lotes", "delete"),
			this.eliminarController.run,
		);
		this.router.post(
			"/:id/miembros",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.agregarMiembrosController.run,
		);
		this.router.delete(
			"/:id/miembros/:ganadoId",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.quitarMiembroController.run,
		);
		this.router.post(
			"/:id/pesaje-masivo",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.pesajeMasivoController.run,
		);
		this.router.post(
			"/:id/traslado-masivo",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.trasladoMasivoController.run,
		);
		this.router.post(
			"/:id/vacunacion",
			this.requirePermissionMiddleware.handle("lotes", "update"),
			this.vacunacionMasivaController.run,
		);
	}
}

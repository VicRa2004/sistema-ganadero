import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarRacionController } from "../controllers/ActualizarRacionController";
import type { CrearRacionController } from "../controllers/CrearRacionController";
import type { EliminarRacionController } from "../controllers/EliminarRacionController";
import type { ListarRacionesController } from "../controllers/ListarRacionesController";
import type { ListarSuministrosController } from "../controllers/ListarSuministrosController";
import type { ObtenerAutonomiaAlimentoController } from "../controllers/ObtenerAutonomiaAlimentoController";
import type { RegistrarSuministroController } from "../controllers/RegistrarSuministroController";

@injectable()
export class AlimentacionRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("ListarRacionesController")
		private readonly listarRacionesController: ListarRacionesController,
		@inject("CrearRacionController")
		private readonly crearRacionController: CrearRacionController,
		@inject("ActualizarRacionController")
		private readonly actualizarRacionController: ActualizarRacionController,
		@inject("EliminarRacionController")
		private readonly eliminarRacionController: EliminarRacionController,
		@inject("RegistrarSuministroController")
		private readonly registrarSuministroController: RegistrarSuministroController,
		@inject("ListarSuministrosController")
		private readonly listarSuministrosController: ListarSuministrosController,
		@inject("ObtenerAutonomiaAlimentoController")
		private readonly obtenerAutonomiaController: ObtenerAutonomiaAlimentoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/autonomia",
			this.requirePermissionMiddleware.handle("alimentacion", "read"),
			this.obtenerAutonomiaController.run,
		);
		this.router.get(
			"/suministros",
			this.requirePermissionMiddleware.handle("alimentacion", "read"),
			this.listarSuministrosController.run,
		);
		this.router.get(
			"/raciones",
			this.requirePermissionMiddleware.handle("alimentacion", "read"),
			this.listarRacionesController.run,
		);
		this.router.post(
			"/raciones",
			this.requirePermissionMiddleware.handle("alimentacion", "create"),
			this.crearRacionController.run,
		);
		this.router.put(
			"/raciones/:id",
			this.requirePermissionMiddleware.handle("alimentacion", "update"),
			this.actualizarRacionController.run,
		);
		this.router.delete(
			"/raciones/:id",
			this.requirePermissionMiddleware.handle("alimentacion", "delete"),
			this.eliminarRacionController.run,
		);
		this.router.post(
			"/raciones/:id/suministrar",
			this.requirePermissionMiddleware.handle("alimentacion", "create"),
			this.registrarSuministroController.run,
		);
	}
}

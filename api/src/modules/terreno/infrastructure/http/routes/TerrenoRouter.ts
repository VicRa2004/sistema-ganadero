import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarTerrenoController } from "../controllers/ActualizarTerrenoController";
import type { EliminarTerrenoController } from "../controllers/EliminarTerrenoController";
import type { ListarTerrenosController } from "../controllers/ListarTerrenosController";
import type { ObtenerCapacidadTerrenoController } from "../controllers/ObtenerCapacidadTerrenoController";
import type { ObtenerDetalleTerrenoController } from "../controllers/ObtenerDetalleTerrenoController";
import type { RegistrarTerrenoController } from "../controllers/RegistrarTerrenoController";

@injectable()
export class TerrenoRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarTerrenoController")
		private readonly registrarController: RegistrarTerrenoController,
		@inject("ListarTerrenosController")
		private readonly listarController: ListarTerrenosController,
		@inject("ObtenerDetalleTerrenoController")
		private readonly obtenerDetalleController: ObtenerDetalleTerrenoController,
		@inject("ObtenerCapacidadTerrenoController")
		private readonly obtenerCapacidadController: ObtenerCapacidadTerrenoController,
		@inject("ActualizarTerrenoController")
		private readonly actualizarController: ActualizarTerrenoController,
		@inject("EliminarTerrenoController")
		private readonly eliminarController: EliminarTerrenoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de terreno
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.get(
			"/:id/capacidad",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "read"),
			this.obtenerCapacidadController.run.bind(this.obtenerCapacidadController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("terreno", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarRanchoController } from "../controllers/ActualizarRanchoController";
import type { EliminarRanchoController } from "../controllers/EliminarRanchoController";
import type { ListarRanchosController } from "../controllers/ListarRanchosController";
import type { ObtenerCapacidadRanchoController } from "../controllers/ObtenerCapacidadRanchoController";
import type { ObtenerDetalleRanchoController } from "../controllers/ObtenerDetalleRanchoController";
import type { RegistrarRanchoController } from "../controllers/RegistrarRanchoController";

@injectable()
export class RanchoRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarRanchoController")
		private readonly registrarController: RegistrarRanchoController,
		@inject("ListarRanchosController")
		private readonly listarController: ListarRanchosController,
		@inject("ObtenerDetalleRanchoController")
		private readonly obtenerDetalleController: ObtenerDetalleRanchoController,
		@inject("ObtenerCapacidadRanchoController")
		private readonly obtenerCapacidadController: ObtenerCapacidadRanchoController,
		@inject("ActualizarRanchoController")
		private readonly actualizarController: ActualizarRanchoController,
		@inject("EliminarRanchoController")
		private readonly eliminarController: EliminarRanchoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de rancho
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.get(
			"/:id/capacidad",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "read"),
			this.obtenerCapacidadController.run.bind(this.obtenerCapacidadController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("rancho", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

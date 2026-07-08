import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarPropietarioController } from "../controllers/ActualizarPropietarioController";
import type { EliminarPropietarioController } from "../controllers/EliminarPropietarioController";
import type { ListarPropietariosController } from "../controllers/ListarPropietariosController";
import type { ObtenerDetallePropietarioController } from "../controllers/ObtenerDetallePropietarioController";
import type { RegistrarPropietarioController } from "../controllers/RegistrarPropietarioController";

@injectable()
export class PropietarioRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarPropietarioController")
		private readonly registrarController: RegistrarPropietarioController,
		@inject("ListarPropietariosController")
		private readonly listarController: ListarPropietariosController,
		@inject("ObtenerDetallePropietarioController")
		private readonly obtenerDetalleController: ObtenerDetallePropietarioController,
		@inject("ActualizarPropietarioController")
		private readonly actualizarController: ActualizarPropietarioController,
		@inject("EliminarPropietarioController")
		private readonly eliminarController: EliminarPropietarioController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de propietario
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("propietario", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("propietario", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("propietario", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("propietario", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("propietario", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarVeterinarioController } from "../controllers/ActualizarVeterinarioController";
import type { EliminarVeterinarioController } from "../controllers/EliminarVeterinarioController";
import type { ListarVeterinariosController } from "../controllers/ListarVeterinariosController";
import type { ObtenerDetalleVeterinarioController } from "../controllers/ObtenerDetalleVeterinarioController";
import type { RegistrarVeterinarioController } from "../controllers/RegistrarVeterinarioController";

@injectable()
export class VeterinarioRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarVeterinarioController")
		private readonly registrarController: RegistrarVeterinarioController,
		@inject("ListarVeterinariosController")
		private readonly listarController: ListarVeterinariosController,
		@inject("ObtenerDetalleVeterinarioController")
		private readonly obtenerDetalleController: ObtenerDetalleVeterinarioController,
		@inject("ActualizarVeterinarioController")
		private readonly actualizarController: ActualizarVeterinarioController,
		@inject("EliminarVeterinarioController")
		private readonly eliminarController: EliminarVeterinarioController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de veterinarios
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("veterinarios", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("veterinarios", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("veterinarios", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("veterinarios", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("veterinarios", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { DeleteRazaController } from "../controllers/DeleteRazaController";
import type { ObtenerCatalogoRazasController } from "../controllers/ObtenerCatalogoRazasController";
import type { RegisterRazaController } from "../controllers/RegisterRazaController";
import type { UpdateRazaController } from "../controllers/UpdateRazaController";

@injectable()
export class RazaRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegisterRazaController")
		private readonly registerController: RegisterRazaController,
		@inject("ObtenerCatalogoRazasController")
		private readonly obtenerController: ObtenerCatalogoRazasController,
		@inject("UpdateRazaController")
		private readonly updateController: UpdateRazaController,
		@inject("DeleteRazaController")
		private readonly deleteController: DeleteRazaController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoint de lectura pública (cualquiera puede leer)
		this.router.get(
			"/",
			this.obtenerController.run.bind(this.obtenerController),
		);

		// Endpoints de escritura/modificación/eliminación (solo administradores mediante permisos)
		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("raza", "create"),
			this.registerController.run.bind(this.registerController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("raza", "update"),
			this.updateController.run.bind(this.updateController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("raza", "delete"),
			this.deleteController.run.bind(this.deleteController),
		);
	}
}

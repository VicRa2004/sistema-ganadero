import { Hono } from "hono";
import { injectable, inject } from "tsyringe";

import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";

// Controladores CRUD de permisos
import type { GetAllPermissionsController } from "../controllers/GetAllPermissionsController";
import type { GetPermissionController } from "../controllers/GetPermissionController";
import type { CreatePermissionController } from "../controllers/CreatePermissionController";
import type { UpdatePermissionController } from "../controllers/UpdatePermissionController";
import type { DeletePermissionController } from "../controllers/DeletePermissionController";
import type { GetUserPermissionsController } from "../controllers/GetUserPermissionsController";

@injectable()
export class PermissionRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("GetAllPermissionsController")
		private readonly getAllPermissionsController: GetAllPermissionsController,
		@inject("GetPermissionController")
		private readonly getPermissionController: GetPermissionController,
		@inject("CreatePermissionController")
		private readonly createPermissionController: CreatePermissionController,
		@inject("UpdatePermissionController")
		private readonly updatePermissionController: UpdatePermissionController,
		@inject("DeletePermissionController")
		private readonly deletePermissionController: DeletePermissionController,
		@inject("GetUserPermissionsController")
		private readonly getUserPermissionsController: GetUserPermissionsController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/users/:userId",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getUserPermissionsController.run,
		);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getAllPermissionsController.run,
		);

		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getPermissionController.run,
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "create"),
			this.createPermissionController.run,
		);

		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "update"),
			this.updatePermissionController.run,
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "delete"),
			this.deletePermissionController.run,
		);
	}
}

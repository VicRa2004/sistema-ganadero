import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { AssignUserDirectPermissionsController } from "../controllers/AssignUserDirectPermissionsController";
import type { AssignUserRolesController } from "../controllers/AssignUserRolesController";
import type { CreatePermissionController } from "../controllers/CreatePermissionController";
import type { DeletePermissionController } from "../controllers/DeletePermissionController";
import type { GetAllPermissionsController } from "../controllers/GetAllPermissionsController";
import type { GetAllRolesController } from "../controllers/GetAllRolesController";
import type { GetPermissionController } from "../controllers/GetPermissionController";
import type { GetUserAccessController } from "../controllers/GetUserAccessController";
import type { GetUserPermissionsController } from "../controllers/GetUserPermissionsController";
import type { UpdatePermissionController } from "../controllers/UpdatePermissionController";

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
		@inject("GetAllRolesController")
		private readonly getAllRolesController: GetAllRolesController,
		@inject("GetUserAccessController")
		private readonly getUserAccessController: GetUserAccessController,
		@inject("AssignUserRolesController")
		private readonly assignUserRolesController: AssignUserRolesController,
		@inject("AssignUserDirectPermissionsController")
		private readonly assignUserDirectPermissionsController: AssignUserDirectPermissionsController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		// Rutas específicas ANTES de /:id para evitar colisiones
		this.router.get(
			"/roles",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getAllRolesController.run,
		);

		this.router.get(
			"/users/:userId/access",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getUserAccessController.run,
		);

		this.router.put(
			"/users/:userId/roles",
			this.requirePermissionMiddleware.handle("permissions", "update"),
			this.assignUserRolesController.run,
		);

		this.router.put(
			"/users/:userId/direct",
			this.requirePermissionMiddleware.handle("permissions", "update"),
			this.assignUserDirectPermissionsController.run,
		);

		this.router.get("/users/:userId", this.getUserPermissionsController.run);

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

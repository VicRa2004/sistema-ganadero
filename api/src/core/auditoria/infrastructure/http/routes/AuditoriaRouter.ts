import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ListarAuditoriaController } from "../controllers/ListarAuditoriaController";

@injectable()
export class AuditoriaRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("ListarAuditoriaController")
		private readonly listarController: ListarAuditoriaController,
	) {
		this.router = new Hono();
		this.router.use(this.authMiddleware.handle);
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("auditoria", "read"),
			this.listarController.run.bind(this.listarController),
		);
	}
}

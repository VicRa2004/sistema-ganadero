import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { EliminarEventoReproductivoController } from "../controllers/EliminarEventoReproductivoController";
import type { ListarEventosReproductivosController } from "../controllers/ListarEventosReproductivosController";
import type { ObtenerIndicadoresReproductivosController } from "../controllers/ObtenerIndicadoresReproductivosController";
import type { RegistrarEventoReproductivoController } from "../controllers/RegistrarEventoReproductivoController";

@injectable()
export class ReproduccionRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarEventoReproductivoController")
		private readonly registrarController: RegistrarEventoReproductivoController,
		@inject("ListarEventosReproductivosController")
		private readonly listarController: ListarEventosReproductivosController,
		@inject("EliminarEventoReproductivoController")
		private readonly eliminarController: EliminarEventoReproductivoController,
		@inject("ObtenerIndicadoresReproductivosController")
		private readonly indicadoresController: ObtenerIndicadoresReproductivosController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/indicadores",
			this.requirePermissionMiddleware.handle("reproduccion", "read"),
			this.indicadoresController.run.bind(this.indicadoresController),
		);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("reproduccion", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("reproduccion", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("reproduccion", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { RegistrarInsumoController } from "../controllers/RegistrarInsumoController";
import type { AbastecerInsumoController } from "../controllers/AbastecerInsumoController";
import type { ConsumirInsumoController } from "../controllers/ConsumirInsumoController";
import type { ObtenerInsumosCriticosController } from "../controllers/ObtenerInsumosCriticosController";
import type { ListarInsumosController } from "../controllers/ListarInsumosController";
import type { ObtenerDetalleInsumoController } from "../controllers/ObtenerDetalleInsumoController";
import type { EliminarInsumoController } from "../controllers/EliminarInsumoController";

@injectable()
export class InsumoRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarInsumoController")
		private readonly registrarController: RegistrarInsumoController,
		@inject("AbastecerInsumoController")
		private readonly abastecerController: AbastecerInsumoController,
		@inject("ConsumirInsumoController")
		private readonly consumirController: ConsumirInsumoController,
		@inject("ObtenerInsumosCriticosController")
		private readonly obtenerCriticosController: ObtenerInsumosCriticosController,
		@inject("ListarInsumosController")
		private readonly listarController: ListarInsumosController,
		@inject("ObtenerDetalleInsumoController")
		private readonly obtenerDetalleController: ObtenerDetalleInsumoController,
		@inject("EliminarInsumoController")
		private readonly eliminarController: EliminarInsumoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de insumos
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/criticos",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "read"),
			this.obtenerCriticosController.run.bind(this.obtenerCriticosController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.post(
			"/:id/abastecer",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "update"),
			this.abastecerController.run.bind(this.abastecerController),
		);

		this.router.post(
			"/:id/consumir",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "update"),
			this.consumirController.run.bind(this.consumirController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("insumo", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

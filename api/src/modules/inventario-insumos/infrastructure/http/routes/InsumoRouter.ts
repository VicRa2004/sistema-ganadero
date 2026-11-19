import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { AbastecerInsumoController } from "../controllers/AbastecerInsumoController";
import type { ActualizarInsumoController } from "../controllers/ActualizarInsumoController";
import type { AjustarStockInsumoController } from "../controllers/AjustarStockInsumoController";
import type { ConsumirInsumoController } from "../controllers/ConsumirInsumoController";
import type { EliminarInsumoController } from "../controllers/EliminarInsumoController";
import type { ExportarInsumosCsvController } from "../controllers/ExportarInsumosCsvController";
import type { ExportarInsumosPdfController } from "../controllers/ExportarInsumosPdfController";
import type { ListarInsumosController } from "../controllers/ListarInsumosController";
import type { ListarKardexInsumoController } from "../controllers/ListarKardexInsumoController";
import type { ObtenerDetalleInsumoController } from "../controllers/ObtenerDetalleInsumoController";
import type { ObtenerInsumosCriticosController } from "../controllers/ObtenerInsumosCriticosController";
import type { RegistrarInsumoController } from "../controllers/RegistrarInsumoController";

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
		@inject("ActualizarInsumoController")
		private readonly actualizarController: ActualizarInsumoController,
		@inject("AbastecerInsumoController")
		private readonly abastecerController: AbastecerInsumoController,
		@inject("ConsumirInsumoController")
		private readonly consumirController: ConsumirInsumoController,
		@inject("AjustarStockInsumoController")
		private readonly ajustarStockController: AjustarStockInsumoController,
		@inject("ListarKardexInsumoController")
		private readonly listarKardexController: ListarKardexInsumoController,
		@inject("ObtenerInsumosCriticosController")
		private readonly obtenerCriticosController: ObtenerInsumosCriticosController,
		@inject("ListarInsumosController")
		private readonly listarController: ListarInsumosController,
		@inject("ObtenerDetalleInsumoController")
		private readonly obtenerDetalleController: ObtenerDetalleInsumoController,
		@inject("EliminarInsumoController")
		private readonly eliminarController: EliminarInsumoController,
		@inject("ExportarInsumosCsvController")
		private readonly exportarCsvController: ExportarInsumosCsvController,
		@inject("ExportarInsumosPdfController")
		private readonly exportarPdfController: ExportarInsumosPdfController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/criticos",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.obtenerCriticosController.run.bind(this.obtenerCriticosController),
		);

		this.router.get(
			"/exportar/csv",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.exportarCsvController.run.bind(this.exportarCsvController),
		);

		this.router.get(
			"/exportar/pdf",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.exportarPdfController.run.bind(this.exportarPdfController),
		);

		this.router.get(
			"/:id/kardex",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.listarKardexController.run.bind(this.listarKardexController),
		);

		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("inventario-insumos", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("inventario-insumos", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("inventario-insumos", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.post(
			"/:id/abastecer",
			this.requirePermissionMiddleware.handle("inventario-insumos", "update"),
			this.abastecerController.run.bind(this.abastecerController),
		);

		this.router.post(
			"/:id/consumir",
			this.requirePermissionMiddleware.handle("inventario-insumos", "update"),
			this.consumirController.run.bind(this.consumirController),
		);

		this.router.post(
			"/:id/ajustar",
			this.requirePermissionMiddleware.handle("inventario-insumos", "update"),
			this.ajustarStockController.run.bind(this.ajustarStockController),
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("inventario-insumos", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

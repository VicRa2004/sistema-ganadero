import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarGastoController } from "../controllers/ActualizarGastoController";
import type { EliminarGastoController } from "../controllers/EliminarGastoController";
import type { EliminarTransaccionController } from "../controllers/EliminarTransaccionController";
import type { ExportarTransaccionPdfController } from "../controllers/ExportarTransaccionPdfController";
import type { ListarGastosController } from "../controllers/ListarGastosController";
import type { ListarTransaccionesController } from "../controllers/ListarTransaccionesController";
import type { ObtenerRentabilidadController } from "../controllers/ObtenerRentabilidadController";
import type { ObtenerRentabilidadGanadoController } from "../controllers/ObtenerRentabilidadGanadoController";
import type { ObtenerTransaccionController } from "../controllers/ObtenerTransaccionController";
import type { RegistrarCompraController } from "../controllers/RegistrarCompraController";
import type { RegistrarGastoController } from "../controllers/RegistrarGastoController";
import type { RegistrarVentaController } from "../controllers/RegistrarVentaController";

@injectable()
export class ComercialRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("ListarTransaccionesController")
		private readonly listarTransaccionesController: ListarTransaccionesController,
		@inject("ObtenerTransaccionController")
		private readonly obtenerTransaccionController: ObtenerTransaccionController,
		@inject("ExportarTransaccionPdfController")
		private readonly exportarTransaccionPdfController: ExportarTransaccionPdfController,
		@inject("RegistrarVentaController")
		private readonly registrarVentaController: RegistrarVentaController,
		@inject("RegistrarCompraController")
		private readonly registrarCompraController: RegistrarCompraController,
		@inject("EliminarTransaccionController")
		private readonly eliminarTransaccionController: EliminarTransaccionController,
		@inject("ListarGastosController")
		private readonly listarGastosController: ListarGastosController,
		@inject("RegistrarGastoController")
		private readonly registrarGastoController: RegistrarGastoController,
		@inject("ActualizarGastoController")
		private readonly actualizarGastoController: ActualizarGastoController,
		@inject("EliminarGastoController")
		private readonly eliminarGastoController: EliminarGastoController,
		@inject("ObtenerRentabilidadController")
		private readonly obtenerRentabilidadController: ObtenerRentabilidadController,
		@inject("ObtenerRentabilidadGanadoController")
		private readonly obtenerRentabilidadGanadoController: ObtenerRentabilidadGanadoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/transacciones",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.listarTransaccionesController.run,
		);
		this.router.get(
			"/transacciones/:id",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.obtenerTransaccionController.run,
		);
		this.router.get(
			"/transacciones/:id/pdf",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.exportarTransaccionPdfController.run,
		);
		this.router.post(
			"/transacciones/venta",
			this.requirePermissionMiddleware.handle("comercial", "create"),
			this.registrarVentaController.run,
		);
		this.router.post(
			"/transacciones/compra",
			this.requirePermissionMiddleware.handle("comercial", "create"),
			this.registrarCompraController.run,
		);
		this.router.delete(
			"/transacciones/:id",
			this.requirePermissionMiddleware.handle("comercial", "delete"),
			this.eliminarTransaccionController.run,
		);

		this.router.get(
			"/gastos",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.listarGastosController.run,
		);
		this.router.post(
			"/gastos",
			this.requirePermissionMiddleware.handle("comercial", "create"),
			this.registrarGastoController.run,
		);
		this.router.put(
			"/gastos/:id",
			this.requirePermissionMiddleware.handle("comercial", "update"),
			this.actualizarGastoController.run,
		);
		this.router.delete(
			"/gastos/:id",
			this.requirePermissionMiddleware.handle("comercial", "delete"),
			this.eliminarGastoController.run,
		);

		this.router.get(
			"/rentabilidad",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.obtenerRentabilidadController.run,
		);
		this.router.get(
			"/rentabilidad/ganado/:id",
			this.requirePermissionMiddleware.handle("comercial", "read"),
			this.obtenerRentabilidadGanadoController.run,
		);
	}
}

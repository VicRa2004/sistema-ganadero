import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { RegistrarGanadoController } from "../controllers/RegistrarGanadoController";
import type { ListarPesajesController } from "../controllers/ListarPesajesController";
import type { RegistrarPesajeController } from "../controllers/RegistrarPesajeController";
import type { TrasladarGanadoController } from "../controllers/TrasladarGanadoController";
import type { ObtenerFichaGanadoController } from "../controllers/ObtenerFichaGanadoController";
import type { ListarGanadosController } from "../controllers/ListarGanadosController";
import type { EliminarGanadoController } from "../controllers/EliminarGanadoController";
import type { ActualizarGanadoController } from "../controllers/ActualizarGanadoController";
import type { DarDeBajaGanadoController } from "../controllers/DarDeBajaGanadoController";
import type { ListarMotivosBajaController } from "../controllers/ListarMotivosBajaController";
import type { DescargarPlantillaGanadoController } from "../controllers/DescargarPlantillaGanadoController";
import type { PrevisualizarImportacionGanadoController } from "../controllers/PrevisualizarImportacionGanadoController";
import type { ConfirmarImportacionGanadoController } from "../controllers/ConfirmarImportacionGanadoController";
import type { ExportarGanadoCsvController } from "../controllers/ExportarGanadoCsvController";
import type { ExportarFichaGanadoPdfController } from "../controllers/ExportarFichaGanadoPdfController";
import type { ObtenerGenealogiaController } from "../controllers/ObtenerGenealogiaController";

@injectable()
export class GanadoRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarGanadoController")
		private readonly registrarController: RegistrarGanadoController,
		@inject("RegistrarPesajeController")
		private readonly pesajeController: RegistrarPesajeController,
		@inject("ListarPesajesController")
		private readonly listarPesajesController: ListarPesajesController,
		@inject("TrasladarGanadoController")
		private readonly trasladoController: TrasladarGanadoController,
		@inject("ObtenerFichaGanadoController")
		private readonly obtenerFichaController: ObtenerFichaGanadoController,
		@inject("ListarGanadosController")
		private readonly listarController: ListarGanadosController,
		@inject("EliminarGanadoController")
		private readonly eliminarController: EliminarGanadoController,
		@inject("ActualizarGanadoController")
		private readonly actualizarController: ActualizarGanadoController,
		@inject("DarDeBajaGanadoController")
		private readonly darDeBajaController: DarDeBajaGanadoController,
		@inject("ListarMotivosBajaController")
		private readonly listarMotivosBajaController: ListarMotivosBajaController,
		@inject("DescargarPlantillaGanadoController")
		private readonly plantillaController: DescargarPlantillaGanadoController,
		@inject("PrevisualizarImportacionGanadoController")
		private readonly previsualizarImportacionController: PrevisualizarImportacionGanadoController,
		@inject("ConfirmarImportacionGanadoController")
		private readonly confirmarImportacionController: ConfirmarImportacionGanadoController,
		@inject("ExportarGanadoCsvController")
		private readonly exportarCsvController: ExportarGanadoCsvController,
		@inject("ExportarFichaGanadoPdfController")
		private readonly exportarFichaPdfController: ExportarFichaGanadoPdfController,
		@inject("ObtenerGenealogiaController")
		private readonly genealogiaController: ObtenerGenealogiaController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Todas las rutas requieren token JWT válido
		this.router.use(this.authMiddleware.handle);

		// Endpoints protegidos con autenticación y permisos de ganado
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/motivos-baja",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.listarMotivosBajaController.run.bind(
				this.listarMotivosBajaController,
			),
		);

		this.router.get(
			"/importar/plantilla",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.plantillaController.run.bind(this.plantillaController),
		);

		this.router.post(
			"/importar/previsualizar",
			this.requirePermissionMiddleware.handle("ganado", "create"),
			this.previsualizarImportacionController.run.bind(
				this.previsualizarImportacionController,
			),
		);

		this.router.post(
			"/importar/confirmar",
			this.requirePermissionMiddleware.handle("ganado", "create"),
			this.confirmarImportacionController.run.bind(
				this.confirmarImportacionController,
			),
		);

		this.router.get(
			"/exportar/csv",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.exportarCsvController.run.bind(this.exportarCsvController),
		);

		this.router.get(
			"/:idOrIdentificador/ficha-pdf",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.exportarFichaPdfController.run.bind(this.exportarFichaPdfController),
		);

		this.router.get(
			"/:idOrIdentificador",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.obtenerFichaController.run.bind(this.obtenerFichaController),
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("ganado", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.get(
			"/:id/genealogia",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.genealogiaController.run.bind(this.genealogiaController),
		);

		this.router.get(
			"/:id/pesajes",
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.listarPesajesController.run.bind(this.listarPesajesController),
		);

		this.router.post(
			"/:id/pesajes",
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.pesajeController.run.bind(this.pesajeController),
		);

		this.router.post(
			"/:id/traslados",
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.trasladoController.run.bind(this.trasladoController),
		);

		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("ganado", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);

		this.router.post(
			"/:id/baja",
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.darDeBajaController.run.bind(this.darDeBajaController),
		);
	}
}

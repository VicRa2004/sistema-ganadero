import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { EliminarSesionSanitariaController } from "../controllers/EliminarSesionSanitariaController";
import type { ListarSesionesSanitariasController } from "../controllers/ListarSesionesSanitariasController";
import type { ObtenerDetalleSesionSanitariaController } from "../controllers/ObtenerDetalleSesionSanitariaController";
import type { ObtenerHistorialSanitarioGanadoController } from "../controllers/ObtenerHistorialSanitarioGanadoController";
import type { RegistrarResultadoAnimalController } from "../controllers/RegistrarResultadoAnimalController";
import type { RegistrarSesionSanitariaController } from "../controllers/RegistrarSesionSanitariaController";
import type { RealizarSesionSanitariaController } from "../controllers/RealizarSesionSanitariaController";
import type { CancelarSesionSanitariaController } from "../controllers/CancelarSesionSanitariaController";
import type { ObtenerCalendarioSanitarioController } from "../controllers/ObtenerCalendarioSanitarioController";
import type { CrearPlanSanitarioController } from "../controllers/CrearPlanSanitarioController";
import type { ListarPlanesSanitariosController } from "../controllers/ListarPlanesSanitariosController";
import type { ActualizarPlanSanitarioController } from "../controllers/ActualizarPlanSanitarioController";
import type { EliminarPlanSanitarioController } from "../controllers/EliminarPlanSanitarioController";
import type { GenerarSesionesPlanesController } from "../controllers/GenerarSesionesPlanesController";
import type { ExportarSesionesCsvController } from "../controllers/ExportarSesionesCsvController";
import type { ExportarSesionesPdfController } from "../controllers/ExportarSesionesPdfController";
import type { ExportarHistorialGanadoPdfController } from "../controllers/ExportarHistorialGanadoPdfController";

@injectable()
export class SesionSanitariaRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RegistrarSesionSanitariaController")
		private readonly registrarController: RegistrarSesionSanitariaController,
		@inject("ListarSesionesSanitariasController")
		private readonly listarController: ListarSesionesSanitariasController,
		@inject("ObtenerDetalleSesionSanitariaController")
		private readonly obtenerDetalleController: ObtenerDetalleSesionSanitariaController,
		@inject("RegistrarResultadoAnimalController")
		private readonly registrarResultadoController: RegistrarResultadoAnimalController,
		@inject("ObtenerHistorialSanitarioGanadoController")
		private readonly obtenerHistorialGanadoController: ObtenerHistorialSanitarioGanadoController,
		@inject("EliminarSesionSanitariaController")
		private readonly eliminarController: EliminarSesionSanitariaController,
		@inject("RealizarSesionSanitariaController")
		private readonly realizarController: RealizarSesionSanitariaController,
		@inject("CancelarSesionSanitariaController")
		private readonly cancelarController: CancelarSesionSanitariaController,
		@inject("ObtenerCalendarioSanitarioController")
		private readonly calendarioController: ObtenerCalendarioSanitarioController,
		@inject("CrearPlanSanitarioController")
		private readonly crearPlanController: CrearPlanSanitarioController,
		@inject("ListarPlanesSanitariosController")
		private readonly listarPlanesController: ListarPlanesSanitariosController,
		@inject("ActualizarPlanSanitarioController")
		private readonly actualizarPlanController: ActualizarPlanSanitarioController,
		@inject("EliminarPlanSanitarioController")
		private readonly eliminarPlanController: EliminarPlanSanitarioController,
		@inject("GenerarSesionesPlanesController")
		private readonly generarPlanesController: GenerarSesionesPlanesController,
		@inject("ExportarSesionesCsvController")
		private readonly exportarCsvController: ExportarSesionesCsvController,
		@inject("ExportarSesionesPdfController")
		private readonly exportarPdfController: ExportarSesionesPdfController,
		@inject("ExportarHistorialGanadoPdfController")
		private readonly exportarHistorialGanadoPdfController: ExportarHistorialGanadoPdfController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Todas las rutas requieren token JWT válido
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/calendario",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.calendarioController.run.bind(this.calendarioController),
		);

		this.router.get(
			"/exportar/csv",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.exportarCsvController.run.bind(this.exportarCsvController),
		);

		this.router.get(
			"/exportar/pdf",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.exportarPdfController.run.bind(this.exportarPdfController),
		);

		this.router.get(
			"/planes",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.listarPlanesController.run.bind(this.listarPlanesController),
		);

		this.router.post(
			"/planes",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "create"),
			this.crearPlanController.run.bind(this.crearPlanController),
		);

		this.router.post(
			"/planes/generar",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "create"),
			this.generarPlanesController.run.bind(this.generarPlanesController),
		);

		this.router.put(
			"/planes/:id",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "update"),
			this.actualizarPlanController.run.bind(this.actualizarPlanController),
		);

		this.router.delete(
			"/planes/:id",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "delete"),
			this.eliminarPlanController.run.bind(this.eliminarPlanController),
		);

		this.router.get(
			"/ganado/:ganadoId/historial",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.obtenerHistorialGanadoController.run.bind(
				this.obtenerHistorialGanadoController,
			),
		);

		this.router.get(
			"/ganado/:ganadoId/historial/pdf",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.exportarHistorialGanadoPdfController.run.bind(
				this.exportarHistorialGanadoPdfController,
			),
		);

		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.post(
			"/:id/realizar",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "update"),
			this.realizarController.run.bind(this.realizarController),
		);

		this.router.post(
			"/:id/cancelar",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "update"),
			this.cancelarController.run.bind(this.cancelarController),
		);

		this.router.post(
			"/aplicacion",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "update"),
			this.registrarResultadoController.run.bind(
				this.registrarResultadoController,
			),
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

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
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.obtenerDetalleController.run.bind(this.obtenerDetalleController),
		);

		this.router.get(
			"/ganado/:ganadoId/historial",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "read"),
			this.obtenerHistorialGanadoController.run.bind(
				this.obtenerHistorialGanadoController,
			),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.post(
			"/aplicacion",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "update"),
			this.registrarResultadoController.run.bind(
				this.registrarResultadoController,
			),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("sesiones-sanitarias", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

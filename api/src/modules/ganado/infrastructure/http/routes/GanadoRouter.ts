import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { RegistrarGanadoController } from "../controllers/RegistrarGanadoController";
import type { RegistrarPesajeController } from "../controllers/RegistrarPesajeController";
import type { TrasladarGanadoController } from "../controllers/TrasladarGanadoController";
import type { ObtenerFichaGanadoController } from "../controllers/ObtenerFichaGanadoController";
import type { ListarGanadosController } from "../controllers/ListarGanadosController";
import type { EliminarGanadoController } from "../controllers/EliminarGanadoController";
import type { ActualizarGanadoController } from "../controllers/ActualizarGanadoController";

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
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Endpoints protegidos con autenticación y permisos de ganado
		this.router.get(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/:idOrIdentificador",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "read"),
			this.obtenerFichaController.run.bind(this.obtenerFichaController),
		);

		this.router.post(
			"/",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "create"),
			this.registrarController.run.bind(this.registrarController),
		);

		this.router.post(
			"/:id/pesajes",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.pesajeController.run.bind(this.pesajeController),
		);

		this.router.post(
			"/:id/traslados",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.trasladoController.run.bind(this.trasladoController),
		);

		this.router.put(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.authMiddleware.handle,
			this.requirePermissionMiddleware.handle("ganado", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

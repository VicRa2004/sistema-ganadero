import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { ActualizarTratamientoController } from "../controllers/ActualizarTratamientoController";
import type { EliminarTratamientoController } from "../controllers/EliminarTratamientoController";
import type { FinalizarTratamientoController } from "../controllers/FinalizarTratamientoController";
import type { ListarTratamientosController } from "../controllers/ListarTratamientosController";
import type { ListarTratamientosPorGanadoController } from "../controllers/ListarTratamientosPorGanadoController";
import type { ObtenerTratamientoController } from "../controllers/ObtenerTratamientoController";
import type { RecetarTratamientoController } from "../controllers/RecetarTratamientoController";
import type { RegistrarAplicacionDiariaController } from "../controllers/RegistrarAplicacionDiariaController";

@injectable()
export class TratamientoMedicoRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("RecetarTratamientoController")
		private readonly recetarController: RecetarTratamientoController,
		@inject("RegistrarAplicacionDiariaController")
		private readonly registrarAplicacionController: RegistrarAplicacionDiariaController,
		@inject("FinalizarTratamientoController")
		private readonly finalizarController: FinalizarTratamientoController,
		@inject("ActualizarTratamientoController")
		private readonly actualizarController: ActualizarTratamientoController,
		@inject("ObtenerTratamientoController")
		private readonly obtenerController: ObtenerTratamientoController,
		@inject("ListarTratamientosController")
		private readonly listarController: ListarTratamientosController,
		@inject("ListarTratamientosPorGanadoController")
		private readonly listarPorGanadoController: ListarTratamientosPorGanadoController,
		@inject("EliminarTratamientoController")
		private readonly eliminarController: EliminarTratamientoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "read"),
			this.listarController.run.bind(this.listarController),
		);

		this.router.get(
			"/ganado/:ganadoId",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "read"),
			this.listarPorGanadoController.run.bind(this.listarPorGanadoController),
		);

		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "read"),
			this.obtenerController.run.bind(this.obtenerController),
		);

		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "create"),
			this.recetarController.run.bind(this.recetarController),
		);

		this.router.post(
			"/aplicacion",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "update"),
			this.registrarAplicacionController.run.bind(
				this.registrarAplicacionController,
			),
		);

		this.router.patch(
			"/:id/finalizar",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "update"),
			this.finalizarController.run.bind(this.finalizarController),
		);

		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "update"),
			this.actualizarController.run.bind(this.actualizarController),
		);

		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("tratamientos-medicos", "delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

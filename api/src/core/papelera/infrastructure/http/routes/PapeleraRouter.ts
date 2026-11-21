import { Hono } from "hono";
import type { Context, Next } from "hono";
import { inject, injectable } from "tsyringe";
import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import type { Accion } from "@/modules/authorization/domain/Recursos";
import {
	RECURSO_PAPELERA,
	TIPOS_PAPELERA,
	type TipoPapelera,
} from "../../../domain/TipoPapelera";
import type { EliminarDefinitivoController } from "../controllers/EliminarDefinitivoController";
import type { ListarPapeleraController } from "../controllers/ListarPapeleraController";
import type { RestaurarElementoController } from "../controllers/RestaurarElementoController";

// Solo casan los tipos válidos; el resto da 404
const TIPO = `:tipo{${TIPOS_PAPELERA.join("|")}}`;

@injectable()
export class PapeleraRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		@inject("ListarPapeleraController")
		private readonly listarController: ListarPapeleraController,
		@inject("RestaurarElementoController")
		private readonly restaurarController: RestaurarElementoController,
		@inject("EliminarDefinitivoController")
		private readonly eliminarController: EliminarDefinitivoController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	/** Exige el permiso del módulo dueño del tipo (p. ej. `ganado:delete`). */
	private permiso(accion: Accion) {
		return (c: Context, next: Next) =>
			this.requirePermissionMiddleware.handle(
				RECURSO_PAPELERA[c.req.param("tipo") as TipoPapelera],
				accion,
			)(c, next);
	}

	private initRoutes() {
		this.router.use(this.authMiddleware.handle);

		this.router.get(
			`/${TIPO}`,
			this.permiso("read"),
			this.listarController.run.bind(this.listarController),
		);
		this.router.post(
			`/${TIPO}/:id/restaurar`,
			this.permiso("update"),
			this.restaurarController.run.bind(this.restaurarController),
		);
		this.router.delete(
			`/${TIPO}/:id`,
			this.permiso("delete"),
			this.eliminarController.run.bind(this.eliminarController),
		);
	}
}

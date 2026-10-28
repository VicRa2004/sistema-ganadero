import { BaseError } from "./error/BaseError";

/** Usuario autenticado que ejecuta una operación. */
export interface Actor {
	id: number;
	role: string;
}

export const esAdmin = (actor: Actor): boolean => actor.role === "ADMIN";

/** Un ADMIN accede a todo; el resto solo a lo que le pertenece. */
export const puedeAcceder = (actor: Actor, usuarioIdDelRecurso: number) =>
	esAdmin(actor) || actor.id === usuarioIdDelRecurso;

/** Filtro de propiedad para repositorios: undefined = sin restricción (ADMIN). */
export const usuarioIdDeFiltro = (actor: Actor): number | undefined =>
	esAdmin(actor) ? undefined : actor.id;

/** Política de propiedad: lanza 403 con `mensaje` si el actor no puede acceder al recurso. */
export function assertPuedeAcceder(
	actor: Actor,
	usuarioIdDelRecurso: number,
	mensaje: string,
): void {
	if (!puedeAcceder(actor, usuarioIdDelRecurso)) {
		throw new BaseError(mensaje, 403);
	}
}

import * as Sentry from "@sentry/bun";

let activo = false;

/**
 * Inicializa el reporte de errores hacia Sentry o GlitchTip si hay `SENTRY_DSN`.
 * Sin DSN no hace nada; tampoco activa tracing, profiling ni replay.
 */
export function iniciarMonitoreo(dsn?: string, environment?: string): void {
	if (!dsn) {
		activo = false;
		return;
	}
	Sentry.init({
		dsn,
		environment,
		beforeSend: limpiarEvento,
	});
	activo = true;
}

/**
 * Elimina datos personales y contenido sensible del evento antes de enviarlo:
 * quita cuerpo, cookies, cabeceras y query; del usuario conserva solo el id;
 * y descarta breadcrumbs.
 */
export function limpiarEvento<T extends Sentry.ErrorEvent>(evento: T): T {
	if (evento.request) {
		evento.request = {
			method: evento.request.method,
			url: evento.request.url?.split("?")[0],
		};
	}
	if (evento.user) {
		evento.user =
			evento.user.id !== undefined ? { id: evento.user.id } : undefined;
	}
	// Los logs de consola y las consultas pueden llevar correos o contenido.
	evento.breadcrumbs = undefined;
	return evento;
}

/**
 * Reporta un error 5xx de una petición etiquetado con `requestId` y solo el id del usuario.
 */
export function reportarError(
	error: unknown,
	{ requestId, usuarioId }: { requestId?: string; usuarioId?: number },
): void {
	if (!activo) return;
	Sentry.withScope((scope) => {
		if (requestId) scope.setTag("requestId", requestId);
		if (usuarioId !== undefined) scope.setUser({ id: String(usuarioId) });
		Sentry.captureException(error);
	});
}

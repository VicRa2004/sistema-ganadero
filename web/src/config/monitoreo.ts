import * as Sentry from "@sentry/react";
import { isAxiosError } from "axios";

interface ApiErrorPayload {
	requestId?: string;
	error?: {
		requestId?: string;
	};
}

const dsnPorDefecto = (): string | undefined =>
	(import.meta.env.VITE_SENTRY_DSN as string | undefined) || undefined;

/**
 * Elimina datos personales y contenido sensible antes de enviar el evento:
 * quita cuerpo, cookies, cabeceras y query de la URL; del usuario conserva
 * solo el id; y descarta breadcrumbs.
 */
export function limpiarEvento<T extends Sentry.ErrorEvent>(evento: T): T {
	if (evento.request) {
		evento.request = {
			url: evento.request.url?.split("?")[0],
		};
	}
	evento.user =
		evento.user?.id !== undefined ? { id: evento.user.id } : undefined;
	// Los breadcrumbs (clics, consola, red) pueden llevar contenido o datos personales.
	evento.breadcrumbs = undefined;
	return evento;
}

/**
 * Inicializa Sentry o GlitchTip si se compiló con `VITE_SENTRY_DSN`; si no, no hace nada.
 * Sin Session Replay, sin profiling y con tracing desactivado.
 */
export function iniciarMonitoreo(dsn = dsnPorDefecto()): void {
	if (!dsn) return;
	Sentry.init({
		dsn,
		environment: import.meta.env.MODE,
		beforeSend: limpiarEvento,
	});
}

/**
 * Reporta errores capturados por los error boundaries.
 * Omite `AxiosError` porque los 5xx y fallos de red de la API ya se reportan
 * desde el cliente HTTP y los 4xx son esperables.
 */
export function reportarError(error: unknown, dsn = dsnPorDefecto()): void {
	if (!dsn || isAxiosError(error)) return;
	Sentry.captureException(error);
}

/**
 * Reporta errores 5xx de la API (con `requestId` para cruzarlo con el backend)
 * o fallos de red cuando el navegador está en línea. Ignora 4xx y modo offline.
 */
export function reportarErrorApi(error: unknown, dsn = dsnPorDefecto()): void {
	if (!dsn || !isAxiosError(error)) return;

	const status = error.response?.status;
	const sinRed =
		!error.response && (typeof navigator === "undefined" || navigator.onLine);
	if (!sinRed && (status === undefined || status < 500)) return;

	const data = error.response?.data as ApiErrorPayload | undefined;
	const headers = error.response?.headers as
		| { get?: (name: string) => unknown; [key: string]: unknown }
		| undefined;
	const headerRequestId =
		typeof headers?.get === "function"
			? ((headers.get("x-request-id") as string | null | undefined) ??
				undefined)
			: (headers?.["x-request-id"] as string | undefined);
	const requestId =
		data?.error?.requestId ?? data?.requestId ?? headerRequestId;

	Sentry.withScope((scope) => {
		if (requestId) scope.setTag("requestId", requestId);
		const metodo = error.config?.method?.toUpperCase() ?? "GET";
		const ruta = error.config?.url?.split("?")[0] ?? "";
		scope.setTag("api", `${metodo} ${ruta}`);
		Sentry.captureException(error);
	});
}

import type * as Sentry from "@sentry/react";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

const { initMock, captureExceptionMock, withScopeMock, setTagMock } =
	vi.hoisted(() => {
		const setTag = vi.fn();
		return {
			initMock: vi.fn(),
			captureExceptionMock: vi.fn(() => ""),
			setTagMock: setTag,
			withScopeMock: vi.fn(
				(cb: (scope: { setTag: typeof setTag }) => unknown) => cb({ setTag }),
			),
		};
	});

vi.mock("@sentry/react", async (importOriginal) => {
	const actual = await importOriginal<typeof Sentry>();
	return {
		...actual,
		init: initMock,
		captureException: captureExceptionMock,
		withScope: withScopeMock,
	};
});

import {
	iniciarMonitoreo,
	limpiarEvento,
	reportarError,
	reportarErrorApi,
} from "./monitoreo";

const DSN_PRUEBA = "https://clave@glitchtip.ejemplo.com/1";

function crearAxiosError(
	status: number | undefined,
	{
		method = "get",
		url = "/ganado?pagina=1",
		data,
		headers,
	}: {
		method?: string;
		url?: string;
		data?: unknown;
		headers?: Record<string, string>;
	} = {},
): AxiosError {
	const config = {
		method,
		url,
		headers: new AxiosHeaders(),
	};
	const response =
		status === undefined
			? undefined
			: {
					status,
					statusText: "Error",
					headers: headers ?? {},
					config,
					data,
				};
	return new AxiosError("Error HTTP", "ERR_BAD_RESPONSE", config, {}, response);
}

describe("limpiarEvento (web)", () => {
	it("quita cuerpo, cookies, cabeceras, query, breadcrumbs y datos personales del usuario", () => {
		const evento = limpiarEvento({
			type: undefined,
			request: {
				method: "POST",
				url: "https://ganadero.dev/api/ganado?buscar=secreto",
				data: { nombre: "privado" },
				cookies: { session: "abc" },
				headers: { authorization: "Bearer token" },
			},
			user: {
				id: "12",
				email: "usuario@ejemplo.com",
				username: "admin",
				ip_address: "10.0.0.1",
			},
			breadcrumbs: [{ message: "click en botón secreto" }],
		} as Sentry.ErrorEvent);

		expect(evento.request).toEqual({
			url: "https://ganadero.dev/api/ganado",
		});
		expect(evento.user).toEqual({ id: "12" });
		expect(evento.breadcrumbs).toBeUndefined();
	});

	it("deja user en undefined cuando no tiene id", () => {
		const evento = limpiarEvento({
			type: undefined,
			user: { email: "usuario@ejemplo.com" },
		} as Sentry.ErrorEvent);

		expect(evento.user).toBeUndefined();
	});
});

describe("iniciarMonitoreo (web)", () => {
	afterEach(() => {
		initMock.mockClear();
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("no inicializa Sentry sin VITE_SENTRY_DSN", () => {
		iniciarMonitoreo(undefined);
		iniciarMonitoreo("");

		expect(initMock).not.toHaveBeenCalled();
	});

	it("inicializa Sentry con beforeSend=limpiarEvento cuando hay DSN", () => {
		iniciarMonitoreo(DSN_PRUEBA);

		expect(initMock).toHaveBeenCalledTimes(1);
		expect(initMock).toHaveBeenCalledWith(
			expect.objectContaining({
				dsn: DSN_PRUEBA,
				beforeSend: limpiarEvento,
			}),
		);
	});
});

describe("reportarError y reportarErrorApi (web)", () => {
	afterEach(() => {
		initMock.mockClear();
		captureExceptionMock.mockClear();
		withScopeMock.mockClear();
		setTagMock.mockClear();
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("no envía nada cuando no hay DSN", () => {
		vi.stubEnv("VITE_SENTRY_DSN", "");

		reportarError(new Error("fallo render"));
		reportarErrorApi(crearAxiosError(500));

		expect(captureExceptionMock).not.toHaveBeenCalled();
	});

	it("reportarError envía errores de render/boundary e ignora AxiosError", () => {
		vi.stubEnv("VITE_SENTRY_DSN", DSN_PRUEBA);

		const errorRender = new Error("fallo en componente");
		reportarError(errorRender);
		reportarError(crearAxiosError(404));
		reportarError(crearAxiosError(500));

		expect(captureExceptionMock).toHaveBeenCalledTimes(1);
		expect(captureExceptionMock).toHaveBeenCalledWith(errorRender);
	});

	it("reportarErrorApi ignora 4xx, envía 5xx con requestId y api sin query", () => {
		vi.stubEnv("VITE_SENTRY_DSN", DSN_PRUEBA);

		for (const status of [400, 401, 404, 422]) {
			reportarErrorApi(crearAxiosError(status));
		}
		expect(captureExceptionMock).not.toHaveBeenCalled();

		const error500 = crearAxiosError(500, {
			method: "post",
			url: "/ganado?filtro=privado",
			data: { error: { code: "INTERNAL_ERROR", requestId: "req-web-500" } },
		});
		reportarErrorApi(error500);

		expect(setTagMock).toHaveBeenCalledWith("requestId", "req-web-500");
		expect(setTagMock).toHaveBeenCalledWith("api", "POST /ganado");
		expect(captureExceptionMock).toHaveBeenCalledTimes(1);
		expect(captureExceptionMock).toHaveBeenCalledWith(error500);
	});

	it("reportarErrorApi envía fallo de red en línea e ignora cuando está offline", () => {
		vi.stubEnv("VITE_SENTRY_DSN", DSN_PRUEBA);

		vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
		const errorRed = crearAxiosError(undefined, {
			method: "get",
			url: "/propietarios?q=secret",
		});
		reportarErrorApi(errorRed);

		expect(setTagMock).toHaveBeenCalledWith("api", "GET /propietarios");
		expect(captureExceptionMock).toHaveBeenCalledTimes(1);

		vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
		reportarErrorApi(crearAxiosError(undefined));

		expect(captureExceptionMock).toHaveBeenCalledTimes(1);
	});
});

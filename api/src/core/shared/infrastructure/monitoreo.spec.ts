import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import * as Sentry from "@sentry/bun";
import type { ErrorEvent } from "@sentry/bun";
import { iniciarMonitoreo, limpiarEvento, reportarError } from "./monitoreo";

describe("limpiarEvento (backend)", () => {
	it("quita cuerpo, cookies, cabeceras, query, breadcrumbs y datos del usuario salvo el id", () => {
		const evento = limpiarEvento({
			type: undefined,
			request: {
				method: "POST",
				url: "https://app.dev/api/ganado?token=secreto",
				query_string: "token=secreto",
				data: { arete: "001", password: "123" },
				cookies: { refreshToken: "abc" },
				headers: { authorization: "Bearer x", cookie: "refreshToken=abc" },
			},
			user: {
				id: "7",
				email: "ganadero@ejemplo.com",
				username: "victor",
				ip_address: "1.2.3.4",
			},
			breadcrumbs: [{ message: "correo enviado a ganadero@ejemplo.com" }],
		} as ErrorEvent);

		expect(evento.request).toEqual({
			method: "POST",
			url: "https://app.dev/api/ganado",
		});
		expect(evento.user).toEqual({ id: "7" });
		expect(evento.breadcrumbs).toBeUndefined();
	});

	it("descarta user completo si no trae id", () => {
		const evento = limpiarEvento({
			type: undefined,
			user: { email: "sin-id@ejemplo.com", ip_address: "1.2.3.4" },
		} as ErrorEvent);

		expect(evento.user).toBeUndefined();
	});
});

describe("iniciarMonitoreo (backend)", () => {
	const spies: Array<{ mockRestore: () => void }> = [];

	afterEach(() => {
		iniciarMonitoreo(undefined);
		while (spies.length > 0) {
			spies.pop()?.mockRestore();
		}
	});

	it("no inicializa Sentry cuando no hay DSN", () => {
		const initSpy = spyOn(Sentry, "init").mockImplementation(
			() => undefined as never,
		);
		spies.push(initSpy);

		iniciarMonitoreo(undefined, "prod");
		iniciarMonitoreo("", "prod");

		expect(initSpy).not.toHaveBeenCalled();
	});

	it("inicializa Sentry con environment y beforeSend=limpiarEvento cuando hay DSN", () => {
		const initSpy = spyOn(Sentry, "init").mockImplementation(
			() => undefined as never,
		);
		spies.push(initSpy);

		iniciarMonitoreo("https://clave@glitchtip.ejemplo.com/1", "prod");

		expect(initSpy).toHaveBeenCalledTimes(1);
		expect(initSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				dsn: "https://clave@glitchtip.ejemplo.com/1",
				environment: "prod",
				beforeSend: limpiarEvento,
			}),
		);
	});
});

describe("reportarError (backend)", () => {
	const spies: Array<{ mockRestore: () => void }> = [];

	afterEach(() => {
		iniciarMonitoreo(undefined);
		while (spies.length > 0) {
			spies.pop()?.mockRestore();
		}
	});

	it("no envía nada si no se inicializó monitoreo", () => {
		const captureSpy = spyOn(Sentry, "captureException").mockImplementation(
			() => "",
		);
		spies.push(captureSpy);

		reportarError(new Error("fallo"), { requestId: "req-1", usuarioId: 5 });

		expect(captureSpy).not.toHaveBeenCalled();
	});

	it("etiqueta requestId y solo el id del usuario tras iniciarMonitoreo con DSN", () => {
		const initSpy = spyOn(Sentry, "init").mockImplementation(
			() => undefined as never,
		);
		const setTag = mock(() => undefined);
		const setUser = mock(() => undefined);
		const withScopeSpy = spyOn(Sentry, "withScope").mockImplementation((cb) =>
			cb({ setTag, setUser } as unknown as Sentry.Scope),
		);
		const captureSpy = spyOn(Sentry, "captureException").mockImplementation(
			() => "",
		);
		spies.push(initSpy, withScopeSpy, captureSpy);

		iniciarMonitoreo("https://clave@glitchtip.ejemplo.com/1", "prod");
		const err = new Error("fallo interno");
		reportarError(err, { requestId: "req-500", usuarioId: 42 });

		expect(setTag).toHaveBeenCalledWith("requestId", "req-500");
		expect(setUser).toHaveBeenCalledWith({ id: "42" });
		expect(captureSpy).toHaveBeenCalledWith(err);
	});
});

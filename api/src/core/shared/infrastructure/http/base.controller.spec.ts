import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { Prisma } from "@/generated/prisma/client";
import { BaseError } from "../../domain/error/BaseError";
import { BaseController } from "./base.controller";

class ControllerDePrueba extends BaseController {
	run = async (c: import("hono").Context) =>
		this.executeSafely(c, async () => {
			const caso = c.req.query("caso");
			if (caso === "json") await c.req.json();
			if (caso === "base") throw new BaseError("Mensaje de negocio", 422);
			if (caso === "p2002") throw prismaError("P2002");
			if (caso === "p2025") throw prismaError("P2025");
			if (caso === "p2003") throw prismaError("P2003");
			if (caso === "p2000") throw prismaError("P2000");
			if (caso === "secreto") {
				throw new Error('relation "user" column usr_password does not exist');
			}
			return this.ok(c, { ok: true });
		});
}

const prismaError = (code: string) =>
	new Prisma.PrismaClientKnownRequestError(
		"Invalid `prisma.user.create()` invocation: detalle interno de la BD",
		{ code, clientVersion: "test" },
	);

describe("BaseController.handleError", () => {
	const app = new Hono();
	app.use("*", requestId());
	const controller = new ControllerDePrueba();
	app.post("/", controller.run);

	let consoleError: ReturnType<typeof spyOn>;
	beforeEach(() => {
		consoleError = spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => consoleError.mockRestore());

	const llamar = (caso: string, body?: string) =>
		app.request(`/?caso=${caso}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body,
		});

	it("no expone el mensaje de errores inesperados y devuelve el requestId", async () => {
		const res = await llamar("secreto");
		const body = (await res.json()) as {
			error: { code: string; message: string; requestId: string };
		};

		expect(res.status).toBe(500);
		expect(body.error.code).toBe("INTERNAL_ERROR");
		expect(body.error.message).toBe("Error interno del servidor");
		expect(JSON.stringify(body)).not.toContain("usr_password");
		expect(body.error.requestId).toBeTruthy();
		expect(res.headers.get("X-Request-Id")).toBe(body.error.requestId);
	});

	it("registra el detalle real en el servidor junto al requestId", async () => {
		const res = await llamar("secreto");
		const {
			error: { requestId: id },
		} = (await res.json()) as { error: { requestId: string } };

		const [mensaje, error] = consoleError.mock.calls[0] as [string, Error];
		expect(mensaje).toContain(id);
		expect(error.message).toContain("usr_password");
	});

	it("mapea los errores de Prisma sin filtrar su mensaje", async () => {
		const casos: [string, number, string][] = [
			["p2002", 409, "Ya existe un registro con esos datos"],
			["p2003", 409, "La operación entra en conflicto con datos relacionados"],
			["p2025", 404, "El registro solicitado no existe"],
		];
		for (const [caso, status, mensaje] of casos) {
			const res = await llamar(caso);
			expect(res.status).toBe(status);
			const { error } = (await res.json()) as { error: { message: string } };
			expect(error.message).toBe(mensaje);
		}
	});

	it("un error de Prisma sin mapeo se trata como interno", async () => {
		const res = await llamar("p2000");
		const body = (await res.json()) as { error: { message: string } };
		expect(res.status).toBe(500);
		expect(body.error.message).toBe("Error interno del servidor");
	});

	it("conserva el mensaje y el código de los BaseError", async () => {
		const res = await llamar("base");
		expect(res.status).toBe(422);
		const { error } = (await res.json()) as { error: { message: string } };
		expect(error.message).toBe("Mensaje de negocio");
	});

	it("responde 400 ante un JSON malformado", async () => {
		const res = await llamar("json", "{no es json");
		expect(res.status).toBe(400);
		const { error } = (await res.json()) as { error: { message: string } };
		expect(error.message).toBe("El cuerpo de la petición no es un JSON válido");
	});
});

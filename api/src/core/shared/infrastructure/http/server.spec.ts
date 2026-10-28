import { describe, expect, it } from "bun:test";
import { app } from "./server";

const post = (path: string, body: BodyInit, contentType: string) =>
	app.request(path, {
		method: "POST",
		headers: { "Content-Type": contentType },
		body,
	});

describe("límites de tamaño del body", () => {
	it("rechaza con 413 un JSON mayor a BODY_MAX_SIZE (100 KB por defecto)", async () => {
		const grande = JSON.stringify({
			email: "a@b.com",
			relleno: "x".repeat(150_000),
		});
		const res = await post("/api/auth/login", grande, "application/json");

		expect(res.status).toBe(413);
		const { error } = (await res.json()) as { error: { message: string } };
		expect(error.message).toBe(
			"El cuerpo de la petición excede el tamaño máximo",
		);
	});

	it("acepta JSON dentro del límite", async () => {
		const res = await post(
			"/api/auth/login",
			JSON.stringify({ email: "a@b.com", password: "" }),
			"application/json",
		);
		expect(res.status).not.toBe(413);
	});

	it("permite multipart mayor al límite JSON (imágenes) hasta UPLOAD_MAX_SIZE + 1 MB", async () => {
		const data = new FormData();
		data.append("nombre", "x".repeat(300_000));
		const res = await app.request("/api/propietarios", {
			method: "POST",
			body: data,
		});
		// Sin token llega a la autenticación (401), es decir, superó el límite de tamaño
		expect(res.status).toBe(401);
	});

	it("rechaza con 413 un multipart que excede el máximo de subida", async () => {
		const res = await app.request("/api/propietarios", {
			method: "POST",
			headers: {
				"Content-Type": "multipart/form-data; boundary=x",
				"Content-Length": String(7 * 1024 * 1024),
			},
			body: "--x--",
		});
		expect(res.status).toBe(413);
	});
});

describe("documentación de la API (M-6)", () => {
	it("está disponible fuera de producción", async () => {
		expect((await app.request("/api-docs.json")).status).toBe(200);
		expect((await app.request("/api-docs")).status).toBe(200);
	});

	const estadoDocs = async (env: Record<string, string>) => {
		const script = `
			import { app } from "@/core/shared/infrastructure/http/server";
			const a = (await app.request("/api-docs")).status;
			const b = (await app.request("/api-docs.json")).status;
			console.log(JSON.stringify([a, b]));
		`;
		const proc = Bun.spawn(
			["bun", "--preload", "reflect-metadata", "-e", script],
			{
				cwd: `${import.meta.dir}/../../../../..`,
				env: {
					PATH: process.env.PATH as string,
					DATABASE_URL: "postgresql://u:p@localhost:5432/d",
					JWT_SECRET: "k9Zr2vQe7LpXw4TnB8cYd1HsFg6JmUa3",
					...env,
				},
				stdout: "pipe",
				stderr: "pipe",
			},
		);
		const salida = await new Response(proc.stdout).text();
		await proc.exited;
		return JSON.parse(salida.trim().split("\n").pop() as string) as number[];
	};

	it("no se expone en producción por defecto", async () => {
		expect(await estadoDocs({ NODE_ENV: "prod" })).toEqual([404, 404]);
		expect(await estadoDocs({ NODE_ENV: "production" })).toEqual([404, 404]);
	});

	it("se puede activar explícitamente en producción con ENABLE_API_DOCS=true", async () => {
		expect(
			await estadoDocs({ NODE_ENV: "prod", ENABLE_API_DOCS: "true" }),
		).toEqual([200, 200]);
	});

	it("se puede desactivar en desarrollo con ENABLE_API_DOCS=false", async () => {
		expect(
			await estadoDocs({ NODE_ENV: "dev", ENABLE_API_DOCS: "false" }),
		).toEqual([404, 404]);
	});
});

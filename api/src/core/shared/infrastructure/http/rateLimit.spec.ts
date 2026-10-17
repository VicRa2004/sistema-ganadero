import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { rateLimit } from "./rateLimit";

const crearApp = (options: Parameters<typeof rateLimit>[0]) => {
	const app = new Hono();
	app.use("*", rateLimit(options));
	app.post("/", (c) =>
		c.json({ ok: true }, c.req.header("x-fail") ? 401 : 200),
	);
	return app;
};

describe("rateLimit", () => {
	it("debería responder 429 con Retry-After al superar el máximo", async () => {
		const app = crearApp({ windowMs: 60_000, max: 2 });

		expect((await app.request("/", { method: "POST" })).status).toBe(200);
		expect((await app.request("/", { method: "POST" })).status).toBe(200);

		const res = await app.request("/", { method: "POST" });
		expect(res.status).toBe(429);
		expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
	});

	it("debería separar los contadores por clave", async () => {
		const app = crearApp({
			windowMs: 60_000,
			max: 1,
			keyGenerator: (c) => c.req.header("x-key") ?? "",
		});

		expect(
			(await app.request("/", { method: "POST", headers: { "x-key": "a" } }))
				.status,
		).toBe(200);
		expect(
			(await app.request("/", { method: "POST", headers: { "x-key": "b" } }))
				.status,
		).toBe(200);
		expect(
			(await app.request("/", { method: "POST", headers: { "x-key": "a" } }))
				.status,
		).toBe(429);
	});

	it("no debería consumir cupo con respuestas exitosas si skipSuccessfulRequests", async () => {
		const app = crearApp({
			windowMs: 60_000,
			max: 1,
			skipSuccessfulRequests: true,
		});

		for (let i = 0; i < 3; i++) {
			expect((await app.request("/", { method: "POST" })).status).toBe(200);
		}

		const fail = { method: "POST", headers: { "x-fail": "1" } };
		expect((await app.request("/", fail)).status).toBe(401);
		expect((await app.request("/", fail)).status).toBe(429);
	});

	it("debería reiniciar el contador al terminar la ventana", async () => {
		const app = crearApp({ windowMs: 20, max: 1 });

		expect((await app.request("/", { method: "POST" })).status).toBe(200);
		expect((await app.request("/", { method: "POST" })).status).toBe(429);
		await Bun.sleep(30);
		expect((await app.request("/", { method: "POST" })).status).toBe(200);
	});
});

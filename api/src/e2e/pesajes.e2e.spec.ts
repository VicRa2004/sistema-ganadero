/**
 * E2E contra una BD real (migraciones aplicadas y `bun prisma/seed.ts` ejecutado).
 * Se omite salvo que se indique E2E_DATABASE_URL (ver aislamiento-usuarios.e2e.spec.ts).
 */
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import jwt from "jsonwebtoken";

const E2E_URL = process.env.E2E_DATABASE_URL;
if (E2E_URL) {
	process.env.DATABASE_URL = E2E_URL;
}
process.env.JWT_SECRET ??= "e2e-secret";

type App = { request: (path: string, init?: RequestInit) => Promise<Response> };
type Prisma = typeof import("@/core/config/prisma").prisma;

interface Historial {
	pesajes: {
		peso: number;
		fecha: string;
		observaciones: string | null;
		gananciaDiaria: number | null;
	}[];
	gananciaDiariaAcumulada: number | null;
	perdidaDePeso: boolean;
}

describe.skipIf(!E2E_URL)("Historial de pesajes (e2e)", () => {
	let app: App;
	let prisma: Prisma;
	const sufijo = Date.now();
	const usuarios: Record<string, { id: number; token: string }> = {};
	let terrenoId: number;
	let propietarioId: number;
	let razaId: number;
	let contador = 0;

	const crearUsuario = async (clave: string) => {
		const user = await prisma.user.create({
			data: {
				email: `${clave}-pesaje-${sufijo}@e2e.test`,
				name: clave,
				password: "x",
				roles: { create: { role: { connect: { name: "USER" } } } },
			},
		});
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "15m" },
		);
		usuarios[clave] = { id: user.id, token };
	};

	const call = (
		clave: string,
		method: string,
		path: string,
		body?: Record<string, unknown> | FormData,
	) => {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${usuarios[clave]?.token}`,
		};
		let payload: BodyInit | undefined;
		if (body instanceof FormData) {
			payload = body;
		} else if (body) {
			headers["Content-Type"] = "application/json";
			payload = JSON.stringify(body);
		}
		return app.request(path, { method, headers, body: payload });
	};

	const form = (campos: Record<string, string | number>) => {
		const data = new FormData();
		for (const [k, v] of Object.entries(campos)) data.append(k, String(v));
		return data;
	};

	const crearGanado = async (peso: number) => {
		contador += 1;
		const res = await call(
			"a",
			"POST",
			"/api/ganado",
			form({
				identificador: `PES-${sufijo}-${contador}`,
				peso,
				fechaNacimiento: "2024-01-01",
				sexo: "MACHO",
				razaId,
				terrenoId,
				propietarioId,
			}),
		);
		expect(res.status).toBe(201);
		return ((await res.json()) as { id: number }).id;
	};

	const historial = async (id: number, clave = "a") => {
		const res = await call(clave, "GET", `/api/ganado/${id}/pesajes`);
		expect(res.status).toBe(200);
		return (await res.json()) as Historial;
	};

	const pesoDe = async (id: number) =>
		(await prisma.ganado.findUniqueOrThrow({ where: { id } })).peso;

	beforeAll(async () => {
		({ prisma } = await import("@/core/config/prisma"));
		({ app } = await import("@/core/shared/infrastructure/http/server"));

		await crearUsuario("a");
		await crearUsuario("b");

		const terreno = await prisma.terreno.create({
			data: {
				nombre: "T",
				ubicacion: "x",
				extensionHectareas: 1,
				capacidadMaxima: 1000,
				usuarioId: usuarios.a?.id as number,
			},
		});
		terrenoId = terreno.id;
		const propietario = await prisma.propietario.create({
			data: { nombre: "P", usuarioId: usuarios.a?.id as number },
		});
		propietarioId = propietario.id;
		razaId = (
			(await prisma.raza.findFirst()) ??
			(await prisma.raza.create({ data: { nombre: `R-${sufijo}` } }))
		).id;
	});

	afterAll(async () => {
		if (!prisma) return;
		const ids = Object.values(usuarios).map((u) => u.id);
		await prisma.ganado.deleteMany({ where: { terrenoId } });
		await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
		await prisma.user.deleteMany({ where: { id: { in: ids } } });
	});

	it("al registrar un animal su peso inicial queda como primer pesaje", async () => {
		const id = await crearGanado(300);
		const { pesajes } = await historial(id);

		expect(pesajes).toHaveLength(1);
		expect(pesajes[0]?.peso).toBe(300);
		expect(pesajes[0]?.gananciaDiaria).toBeNull();
	});

	it("cada pesaje se inserta, calcula la GDP y actualiza el peso del animal", async () => {
		const id = await crearGanado(300);
		const base = new Date();
		base.setUTCDate(base.getUTCDate() - 40);
		const dia = (n: number) =>
			new Date(base.getTime() + n * 86_400_000).toISOString();

		// El peso inicial queda fechado "ahora"; los pesajes de prueba son anteriores
		await prisma.pesaje.deleteMany({ where: { ganadoId: id } });
		for (const [n, peso] of [
			[0, 300],
			[10, 320],
		] as const) {
			const res = await call("a", "POST", `/api/ganado/${id}/pesajes`, {
				peso,
				fecha: dia(n),
				observaciones: `día ${n}`,
			});
			expect(res.status).toBe(200);
		}

		const h = await historial(id);
		expect(h.pesajes.map((p) => p.peso)).toEqual([300, 320]);
		expect(h.pesajes[1]?.gananciaDiaria).toBeCloseTo(2, 5);
		expect(h.gananciaDiariaAcumulada).toBeCloseTo(2, 5);
		expect(h.perdidaDePeso).toBe(false);
		expect(await pesoDe(id)).toBe(320);

		const res = await call("a", "POST", `/api/ganado/${id}/pesajes`, {
			peso: 310,
			fecha: dia(20),
		});
		expect(res.status).toBe(200);
		expect((await historial(id)).perdidaDePeso).toBe(true);
		expect(await pesoDe(id)).toBe(310);
	});

	it("un pesaje con fecha anterior al último no cambia el peso actual", async () => {
		const id = await crearGanado(300);
		const res = await call("a", "POST", `/api/ganado/${id}/pesajes`, {
			peso: 250,
			fecha: "2025-01-01",
		});
		expect(res.status).toBe(200);

		const h = await historial(id);
		expect(h.pesajes.map((p) => p.peso)).toEqual([250, 300]);
		expect(await pesoDe(id)).toBe(300);
	});

	it("rechaza fechas futuras, anteriores al nacimiento y pesos no positivos", async () => {
		const id = await crearGanado(300);
		const futura = new Date(Date.now() + 2 * 86_400_000).toISOString();

		for (const body of [
			{ peso: 310, fecha: futura },
			{ peso: 310, fecha: "2020-01-01" },
			{ peso: 0 },
			{ peso: 310, fecha: "no-es-fecha" },
		]) {
			const res = await call("a", "POST", `/api/ganado/${id}/pesajes`, body);
			expect({ body, status: res.status }).toEqual({ body, status: 400 });
		}
		expect((await historial(id)).pesajes).toHaveLength(1);
	});

	it("editar el peso desde PUT queda registrado como pesaje", async () => {
		const id = await crearGanado(300);
		const res = await call(
			"a",
			"PUT",
			`/api/ganado/${id}`,
			form({ peso: 340 }),
		);
		expect(res.status).toBe(200);

		expect((await historial(id)).pesajes.map((p) => p.peso)).toEqual([
			300, 340,
		]);
		expect(await pesoDe(id)).toBe(340);

		// Editar otro campo no crea pesajes ni toca el peso
		const otro = await call(
			"a",
			"PUT",
			`/api/ganado/${id}`,
			form({ identificador: `PES-ED-${sufijo}` }),
		);
		expect(otro.status).toBe(200);
		expect((await historial(id)).pesajes).toHaveLength(2);
		expect(await pesoDe(id)).toBe(340);
	});

	it("pesajes simultáneos: el peso del animal coincide con el más reciente", async () => {
		const id = await crearGanado(300);
		const respuestas = await Promise.all(
			Array.from({ length: 10 }, (_, i) =>
				call("a", "POST", `/api/ganado/${id}/pesajes`, {
					peso: 310 + i,
					fecha: new Date(Date.now() - (10 - i) * 60_000).toISOString(),
				}),
			),
		);
		expect(respuestas.every((r) => r.status === 200)).toBe(true);

		const { pesajes } = await historial(id);
		expect(pesajes).toHaveLength(11);
		const masReciente = [...pesajes].sort(
			(x, y) => Date.parse(y.fecha) - Date.parse(x.fecha),
		)[0];
		expect(await pesoDe(id)).toBe(masReciente?.peso as number);
	});

	it("otro usuario recibe 404 al leer el historial", async () => {
		const id = await crearGanado(300);
		const res = await call("b", "GET", `/api/ganado/${id}/pesajes`);
		expect(res.status).toBe(404);
	});
});

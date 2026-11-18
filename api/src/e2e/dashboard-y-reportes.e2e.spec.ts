/**
 * E2E de Dashboard, Importación CSV de Ganado y Exportación CSV/PDF.
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

describe.skipIf(!E2E_URL)("Dashboard y reportes (e2e)", () => {
	let app: App;
	let prisma: Prisma;
	const sufijo = Date.now();
	let userA: { id: number; token: string };
	let userB: { id: number; token: string };
	let razaNombre: string;
	let terrenoNombre: string;
	let propietarioNombre: string;
	let ganadoId: number;

	const crearUsuario = async (clave: string, roleName: "USER" | "ADMIN") => {
		const user = await prisma.user.create({
			data: {
				email: `${clave}-dash-${sufijo}@e2e.test`,
				name: clave,
				password: "hash-no-usado-en-e2e",
			},
		});
		const role = await prisma.role.findUniqueOrThrow({
			where: { name: roleName },
		});
		await prisma.userRole.create({
			data: { userId: user.id, roleId: role.id },
		});
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: roleName },
			process.env.JWT_SECRET as string,
			{ algorithm: "HS256", expiresIn: "1h" },
		);
		return { id: user.id, token };
	};

	const api = (token: string, path: string, method = "GET", body?: unknown) => {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${token}`,
		};
		let payload: BodyInit | undefined;
		if (body instanceof FormData) {
			payload = body;
		} else if (body !== undefined) {
			headers["Content-Type"] = "application/json";
			payload = JSON.stringify(body);
		}
		return app.request(path, { method, headers, body: payload });
	};

	const form = (campos: Record<string, string | number>) => {
		const fd = new FormData();
		for (const [k, v] of Object.entries(campos)) fd.append(k, String(v));
		return fd;
	};

	beforeAll(async () => {
		await import("reflect-metadata");
		({ app } = await import("@/core/shared/infrastructure/http/server"));
		({ prisma } = await import("@/core/config/prisma"));

		userA = await crearUsuario("dash-a", "USER");
		userB = await crearUsuario("dash-b", "USER");

		const raza = await prisma.raza.findFirstOrThrow();
		razaNombre = raza.nombre;

		terrenoNombre = `Potrero Dash ${sufijo}`;
		const resT = await api(
			userA.token,
			"/api/terrenos",
			"POST",
			form({
				nombre: terrenoNombre,
				ubicacion: "Sur",
				extensionHectareas: 15,
				capacidadMaxima: 10,
			}),
		);
		expect(resT.status).toBe(201);
		const terreno = (await resT.json()) as { id: number };

		propietarioNombre = `Prop Dash ${sufijo}`;
		const resP = await api(
			userA.token,
			"/api/propietarios",
			"POST",
			form({
				nombre: propietarioNombre,
			}),
		);
		expect(resP.status).toBe(201);
		const prop = (await resP.json()) as { id: number };

		const resG = await api(
			userA.token,
			"/api/ganado",
			"POST",
			form({
				identificador: `AR-DSH-${sufijo}`,
				peso: 410,
				fechaNacimiento: "2024-05-10",
				sexo: "MACHO",
				razaId: raza.id,
				terrenoId: terreno.id,
				propietarioId: prop.id,
			}),
		);
		expect(resG.status).toBe(201);
		ganadoId = ((await resG.json()) as { id: number }).id;
	});

	afterAll(async () => {
		if (!E2E_URL) return;
		const ids = [userA.id, userB.id];
		await prisma.ganado.deleteMany({
			where: { terreno: { usuarioId: { in: ids } } },
		});
		await prisma.terreno.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.propietario.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
		await prisma.user.deleteMany({ where: { id: { in: ids } } });
	});

	it("GET /api/dashboard/resumen devuelve KPIs aislados por usuario", async () => {
		const resA = await api(userA.token, "/api/dashboard/resumen");
		expect(resA.status).toBe(200);
		const dashA = (await resA.json()) as {
			totales: { cabezasActivas: number; pesoPromedioKg: number };
			porTerreno: Array<{ nombre: string; cabezas: number }>;
			altasYBajasPorMes: Array<{ mes: string; altas: number; bajas: number }>;
		};
		expect(dashA.totales.cabezasActivas).toBe(1);
		expect(dashA.totales.pesoPromedioKg).toBe(410);
		expect(dashA.porTerreno[0]?.cabezas).toBe(1);
		expect(dashA.altasYBajasPorMes).toHaveLength(6);

		const resB = await api(userB.token, "/api/dashboard/resumen");
		expect(resB.status).toBe(200);
		const dashB = (await resB.json()) as {
			totales: { cabezasActivas: number };
		};
		expect(dashB.totales.cabezasActivas).toBe(0);
	});

	it("importar ganado CSV previsualiza errores sin insertar y confirma filas válidas", async () => {
		const resPlantilla = await api(
			userA.token,
			"/api/ganado/importar/plantilla",
		);
		expect(resPlantilla.status).toBe(200);
		const plantilla = await resPlantilla.text();
		expect(plantilla).toContain("identificador,sexo,peso,fechaNacimiento");

		const csvConError = [
			"identificador,sexo,peso,fechaNacimiento,raza,terreno,propietario",
			`IMP-1-${sufijo},HEMBRA,320,2024-06-01,${razaNombre},${terrenoNombre},${propietarioNombre}`,
			`IMP-2-${sufijo},INVALIDO,-5,2099-01-01,RazaInexistente,${terrenoNombre},${propietarioNombre}`,
		].join("\n");

		const resPrev = await api(
			userA.token,
			"/api/ganado/importar/previsualizar",
			"POST",
			{ csv: csvConError },
		);
		expect(resPrev.status).toBe(200);
		const prev = (await resPrev.json()) as {
			totalFilas: number;
			validasCount: number;
			erroresCount: number;
			filas: Array<{ fila: number; valido: boolean; errores: string[] }>;
		};
		expect(prev.totalFilas).toBe(2);
		expect(prev.validasCount).toBe(1);
		expect(prev.erroresCount).toBe(1);
		expect(prev.filas[1]?.errores.length).toBeGreaterThanOrEqual(2);

		// Confirmar el CSV con error debe rechazar con 400 y NO insertar ni la fila 1
		const resConfErr = await api(
			userA.token,
			"/api/ganado/importar/confirmar",
			"POST",
			{ csv: csvConError },
		);
		expect(resConfErr.status).toBe(400);

		const existeImp1 = await prisma.ganado.findFirst({
			where: { identificador: `IMP-1-${sufijo}` },
		});
		expect(existeImp1).toBeNull();

		// CSV válido sí inserta atómicamente con pesaje inicial
		const csvValido = [
			"identificador,sexo,peso,fechaNacimiento,raza,terreno,propietario",
			`IMP-OK1-${sufijo},HEMBRA,340,2024-06-01,${razaNombre},${terrenoNombre},${propietarioNombre}`,
			`IMP-OK2-${sufijo},MACHO,390,2024-07-15,${razaNombre},${terrenoNombre},${propietarioNombre}`,
		].join("\n");

		const resConfOk = await api(
			userA.token,
			"/api/ganado/importar/confirmar",
			"POST",
			{ csv: csvValido },
		);
		expect(resConfOk.status).toBe(201);
		const confData = (await resConfOk.json()) as { insertados: number };
		expect(confData.insertados).toBe(2);
	});

	it("exporta CSV y PDF respetando aislamiento de usuario", async () => {
		const resCsvA = await api(userA.token, "/api/ganado/exportar/csv");
		expect(resCsvA.status).toBe(200);
		const csvTextA = await resCsvA.text();
		expect(csvTextA).toContain(`AR-DSH-${sufijo}`);

		const resCsvB = await api(userB.token, "/api/ganado/exportar/csv");
		expect(resCsvB.status).toBe(200);
		expect(await resCsvB.text()).not.toContain(`AR-DSH-${sufijo}`);

		const resPdfA = await api(userA.token, `/api/ganado/${ganadoId}/ficha-pdf`);
		expect(resPdfA.status).toBe(200);
		expect(resPdfA.headers.get("content-type")).toContain("application/pdf");
		const pdfBytes = Buffer.from(await resPdfA.arrayBuffer()).toString(
			"latin1",
		);
		expect(pdfBytes.startsWith("%PDF-1.4")).toBe(true);
		expect(pdfBytes).toContain(`AR-DSH-${sufijo}`);

		// Usuario B no puede descargar PDF de animal ajeno
		const resPdfB = await api(userB.token, `/api/ganado/${ganadoId}/ficha-pdf`);
		expect(resPdfB.status).toBe(404);

		// Exportar insumos y sesiones en PDF/CSV
		const resInsPdf = await api(userA.token, "/api/insumos/exportar/pdf");
		expect(resInsPdf.status).toBe(200);
		expect(
			Buffer.from(await resInsPdf.arrayBuffer())
				.toString("latin1")
				.startsWith("%PDF-1.4"),
		).toBe(true);

		const resSesPdf = await api(
			userA.token,
			"/api/sesiones-sanitarias/exportar/pdf",
		);
		expect(resSesPdf.status).toBe(200);
		expect(
			Buffer.from(await resSesPdf.arrayBuffer())
				.toString("latin1")
				.startsWith("%PDF-1.4"),
		).toBe(true);
	});
});

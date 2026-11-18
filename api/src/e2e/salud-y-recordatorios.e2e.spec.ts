/**
 * E2E de Salud, Calendario Sanitario, Planes de Vacunación, Retiro y Notificaciones.
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

describe.skipIf(!E2E_URL)("Salud, calendario y recordatorios (e2e)", () => {
	let app: App;
	let prisma: Prisma;
	const sufijo = Date.now();
	let userA: { id: number; token: string };
	let userB: { id: number; token: string };
	let razaId: number;
	let motivoVentaId: number;

	const crearUsuario = async (clave: string, roleName: "USER" | "ADMIN") => {
		const user = await prisma.user.create({
			data: {
				email: `${clave}-salud-${sufijo}@e2e.test`,
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

		userA = await crearUsuario("salud-a", "USER");
		userB = await crearUsuario("salud-b", "USER");

		const raza = await prisma.raza.findFirstOrThrow();
		razaId = raza.id;
		const motivoVenta = await prisma.motivoBaja.upsert({
			where: { nombre: "VENTA" },
			update: {},
			create: { nombre: "VENTA", descripcion: "Venta" },
		});
		motivoVentaId = motivoVenta.id;
	});

	afterAll(async () => {
		if (!E2E_URL) return;
		const ids = [userA.id, userB.id];
		await prisma.sesionSanitaria.deleteMany({
			where: { veterinario: { usuarioId: { in: ids } } },
		});
		await prisma.planSanitario.deleteMany({
			where: { usuarioId: { in: ids } },
		});
		await prisma.ganado.deleteMany({
			where: { terreno: { usuarioId: { in: ids } } },
		});
		await prisma.insumo.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.veterinario.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.terreno.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.propietario.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
		await prisma.user.deleteMany({ where: { id: { in: ids } } });
	});

	it("un insumo bajo stock genera exactamente una notificación y respeta preferencias", async () => {
		const resInsumo = await api(userA.token, "/api/insumos", "POST", {
			nombre: `Vacuna Alerta ${sufijo}`,
			tipo: "VACUNA",
			stockInicial: 25,
			stockMinimo: 15,
			unidadMedida: "dosis",
			lote: `L-ALT-${sufijo}`,
			fechaCaducidad: new Date(Date.now() + 10 * 86400_000).toISOString(),
			periodoRetiroDias: 14,
		});
		expect(resInsumo.status).toBe(201);
		const insumo = (await resInsumo.json()) as { id: number };

		// Consumir para cruzar el mínimo (25 - 15 = 10 <= 15)
		const resConsumo = await api(
			userA.token,
			`/api/insumos/${insumo.id}/consumir`,
			"POST",
			{ cantidad: 15 },
		);
		expect(resConsumo.status).toBe(200);

		// Evaluar alertas 2 veces seguidas no debe duplicar notificaciones
		const eval1 = await api(userA.token, "/api/salud/evaluar-alertas", "POST");
		expect(eval1.status).toBe(200);
		const eval2 = await api(userA.token, "/api/salud/evaluar-alertas", "POST");
		expect(eval2.status).toBe(200);

		const resNotifs = await api(userA.token, "/api/notificaciones?limit=50");
		expect(resNotifs.status).toBe(200);
		const notifsData = (await resNotifs.json()) as {
			data: Array<{
				id: number;
				tipo: string;
				referenciaId: number | null;
				leida: boolean;
			}>;
			noLeidas: number;
		};

		const stockNotifs = notifsData.data.filter(
			(n) => n.tipo === "STOCK_BAJO" && n.referenciaId === insumo.id,
		);
		expect(stockNotifs).toHaveLength(1);
		expect(
			notifsData.data.some(
				(n) => n.tipo === "INSUMO_POR_CADUCAR" && n.referenciaId === insumo.id,
			),
		).toBe(true);

		// Usuario B no puede ver ni marcar como leída la notificación de A
		const resNotifsB = await api(userB.token, "/api/notificaciones");
		const dataB = (await resNotifsB.json()) as { data: unknown[] };
		expect(dataB.data).toHaveLength(0);

		const notifId = stockNotifs[0]?.id ?? 0;
		expect(notifId).toBeGreaterThan(0);
		const resLeerAjena = await api(
			userB.token,
			`/api/notificaciones/${notifId}/leer`,
			"POST",
		);
		expect(resLeerAjena.status).toBe(404);

		const resLeerPropia = await api(
			userA.token,
			`/api/notificaciones/${notifId}/leer`,
			"POST",
		);
		expect(resLeerPropia.status).toBe(200);
		const leida = (await resLeerPropia.json()) as { leida: boolean };
		expect(leida.leida).toBe(true);

		// Desactivar preferencia STOCK_BAJO para usuario B y probar que no recibe nuevas de ese tipo
		const resPref = await api(
			userB.token,
			"/api/notificaciones/preferencias",
			"PUT",
			{
				preferencias: [{ tipo: "STOCK_BAJO", inApp: false, email: false }],
			},
		);
		expect(resPref.status).toBe(200);

		const resInsumoB = await api(userB.token, "/api/insumos", "POST", {
			nombre: `Insumo B ${sufijo}`,
			tipo: "MEDICAMENTO",
			stockInicial: 10,
			stockMinimo: 5,
			unidadMedida: "ml",
			lote: `L-B-${sufijo}`,
			fechaCaducidad: "2028-01-01T00:00:00.000Z",
		});
		const insumoB = (await resInsumoB.json()) as { id: number };
		await api(userB.token, `/api/insumos/${insumoB.id}/consumir`, "POST", {
			cantidad: 6,
		});

		const resNotifsB2 = await api(userB.token, "/api/notificaciones");
		const dataB2 = (await resNotifsB2.json()) as {
			data: Array<{ tipo: string }>;
		};
		expect(dataB2.data.some((n) => n.tipo === "STOCK_BAJO")).toBe(false);
	});

	it("calendario, planes de vacunación, sesión programada->realizada y período de retiro", async () => {
		const resTerreno = await api(
			userA.token,
			"/api/terrenos",
			"POST",
			form({
				nombre: `Terreno Salud ${sufijo}`,
				ubicacion: "Norte",
				extensionHectareas: 20,
				capacidadMaxima: 50,
			}),
		);
		expect(resTerreno.status).toBe(201);
		const terreno = (await resTerreno.json()) as { id: number };

		const resProp = await api(
			userA.token,
			"/api/propietarios",
			"POST",
			form({
				nombre: `Prop Salud ${sufijo}`,
			}),
		);
		expect(resProp.status).toBe(201);
		const prop = (await resProp.json()) as { id: number };

		const resVet = await api(userA.token, "/api/veterinarios", "POST", {
			nombre: `Dr. Salud ${sufijo}`,
			telefono: "555-9999",
			cedulaProfesional: `CED-SAL-${sufijo}`,
		});
		expect(resVet.status).toBe(201);
		const vet = (await resVet.json()) as { id: number };

		const resGanado = await api(
			userA.token,
			"/api/ganado",
			"POST",
			form({
				identificador: `AR-SAL-${sufijo}`,
				peso: 350,
				fechaNacimiento: "2024-01-10",
				sexo: "HEMBRA",
				razaId,
				terrenoId: terreno.id,
				propietarioId: prop.id,
			}),
		);
		expect(resGanado.status).toBe(201);
		const ganado = (await resGanado.json()) as { id: number };

		const resInsumo = await api(userA.token, "/api/insumos", "POST", {
			nombre: `Antibiótico Retiro ${sufijo}`,
			tipo: "MEDICAMENTO",
			stockInicial: 100,
			stockMinimo: 10,
			unidadMedida: "ml",
			lote: `L-RET-${sufijo}`,
			fechaCaducidad: "2028-06-01T00:00:00.000Z",
			periodoRetiroDias: 21,
		});
		const insumo = (await resInsumo.json()) as { id: number };

		// 1. Crear un plan sanitario con próxima ejecución mañana
		const manana = new Date(Date.now() + 86400_000).toISOString();
		const resPlan = await api(
			userA.token,
			"/api/sesiones-sanitarias/planes",
			"POST",
			{
				nombre: "Plan Refuerzo Semestral",
				descripcion: "Aplicación programada automática",
				frecuenciaDias: 180,
				dosisPorAnimal: 5,
				veterinarioId: vet.id,
				insumoId: insumo.id,
				terrenoId: terreno.id,
				proximaEjecucion: manana,
				activo: true,
			},
		);
		expect(resPlan.status).toBe(201);

		// Generar sesiones desde planes
		const resGen = await api(
			userA.token,
			"/api/sesiones-sanitarias/planes/generar",
			"POST",
		);
		expect(resGen.status).toBe(200);
		const genData = (await resGen.json()) as { sesionesGeneradas: number };
		expect(genData.sesionesGeneradas).toBeGreaterThanOrEqual(1);

		// Verificar que el insumo aún tiene 100 de stock (sesión PROGRAMADA no descuenta)
		const insCheck1 = await api(userA.token, `/api/insumos/${insumo.id}`);
		expect(((await insCheck1.json()) as { stock: number }).stock).toBe(100);

		// Consultar calendario del mes: usuario A ve la sesión programada, usuario B no
		const desde = new Date(Date.now() - 2 * 86400_000).toISOString();
		const hasta = new Date(Date.now() + 40 * 86400_000).toISOString();
		const resCalA = await api(
			userA.token,
			`/api/sesiones-sanitarias/calendario?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
		);
		expect(resCalA.status).toBe(200);
		const calA = (await resCalA.json()) as {
			eventos: Array<{
				tipo: string;
				estado: string;
				referenciaId: number;
			}>;
		};
		const sesionProg = calA.eventos.find(
			(e) => e.tipo === "SESION_SANITARIA" && e.estado === "PROGRAMADA",
		);
		expect(sesionProg).toBeDefined();

		const resCalB = await api(
			userB.token,
			`/api/sesiones-sanitarias/calendario?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
		);
		const calB = (await resCalB.json()) as {
			eventos: Array<{ referenciaId: number }>;
		};
		expect(
			calB.eventos.some((e) => e.referenciaId === sesionProg?.referenciaId),
		).toBe(false);

		// Realizar la sesión programada: debe descontar 5 ml y poner período de retiro al animal
		const resRealizar = await api(
			userA.token,
			`/api/sesiones-sanitarias/${sesionProg?.referenciaId}/realizar`,
			"POST",
		);
		expect(resRealizar.status).toBe(200);
		expect(((await resRealizar.json()) as { estado: string }).estado).toBe(
			"REALIZADA",
		);

		const insCheck2 = await api(userA.token, `/api/insumos/${insumo.id}`);
		expect(((await insCheck2.json()) as { stock: number }).stock).toBe(95);

		// Ficha de ganado debe mostrar período de retiro vigente
		const resFicha = await api(userA.token, `/api/ganado/${ganado.id}`);
		expect(resFicha.status).toBe(200);
		const ficha = (await resFicha.json()) as {
			enPeriodoRetiro: boolean;
			retiroHasta: string | null;
		};
		expect(ficha.enPeriodoRetiro).toBe(true);
		expect(ficha.retiroHasta).not.toBeNull();

		// Intentar dar de baja por VENTA debe rechazarse (400) mientras dure el retiro
		const resVenta = await api(
			userA.token,
			`/api/ganado/${ganado.id}/baja`,
			"POST",
			{
				fechaBaja: new Date().toISOString(),
				motivoBajaId: motivoVentaId,
			},
		);
		expect(resVenta.status).toBe(400);
	});
});

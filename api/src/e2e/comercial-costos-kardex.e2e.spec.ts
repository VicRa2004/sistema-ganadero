/**
 * E2E contra BD real para:
 * - Kardex inmutable (invariante insumo.stock === SUM(movimiento_insumo.delta)) y costoUnitario promedio ponderado
 * - Lotes y operaciones masivas (pesaje, traslado con capacidad, vacunación con kardex)
 * - Alimentación (solo ALIMENTO, ración, suministro, autonomía y AUTONOMIA_ALIMENTO)
 * - Comercial y Costos (venta atómica + retiro vigente, compra con procedencia, PDF, gastos, rentabilidad)
 * - Permisos dinámicos (roles y overrides por usuario)
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

describe.skipIf(!E2E_URL)(
	"Comercial, costos, kardex, lotes, alimentación y permisos (e2e)",
	() => {
		let app: App;
		let prisma: Prisma;
		const sufijo = Date.now();
		const usuarios: Record<string, { id: number; token: string }> = {};

		let terrenoA1Id: number;
		let terrenoA2Id: number;
		let propietarioAId: number;
		let razaId: number;
		let veterinarioAId: number;
		let ganado1Id: number;
		let ganado2Id: number;
		let ganadoCompradoId: number | null = null;
		let roleAdminId: number;
		let roleUserId: number;

		const crearUsuario = async (clave: string, role: "USER" | "ADMIN") => {
			const user = await prisma.user.create({
				data: {
					email: `${clave}-ck-${sufijo}@e2e.test`,
					name: `E2E ${clave}`,
					password: "x",
					roles: { create: { role: { connect: { name: role } } } },
				},
			});
			const token = jwt.sign(
				{ id: user.id, email: user.email, role },
				process.env.JWT_SECRET as string,
				{ expiresIn: "30m" },
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

		const assertKardexInvariante = async (insumoId: number) => {
			const insumo = await prisma.insumo.findUniqueOrThrow({
				where: { id: insumoId },
			});
			const agg = await prisma.movimientoInsumo.aggregate({
				where: { insumoId },
				_sum: { delta: true },
			});
			expect(insumo.stock.toNumber()).toBeCloseTo(
				agg._sum.delta?.toNumber() ?? 0,
				3,
			);
		};

		beforeAll(async () => {
			({ prisma } = await import("@/core/config/prisma"));
			({ app } = await import("@/core/shared/infrastructure/http/server"));

			await crearUsuario("admin", "ADMIN");
			await crearUsuario("u", "USER");
			await crearUsuario("otro", "USER");

			const roles = await prisma.role.findMany({
				where: { name: { in: ["ADMIN", "USER"] } },
			});
			roleAdminId = roles.find((r) => r.name === "ADMIN")?.id as number;
			roleUserId = roles.find((r) => r.name === "USER")?.id as number;

			const uid = usuarios.u?.id as number;
			const t1 = await prisma.terreno.create({
				data: {
					nombre: `Potrero Norte ${sufijo}`,
					ubicacion: "Zona A",
					extensionHectareas: 20,
					capacidadMaxima: 10,
					usuarioId: uid,
				},
			});
			const t2 = await prisma.terreno.create({
				data: {
					nombre: `Potrero Pequeño ${sufijo}`,
					ubicacion: "Zona B",
					extensionHectareas: 2,
					capacidadMaxima: 1,
					usuarioId: uid,
				},
			});
			terrenoA1Id = t1.id;
			terrenoA2Id = t2.id;

			const prop = await prisma.propietario.create({
				data: { nombre: `Prop E2E ${sufijo}`, usuarioId: uid },
			});
			propietarioAId = prop.id;

			const raza =
				(await prisma.raza.findFirst()) ??
				(await prisma.raza.create({ data: { nombre: `Cebu-${sufijo}` } }));
			razaId = raza.id;

			const vetRes = await call("u", "POST", "/api/veterinarios", {
				nombre: "Dra. E2E",
				telefono: "5550001",
				cedulaProfesional: `CED-CK-${sufijo}`,
			});
			expect(vetRes.status).toBe(201);
			veterinarioAId = ((await vetRes.json()) as { id: number }).id;

			const g1 = await prisma.ganado.create({
				data: {
					identificador: `CK-G1-${sufijo}`,
					peso: 350,
					fechaNacimiento: new Date("2024-01-10"),
					sexo: "MACHO",
					razaId,
					terrenoId: terrenoA1Id,
					propietarioId: propietarioAId,
				},
			});
			const g2 = await prisma.ganado.create({
				data: {
					identificador: `CK-G2-${sufijo}`,
					peso: 410,
					fechaNacimiento: new Date("2024-02-10"),
					sexo: "HEMBRA",
					razaId,
					terrenoId: terrenoA1Id,
					propietarioId: propietarioAId,
				},
			});
			ganado1Id = g1.id;
			ganado2Id = g2.id;
		});

		afterAll(async () => {
			if (!prisma) return;
			const uids = Object.values(usuarios).map((x) => x.id);
			const gIds = [ganado1Id, ganado2Id];
			if (ganadoCompradoId) gIds.push(ganadoCompradoId);

			await prisma.suministroRacion.deleteMany({
				where: { usuarioId: { in: uids } },
			});
			await prisma.racionAlimentacion.deleteMany({
				where: { usuarioId: { in: uids } },
			});
			await prisma.movimientoInsumo.deleteMany({
				where: { usuarioId: { in: uids } },
			});
			await prisma.gasto.deleteMany({ where: { usuarioId: { in: uids } } });
			await prisma.transaccionGanado.deleteMany({
				where: { transaccion: { usuarioId: { in: uids } } },
			});
			await prisma.transaccion.deleteMany({
				where: { usuarioId: { in: uids } },
			});
			await prisma.loteGanado.deleteMany({
				where: { lote: { usuarioId: { in: uids } } },
			});
			await prisma.lote.deleteMany({ where: { usuarioId: { in: uids } } });
			await prisma.aplicacionSanitaria.deleteMany({
				where: { ganadoId: { in: gIds } },
			});
			await prisma.sesionSanitaria.deleteMany({
				where: { veterinarioId: veterinarioAId },
			});
			await prisma.tratamientoMedico.deleteMany({
				where: { ganadoId: { in: gIds } },
			});
			await prisma.pesaje.deleteMany({ where: { ganadoId: { in: gIds } } });
			await prisma.ganado.deleteMany({ where: { id: { in: gIds } } });
			await prisma.insumo.deleteMany({ where: { usuarioId: { in: uids } } });
			await prisma.veterinario.deleteMany({ where: { id: veterinarioAId } });
			await prisma.propietario.deleteMany({ where: { id: propietarioAId } });
			await prisma.terreno.deleteMany({
				where: { id: { in: [terrenoA1Id, terrenoA2Id] } },
			});
			await prisma.notificacion.deleteMany({
				where: { usuarioId: { in: uids } },
			});
			await prisma.userPermission.deleteMany({
				where: { userId: { in: uids } },
			});
			await prisma.userRole.deleteMany({ where: { userId: { in: uids } } });
			await prisma.user.deleteMany({ where: { id: { in: uids } } });
		});

		it("kardex mantiene invariante stock === SUM(delta) tras alta, abastecer (costo promedio ponderado), ajuste y concurrencia", async () => {
			const createRes = await call("u", "POST", "/api/insumos", {
				nombre: "Silaje Maíz",
				tipo: "ALIMENTO",
				stockInicial: 100,
				stockMinimo: 20,
				unidadMedida: "kg",
				lote: "SIL-1",
				fechaCaducidad: "2030-01-01",
				costoUnitario: 10,
			});
			expect(createRes.status).toBe(201);
			const insumo = (await createRes.json()) as {
				id: number;
				costoUnitario: number;
			};
			expect(insumo.costoUnitario).toBe(10);
			await assertKardexInvariante(insumo.id);

			const abRes = await call(
				"u",
				"POST",
				`/api/insumos/${insumo.id}/abastecer`,
				{
					cantidad: 100,
					costoUnitario: 20,
					motivo: "Reabastecimiento mensual",
				},
			);
			expect(abRes.status).toBe(200);
			const abData = (await abRes.json()) as {
				stock: number;
				costoUnitario: number;
			};
			expect(abData.stock).toBe(200);
			expect(abData.costoUnitario).toBe(15);
			await assertKardexInvariante(insumo.id);

			const ajRes = await call(
				"u",
				"POST",
				`/api/insumos/${insumo.id}/ajustar`,
				{
					cantidadDelta: -10,
					motivo: "Merma de almacén",
				},
			);
			expect(ajRes.status).toBe(200);
			await assertKardexInvariante(insumo.id);

			// 20 operaciones concurrentes de consumo de 15 kg sobre 190 kg (12 deben pasar, stock final 10)
			const reqs = await Promise.all(
				Array.from({ length: 20 }, () =>
					call("u", "POST", `/api/insumos/${insumo.id}/consumir`, {
						cantidad: 15,
					}),
				),
			);
			const exitos = reqs.filter((r) => r.status === 200).length;
			expect(exitos).toBe(12);
			await assertKardexInvariante(insumo.id);

			const kardexRes = await call(
				"u",
				"GET",
				`/api/insumos/${insumo.id}/kardex`,
			);
			expect(kardexRes.status).toBe(200);
			const kardex = (await kardexRes.json()) as {
				stockActual: number;
				sumaKardex: number;
			};
			expect(kardex.stockActual).toBe(10);
			expect(kardex.sumaKardex).toBe(10);
		});

		it("alimentación: rechaza no-ALIMENTO, descuenta stock en suministro con kardex y genera alerta AUTONOMIA_ALIMENTO", async () => {
			const vacunaRes = await call("u", "POST", "/api/insumos", {
				nombre: "Vacuna No Alimento",
				tipo: "VACUNA",
				stockInicial: 50,
				stockMinimo: 5,
				unidadMedida: "dosis",
				lote: "VAC-1",
				fechaCaducidad: "2030-01-01",
			});
			const vacunaId = ((await vacunaRes.json()) as { id: number }).id;

			const badRacion = await call("u", "POST", "/api/alimentacion/raciones", {
				nombre: "Ración Mala",
				insumoId: vacunaId,
				terrenoId: terrenoA1Id,
				cantidadDiariaPorAnimal: 2,
			});
			expect(badRacion.status).toBe(400);

			const alimRes = await call("u", "POST", "/api/insumos", {
				nombre: "Forraje Balanceado",
				tipo: "ALIMENTO",
				stockInicial: 40,
				stockMinimo: 5,
				unidadMedida: "kg",
				lote: "FOR-1",
				fechaCaducidad: "2030-01-01",
				costoUnitario: 12,
			});
			const alimId = ((await alimRes.json()) as { id: number }).id;

			const racionRes = await call("u", "POST", "/api/alimentacion/raciones", {
				nombre: "Ración Potrero Norte",
				insumoId: alimId,
				terrenoId: terrenoA1Id,
				cantidadDiariaPorAnimal: 5,
				diasAlertaAutonomia: 10,
			});
			expect(racionRes.status).toBe(201);
			const racionId = ((await racionRes.json()) as { id: number }).id;

			const sumRes = await call(
				"u",
				"POST",
				`/api/alimentacion/raciones/${racionId}/suministrar`,
				{ observaciones: "Ración mañana" },
			);
			expect(sumRes.status).toBe(201);
			const sumData = (await sumRes.json()) as {
				cantidadTotal: number;
				costoTotal: number;
			};
			expect(sumData.cantidadTotal).toBe(10); // 2 animales activos x 5 kg
			expect(sumData.costoTotal).toBe(120);
			await assertKardexInvariante(alimId);

			const evalRes = await call("u", "POST", "/api/salud/evaluar-alertas");
			expect(evalRes.status).toBe(200);

			const notifs = await prisma.notificacion.findMany({
				where: { usuarioId: usuarios.u?.id, tipo: "AUTONOMIA_ALIMENTO" },
			});
			expect(notifs.length).toBeGreaterThanOrEqual(1);
		});

		it("lotes: creación, pesaje masivo, bloqueo de traslado por capacidad y vacunación masiva con kardex", async () => {
			const vacunaRes = await call("u", "POST", "/api/insumos", {
				nombre: "Desparasitante Lote",
				tipo: "MEDICAMENTO",
				stockInicial: 30,
				stockMinimo: 5,
				unidadMedida: "ml",
				lote: "DES-1",
				fechaCaducidad: "2030-01-01",
				costoUnitario: 8,
			});
			const vacunaId = ((await vacunaRes.json()) as { id: number }).id;

			const loteRes = await call("u", "POST", "/api/lotes", {
				nombre: `Lote E2E ${sufijo}`,
				proposito: "ENGORDA",
				terrenoId: terrenoA1Id,
				ganadoIds: [ganado1Id, ganado2Id],
			});
			expect(loteRes.status).toBe(201);
			const loteId = ((await loteRes.json()) as { id: number }).id;

			const pesajeRes = await call(
				"u",
				"POST",
				`/api/lotes/${loteId}/pesaje-masivo`,
				{
					items: [
						{ ganadoId: ganado1Id, peso: 365 },
						{ ganadoId: ganado2Id, peso: 425 },
					],
				},
			);
			expect(pesajeRes.status).toBe(201);

			// Terreno 2 tiene capacidadMaxima = 1, mover 2 animales debe fallar con 400
			const trasladoFail = await call(
				"u",
				"POST",
				`/api/lotes/${loteId}/traslado-masivo`,
				{ terrenoDestinoId: terrenoA2Id },
			);
			expect(trasladoFail.status).toBe(400);

			const vacRes = await call(
				"u",
				"POST",
				`/api/lotes/${loteId}/vacunacion`,
				{
					fecha: "2026-11-18",
					veterinarioId: veterinarioAId,
					insumoId: vacunaId,
					dosisPorAnimal: 5,
					descripcion: "Vacunación lote E2E",
				},
			);
			expect(vacRes.status).toBe(201);
			await assertKardexInvariante(vacunaId);
		});

		it("comercial: compra con procedencia, bloqueo venta por retiro vigente, venta atómica, PDF y rentabilidad", async () => {
			const compraRes = await call(
				"u",
				"POST",
				"/api/comercial/transacciones/compra",
				{
					fecha: "2026-11-18",
					contraparte: "Ganadería Sierra",
					moneda: "MXN",
					items: [
						{
							identificador: `COMP-${sufijo}`,
							peso: 250,
							fechaNacimiento: "2025-01-10",
							sexo: "MACHO",
							razaId,
							terrenoId: terrenoA1Id,
							propietarioId: propietarioAId,
							precio: 14000,
							procedencia: "Subasta Regional",
						},
					],
				},
			);
			expect(compraRes.status).toBe(201);
			const compra = (await compraRes.json()) as {
				detalles: Array<{ ganadoId: number; procedencia: string | null }>;
			};
			ganadoCompradoId = compra.detalles[0]?.ganadoId ?? null;
			expect(compra.detalles[0]?.procedencia).toBe("Subasta Regional");

			// Aplicar medicamento con período de retiro a ganado2Id y comprobar bloqueo de venta
			const medRetiroRes = await call("u", "POST", "/api/insumos", {
				nombre: "Antibiótico Retiro",
				tipo: "MEDICAMENTO",
				stockInicial: 50,
				stockMinimo: 5,
				unidadMedida: "ml",
				lote: "RET-1",
				fechaCaducidad: "2030-01-01",
				periodoRetiroDias: 30,
				costoUnitario: 20,
			});
			const medRetiroId = ((await medRetiroRes.json()) as { id: number }).id;

			const sesRes = await call("u", "POST", "/api/sesiones-sanitarias", {
				fecha: new Date().toISOString().slice(0, 10),
				veterinarioId: veterinarioAId,
				insumoId: medRetiroId,
				descripcion: "Tratamiento preventivo",
				aplicaciones: [{ ganadoId: ganado2Id, dosisAplicada: 5 }],
			});
			expect(sesRes.status).toBe(201);
			await assertKardexInvariante(medRetiroId);

			const ventaBloqueada = await call(
				"u",
				"POST",
				"/api/comercial/transacciones/venta",
				{
					fecha: new Date().toISOString().slice(0, 10),
					contraparte: "Frigorífico",
					items: [{ ganadoId: ganado2Id, precio: 25000 }],
				},
			);
			expect(ventaBloqueada.status).toBe(400);

			// Venta exitosa del animal comprado (sin retiro)
			const ventaOk = await call(
				"u",
				"POST",
				"/api/comercial/transacciones/venta",
				{
					fecha: new Date().toISOString().slice(0, 10),
					contraparte: "Carnicería Central",
					items: [{ ganadoId: ganadoCompradoId, precio: 26000 }],
				},
			);
			expect(ventaOk.status).toBe(201);
			const ventaData = (await ventaOk.json()) as { id: number };

			const pdfRes = await call(
				"u",
				"GET",
				`/api/comercial/transacciones/${ventaData.id}/pdf`,
			);
			expect(pdfRes.status).toBe(200);
			expect(pdfRes.headers.get("content-type")).toContain("application/pdf");
			const bytes = new Uint8Array(await pdfRes.arrayBuffer());
			expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");

			const gastoRes = await call("u", "POST", "/api/comercial/gastos", {
				categoria: "MANO_OBRA",
				concepto: "Arreo y traslado",
				monto: 1500,
				fecha: new Date().toISOString().slice(0, 10),
				ganadoId: ganadoCompradoId,
			});
			expect(gastoRes.status).toBe(201);

			const rentRes = await call("u", "GET", "/api/comercial/rentabilidad");
			expect(rentRes.status).toBe(200);
			const rent = (await rentRes.json()) as {
				resumen: { ingresosVenta: number; gananciaNeta: number };
			};
			expect(rent.resumen.ingresosVenta).toBeGreaterThanOrEqual(26000);

			const rentAnimalRes = await call(
				"u",
				"GET",
				`/api/comercial/rentabilidad/ganado/${ganadoCompradoId}`,
			);
			expect(rentAnimalRes.status).toBe(200);
			const rentAnimal = (await rentAnimalRes.json()) as {
				ingresosVenta: number;
				costoCompra: number;
				gananciaNeta: number;
			};
			expect(rentAnimal.ingresosVenta).toBe(26000);
			expect(rentAnimal.costoCompra).toBe(14000);
			expect(typeof rentAnimal.gananciaNeta).toBe("number");
		});

		it("autorización: roles y overrides directos surten efecto inmediato e impiden auto-quitar ADMIN", async () => {
			const permComercial = await prisma.permission.findFirstOrThrow({
				where: { resource: "comercial", action: "read" },
			});

			const denyRes = await call(
				"admin",
				"PUT",
				`/api/permissions/users/${usuarios.otro?.id}/direct`,
				{ overrides: [{ permissionId: permComercial.id, granted: false }] },
			);
			expect(denyRes.status).toBe(200);

			const forbiddenRes = await call(
				"otro",
				"GET",
				"/api/comercial/rentabilidad",
			);
			expect(forbiddenRes.status).toBe(403);

			const selfDemoteRes = await call(
				"admin",
				"PUT",
				`/api/permissions/users/${usuarios.admin?.id}/roles`,
				{ roleIds: [roleUserId] },
			);
			expect(selfDemoteRes.status).toBe(400);

			const rolesRes = await call("admin", "GET", "/api/permissions/roles");
			expect(rolesRes.status).toBe(200);

			const restoreRoles = await call(
				"admin",
				"PUT",
				`/api/permissions/users/${usuarios.otro?.id}/roles`,
				{ roleIds: [roleAdminId] },
			);
			expect(restoreRoles.status).toBe(200);
		});
	},
);

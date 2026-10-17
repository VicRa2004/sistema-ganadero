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

describe.skipIf(!E2E_URL)(
	"Stock atómico, insumos críticos y permisos (e2e)",
	() => {
		let app: App;
		let prisma: Prisma;
		const sufijo = Date.now();
		const usuarios: Record<string, { id: number; token: string }> = {};

		const crearUsuario = async (clave: string, role: "USER" | "ADMIN") => {
			const user = await prisma.user.create({
				data: {
					email: `${clave}-stock-${sufijo}@e2e.test`,
					name: clave,
					password: "x",
					roles: { create: { role: { connect: { name: role } } } },
				},
			});
			const token = jwt.sign(
				{ id: user.id, email: user.email, role },
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

		const crearInsumo = async (
			clave: string,
			stockInicial: number,
			stockMinimo = 0,
			nombre = "Insumo",
		) => {
			const res = await call(clave, "POST", "/api/insumos", {
				nombre,
				tipo: "VACUNA",
				stockInicial,
				stockMinimo,
				unidadMedida: "ml",
				lote: "L1",
				fechaCaducidad: "2030-01-01",
			});
			expect(res.status).toBe(201);
			return ((await res.json()) as { id: number }).id;
		};

		const stockDe = async (id: number) =>
			(await prisma.insumo.findUniqueOrThrow({ where: { id } })).stock;

		let veterinarioA: number;
		let ganadoA: number;
		const creados = { insumos: [] as number[], sesiones: [] as number[] };

		beforeAll(async () => {
			({ prisma } = await import("@/core/config/prisma"));
			({ app } = await import("@/core/shared/infrastructure/http/server"));

			await crearUsuario("a", "USER");
			await crearUsuario("b", "USER");

			const vet = await call("a", "POST", "/api/veterinarios", {
				nombre: "Vet",
				telefono: "1",
				cedulaProfesional: `CED-STOCK-${sufijo}`,
			});
			veterinarioA = ((await vet.json()) as { id: number }).id;

			const terreno = await prisma.terreno.create({
				data: {
					nombre: "T",
					ubicacion: "x",
					extensionHectareas: 1,
					capacidadMaxima: 100,
					usuarioId: usuarios.a?.id as number,
				},
			});
			const propietario = await prisma.propietario.create({
				data: { nombre: "P", usuarioId: usuarios.a?.id as number },
			});
			const raza =
				(await prisma.raza.findFirst()) ??
				(await prisma.raza.create({ data: { nombre: `R-${sufijo}` } }));
			const ganado = await prisma.ganado.create({
				data: {
					identificador: `S-${sufijo}`,
					peso: 1,
					fechaNacimiento: new Date("2024-01-01"),
					sexo: "MACHO",
					razaId: raza.id,
					terrenoId: terreno.id,
					propietarioId: propietario.id,
				},
			});
			ganadoA = ganado.id;
		});

		afterAll(async () => {
			if (!prisma) return;
			const ids = Object.values(usuarios).map((u) => u.id);
			await prisma.aplicacionSanitaria.deleteMany({
				where: { ganadoId: ganadoA },
			});
			await prisma.sesionSanitaria.deleteMany({
				where: { veterinarioId: veterinarioA },
			});
			await prisma.ganado.deleteMany({ where: { id: ganadoA } });
			await prisma.userPermission.deleteMany({
				where: { userId: { in: ids } },
			});
			await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
			await prisma.user.deleteMany({ where: { id: { in: ids } } });
		});

		describe("M-9 · stock atómico", () => {
			it("20 consumos simultáneos de 10 sobre un stock de 100: exactamente 10 prosperan", async () => {
				const id = await crearInsumo("a", 100);
				const respuestas = await Promise.all(
					Array.from({ length: 20 }, () =>
						call("a", "POST", `/api/insumos/${id}/consumir`, { cantidad: 10 }),
					),
				);

				const exitosas = respuestas.filter((r) => r.status === 200).length;
				const rechazadas = respuestas.filter((r) => r.status === 400).length;
				expect(exitosas).toBe(10);
				expect(rechazadas).toBe(10);
				expect(await stockDe(id)).toBe(0);
			});

			it("20 abastecimientos simultáneos no pierden ninguna suma", async () => {
				const id = await crearInsumo("a", 10);
				const respuestas = await Promise.all(
					Array.from({ length: 20 }, () =>
						call("a", "POST", `/api/insumos/${id}/abastecer`, { cantidad: 5 }),
					),
				);

				expect(respuestas.every((r) => r.status === 200)).toBe(true);
				expect(await stockDe(id)).toBe(110);
			});

			it("editar el insumo mientras se consume no pisa el stock con un valor viejo", async () => {
				const id = await crearInsumo("a", 100);
				const operaciones = [
					...Array.from({ length: 10 }, () =>
						call("a", "POST", `/api/insumos/${id}/consumir`, { cantidad: 1 }),
					),
					...Array.from({ length: 10 }, (_, i) =>
						call("a", "PUT", `/api/insumos/${id}`, {
							nombre: `Renombrado ${i}`,
						}),
					),
				];
				const respuestas = await Promise.all(operaciones);

				expect(respuestas.every((r) => r.status === 200)).toBe(true);
				expect(await stockDe(id)).toBe(90);
			});

			it("una sesión sanitaria que falla al guardarse devuelve el stock descontado", async () => {
				const id = await crearInsumo("a", 50);
				// El mismo animal dos veces viola la unicidad (sesión, animal) al insertar
				const res = await call("a", "POST", "/api/sesiones-sanitarias", {
					fecha: "2026-01-01",
					veterinarioId: veterinarioA,
					descripcion: "Duplicada",
					insumoId: id,
					aplicaciones: [
						{ ganadoId: ganadoA, dosisAplicada: 2 },
						{ ganadoId: ganadoA, dosisAplicada: 3 },
					],
				});

				expect(res.status).toBeGreaterThanOrEqual(400);
				expect(res.status).toBeLessThan(500);
				expect(await stockDe(id)).toBe(50);
				expect(
					await prisma.sesionSanitaria.count({ where: { insumoId: id } }),
				).toBe(0);
			});

			it("sesiones simultáneas que superan el stock: nunca queda negativo", async () => {
				const id = await crearInsumo("a", 10);
				const respuestas = await Promise.all(
					Array.from({ length: 5 }, (_, i) =>
						call("a", "POST", "/api/sesiones-sanitarias", {
							fecha: "2026-01-01",
							veterinarioId: veterinarioA,
							descripcion: `Sesión ${i}`,
							insumoId: id,
							aplicaciones: [{ ganadoId: ganadoA, dosisAplicada: 4 }],
						}),
					),
				);

				const exitosas = respuestas.filter((r) => r.status === 201).length;
				expect(exitosas).toBe(2);
				expect(await stockDe(id)).toBe(10 - 4 * exitosas);
				expect(
					await prisma.sesionSanitaria.count({ where: { insumoId: id } }),
				).toBe(exitosas);
			});
		});

		describe("M-8 · insumos críticos", () => {
			it("devuelve solo los del usuario con stock <= mínimo, sin los eliminados", async () => {
				const bajo = await crearInsumo("a", 3, 5, "Bajo");
				const igual = await crearInsumo("a", 5, 5, "Igual");
				const normal = await crearInsumo("a", 6, 5, "Normal");
				const eliminado = await crearInsumo("a", 0, 5, "Eliminado");
				const ajeno = await crearInsumo("b", 0, 5, "Ajeno");
				await call("a", "DELETE", `/api/insumos/${eliminado}`);

				const res = await call("a", "GET", "/api/insumos/criticos");
				expect(res.status).toBe(200);
				const ids = ((await res.json()) as { id: number }[]).map((i) => i.id);

				expect(ids).toContain(bajo);
				expect(ids).toContain(igual);
				expect(ids).not.toContain(normal);
				expect(ids).not.toContain(eliminado);
				expect(ids).not.toContain(ajeno);
			});
		});

		describe("M-7 · permisos efectivos", () => {
			it("un permiso directo denegado quita el que concede el rol", async () => {
				expect((await call("b", "GET", "/api/ganado")).status).toBe(200);

				const permiso = await prisma.permission.findFirstOrThrow({
					where: { resource: "ganado", action: "read" },
				});
				await prisma.userPermission.create({
					data: {
						userId: usuarios.b?.id as number,
						permissionId: permiso.id,
						granted: false,
					},
				});

				expect((await call("b", "GET", "/api/ganado")).status).toBe(403);
			});

			it("un permiso directo concedido añade uno que el rol no tiene", async () => {
				const permiso = await prisma.permission.upsert({
					where: { resource_action: { resource: "raza", action: "delete" } },
					update: {},
					create: { resource: "raza", action: "delete" },
				});
				const antes = await call("a", "DELETE", "/api/razas/999999");
				expect(antes.status).toBe(403);

				await prisma.userPermission.create({
					data: { userId: usuarios.a?.id as number, permissionId: permiso.id },
				});
				const despues = await call("a", "DELETE", "/api/razas/999999");
				expect(despues.status).not.toBe(403);
			});

			it("un usuario inactivo no tiene permisos", async () => {
				await prisma.user.update({
					where: { id: usuarios.a?.id as number },
					data: { isActive: false },
				});
				expect((await call("a", "GET", "/api/insumos")).status).toBe(403);
			});
		});
	},
);

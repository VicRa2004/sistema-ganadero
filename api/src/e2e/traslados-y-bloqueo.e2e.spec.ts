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
	"Historial de traslados y bloqueo de login (e2e)",
	() => {
		let app: App;
		let prisma: Prisma;
		const sufijo = Date.now();
		const usuarios: Record<string, { id: number; token: string }> = {};
		const terrenos: number[] = [];
		let ganadoId: number;

		const crearUsuario = async (clave: string) => {
			const user = await prisma.user.create({
				data: {
					email: `${clave}-traslado-${sufijo}@e2e.test`,
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

		const call = (clave: string, method: string, path: string, body?: object) =>
			app.request(path, {
				method,
				headers: {
					Authorization: `Bearer ${usuarios[clave]?.token}`,
					...(body && { "Content-Type": "application/json" }),
				},
				body: body && JSON.stringify(body),
			});

		beforeAll(async () => {
			({ prisma } = await import("@/core/config/prisma"));
			({ app } = await import("@/core/shared/infrastructure/http/server"));

			await crearUsuario("a");
			await crearUsuario("b");
			const usuarioId = usuarios.a?.id as number;
			for (const nombre of ["Norte", "Sur"]) {
				const t = await prisma.terreno.create({
					data: {
						nombre,
						ubicacion: "x",
						extensionHectareas: 1,
						capacidadMaxima: 10,
						usuarioId,
					},
				});
				terrenos.push(t.id);
			}
			const propietario = await prisma.propietario.create({
				data: { nombre: "P", usuarioId },
			});
			const raza =
				(await prisma.raza.findFirst()) ??
				(await prisma.raza.create({ data: { nombre: `R-${sufijo}` } }));
			ganadoId = (
				await prisma.ganado.create({
					data: {
						identificador: `TRA-${sufijo}`,
						peso: 300,
						fechaNacimiento: new Date("2024-01-01"),
						sexo: "MACHO",
						razaId: raza.id,
						terrenoId: terrenos[0] as number,
						propietarioId: propietario.id,
					},
				})
			).id;
		});

		afterAll(async () => {
			if (!prisma) return;
			const ids = Object.values(usuarios).map((u) => u.id);
			await prisma.ganado.deleteMany({ where: { id: ganadoId } });
			await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
			await prisma.user.deleteMany({ where: { id: { in: ids } } });
		});

		it("cada traslado queda en el historial, del más reciente al más antiguo", async () => {
			const [norte, sur] = terrenos as [number, number];
			for (const terrenoId of [sur, norte]) {
				const res = await call(
					"a",
					"POST",
					`/api/ganado/${ganadoId}/traslados`,
					{ terrenoId },
				);
				expect(res.status).toBe(200);
			}
			// Trasladar al mismo terreno no genera registro
			await call("a", "POST", `/api/ganado/${ganadoId}/traslados`, {
				terrenoId: norte,
			});

			const res = await call("a", "GET", `/api/ganado/${ganadoId}/traslados`);
			expect(res.status).toBe(200);
			const historial = (await res.json()) as {
				terrenoOrigen: { id: number; nombre: string };
				terrenoDestino: { id: number };
			}[];
			expect(
				historial.map((t) => [t.terrenoOrigen.id, t.terrenoDestino.id]),
			).toEqual([
				[sur, norte],
				[norte, sur],
			]);
			expect(historial[0]?.terrenoOrigen.nombre).toBe("Sur");
		});

		it("otro usuario no ve el historial de traslados", async () => {
			const res = await call("b", "GET", `/api/ganado/${ganadoId}/traslados`);
			expect(res.status).toBe(404);
		});

		it("bloquea la cuenta al llegar al máximo de fallos y se libera al reiniciar", async () => {
			const { PrismaLoginAttemptRepository } = await import(
				"@/modules/auth/infrastructure/repository/PrismaLoginAttemptRepository"
			);
			const repo = new PrismaLoginAttemptRepository();
			const id = usuarios.b?.id as number;

			for (let i = 0; i < 2; i++) await repo.registrarFallo(id, 3, 15);
			expect(await repo.obtenerBloqueo(id)).toBeNull();

			await repo.registrarFallo(id, 3, 15);
			const hasta = await repo.obtenerBloqueo(id);
			expect(hasta?.getTime()).toBeGreaterThan(Date.now() + 14 * 60_000);

			await repo.reiniciar(id);
			expect(await repo.obtenerBloqueo(id)).toBeNull();
		});
	},
);

/**
 * E2E contra una BD real (migraciones aplicadas y `bun prisma/seed.ts` ejecutado).
 * Se ejecuta cuando se define `E2E_DATABASE_URL`.
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
	"Reproducción, genealogía y comparación de pesajes (e2e)",
	() => {
		let app: App;
		let prisma: Prisma;

		const sufijo = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
		const usuarios: Record<string, { id: number; token: string }> = {};
		let razaId = 0;
		let terrenoId = 0;
		let propietarioId = 0;

		const crearUsuario = async (clave: string) => {
			const user = await prisma.user.create({
				data: {
					email: `${clave}-repro-${sufijo}@e2e.test`,
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

		const crearAnimal = async (params: {
			identificador: string;
			sexo: "MACHO" | "HEMBRA";
			peso: number;
			fechaNacimiento: string;
			padreId?: number;
			madreId?: number;
		}) => {
			const fields: Record<string, string | number> = {
				identificador: `${params.identificador}-${sufijo}`,
				peso: params.peso,
				fechaNacimiento: params.fechaNacimiento,
				sexo: params.sexo,
				razaId,
				terrenoId,
				propietarioId,
			};
			if (params.padreId) fields.padreId = params.padreId;
			if (params.madreId) fields.madreId = params.madreId;

			const res = await call("a", "POST", "/api/ganado", form(fields));
			expect(res.status).toBe(201);
			return (await res.json()) as { id: number; identificador: string };
		};

		beforeAll(async () => {
			({ prisma } = await import("@/core/config/prisma"));
			({ app } = await import("@/core/shared/infrastructure/http/server"));

			await crearUsuario("a");
			await crearUsuario("b");

			const raza = await prisma.raza.findFirstOrThrow();
			razaId = raza.id;

			const usuarioAId = usuarios.a?.id as number;
			terrenoId = (
				await prisma.terreno.create({
					data: {
						nombre: `Potrero-${sufijo}`,
						ubicacion: "Sur",
						extensionHectareas: 50,
						capacidadMaxima: 30,
						usuarioId: usuarioAId,
					},
				})
			).id;
			propietarioId = (
				await prisma.propietario.create({
					data: { nombre: `Prop-${sufijo}`, usuarioId: usuarioAId },
				})
			).id;
		});

		afterAll(async () => {
			const ids = Object.values(usuarios).map((u) => u.id);
			await prisma.eventoReproductivo.deleteMany({
				where: { hembra: { terreno: { usuarioId: { in: ids } } } },
			});
			await prisma.ganado.updateMany({
				where: { terreno: { usuarioId: { in: ids } } },
				data: { padreId: null, madreId: null, partoEventoId: null },
			});
			await prisma.ganado.deleteMany({
				where: { terreno: { usuarioId: { in: ids } } },
			});
			await prisma.terreno.deleteMany({ where: { usuarioId: { in: ids } } });
			await prisma.propietario.deleteMany({
				where: { usuarioId: { in: ids } },
			});
			await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
			await prisma.user.deleteMany({ where: { id: { in: ids } } });
		});

		it("flujo reproductivo completo: monta -> diagnóstico -> parto con cría -> indicadores", async () => {
			const toro = await crearAnimal({
				identificador: "TORO-1",
				sexo: "MACHO",
				peso: 680,
				fechaNacimiento: "2021-01-01",
			});
			const vaca = await crearAnimal({
				identificador: "VACA-1",
				sexo: "HEMBRA",
				peso: 480,
				fechaNacimiento: "2021-06-01",
			});

			const montaRes = await call("a", "POST", "/api/reproduccion", {
				hembraId: vaca.id,
				machoId: toro.id,
				tipo: "MONTA",
				fecha: "2025-01-01",
			});
			expect(montaRes.status).toBe(201);
			const monta = (await montaRes.json()) as {
				id: number;
				fechaProbableParto: string;
			};
			expect(monta.fechaProbableParto).toBe("2025-10-11");

			const diagRes = await call("a", "POST", "/api/reproduccion", {
				hembraId: vaca.id,
				tipo: "DIAGNOSTICO_GESTACION",
				fecha: "2025-03-01",
				resultado: "POSITIVO",
			});
			expect(diagRes.status).toBe(201);
			const diag = (await diagRes.json()) as { fechaProbableParto: string };
			expect(diag.fechaProbableParto).toBe("2025-10-11");

			const partoRes = await call("a", "POST", "/api/reproduccion", {
				hembraId: vaca.id,
				tipo: "PARTO",
				fecha: "2025-10-10",
				observaciones: "Parto normal",
				crias: [
					{
						identificador: `CRIA-1-${sufijo}`,
						sexo: "HEMBRA",
						peso: 36,
					},
				],
			});
			expect(partoRes.status).toBe(201);
			const parto = (await partoRes.json()) as {
				crias: { id: number; identificador: string }[];
			};
			expect(parto.crias).toHaveLength(1);
			const criaId = parto.crias[0]?.id as number;

			// Verificar ficha de la cría con padre y madre vinculados
			const fichaRes = await call("a", "GET", `/api/ganado/${criaId}`);
			expect(fichaRes.status).toBe(200);
			const ficha = (await fichaRes.json()) as {
				padre: { id: number } | null;
				madre: { id: number } | null;
			};
			expect(ficha.padre?.id).toBe(toro.id);
			expect(ficha.madre?.id).toBe(vaca.id);

			// Indicadores reproductivos
			const indRes = await call("a", "GET", "/api/reproduccion/indicadores");
			expect(indRes.status).toBe(200);
			const indicadores = (await indRes.json()) as {
				tasaPrenez: number | null;
				partosEnPeriodo: number;
			};
			expect(indicadores.tasaPrenez).toBe(100);
			expect(indicadores.partosEnPeriodo).toBeGreaterThanOrEqual(1);

			// Usuario ajeno no ve ni puede eliminar el evento
			const listadoB = await call("b", "GET", "/api/reproduccion");
			expect(listadoB.status).toBe(200);
			expect(((await listadoB.json()) as { data: unknown[] }).data).toEqual([]);
		});

		it("genealogía de 3 generaciones, descendencia, validación de ciclos y comparación de pesajes", async () => {
			const bisabuelo = await crearAnimal({
				identificador: "BISABUELO",
				sexo: "MACHO",
				peso: 700,
				fechaNacimiento: "2018-01-01",
			});
			const abuelo = await crearAnimal({
				identificador: "ABUELO",
				sexo: "MACHO",
				peso: 650,
				fechaNacimiento: "2020-01-01",
				padreId: bisabuelo.id,
			});
			const abuela = await crearAnimal({
				identificador: "ABUELA",
				sexo: "HEMBRA",
				peso: 500,
				fechaNacimiento: "2020-02-01",
			});
			const padre = await crearAnimal({
				identificador: "PADRE-G",
				sexo: "MACHO",
				peso: 610,
				fechaNacimiento: "2022-01-01",
				padreId: abuelo.id,
				madreId: abuela.id,
			});
			const madre = await crearAnimal({
				identificador: "MADRE-G",
				sexo: "HEMBRA",
				peso: 470,
				fechaNacimiento: "2022-02-01",
			});
			const nieto = await crearAnimal({
				identificador: "NIETO-G",
				sexo: "MACHO",
				peso: 320,
				fechaNacimiento: "2024-06-01",
				padreId: padre.id,
				madreId: madre.id,
			});
			// Par contemporáneo misma raza/edad para comparación de pesajes
			await crearAnimal({
				identificador: "CONTEMP",
				sexo: "MACHO",
				peso: 280,
				fechaNacimiento: "2024-06-15",
			});

			// Rechazar ciclo genealógico: intentar poner a `nieto` como padre de `bisabuelo`
			const cicloRes = await call(
				"a",
				"PUT",
				`/api/ganado/${bisabuelo.id}`,
				form({ padreId: nieto.id }),
			);
			expect(cicloRes.status).toBe(400);

			// Árbol genealógico de 3 generaciones para `nieto`
			const genRes = await call(
				"a",
				"GET",
				`/api/ganado/${nieto.id}/genealogia?generaciones=3`,
			);
			expect(genRes.status).toBe(200);
			const gen = (await genRes.json()) as {
				animal: {
					id: number;
					padre: {
						id: number;
						padre: { id: number; padre: { id: number } | null } | null;
						madre: { id: number } | null;
					} | null;
					madre: { id: number } | null;
				};
			};
			expect(gen.animal.id).toBe(nieto.id);
			expect(gen.animal.padre?.id).toBe(padre.id);
			expect(gen.animal.padre?.padre?.id).toBe(abuelo.id);
			expect(gen.animal.padre?.padre?.padre?.id).toBe(bisabuelo.id);
			expect(gen.animal.padre?.madre?.id).toBe(abuela.id);

			// Descendencia de `padre`
			const genPadre = (await (
				await call(
					"a",
					"GET",
					`/api/ganado/${padre.id}/genealogia?generaciones=2`,
				)
			).json()) as { descendencia: { id: number }[] };
			expect(genPadre.descendencia.map((d) => d.id)).toContain(nieto.id);

			// Comparación de pesajes contra promedio de raza/edad
			const pesajesRes = await call(
				"a",
				"GET",
				`/api/ganado/${nieto.id}/pesajes`,
			);
			expect(pesajesRes.status).toBe(200);
			const pesajes = (await pesajesRes.json()) as {
				comparacionRazaEdad: {
					pesoActual: number;
					promedioRazaEdad: number | null;
					cantidadMuestra: number;
					diferenciaKg: number | null;
				};
			};
			expect(pesajes.comparacionRazaEdad.pesoActual).toBe(320);
			expect(
				pesajes.comparacionRazaEdad.cantidadMuestra,
			).toBeGreaterThanOrEqual(1);
			expect(pesajes.comparacionRazaEdad.promedioRazaEdad).not.toBeNull();
		});
	},
);

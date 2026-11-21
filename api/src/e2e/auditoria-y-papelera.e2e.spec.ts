/**
 * E2E contra una BD real (migraciones aplicadas, `bun prisma/seed.ts` y `bun run sync:permisos`).
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

describe.skipIf(!E2E_URL)("Auditoría y papelera (e2e)", () => {
	let app: App;
	let prisma: Prisma;
	const sufijo = Date.now();
	const usuarios: Record<string, { id: number; token: string }> = {};
	let terrenoId: number;
	let propietarioId: number;
	let razaId: number;

	const crearUsuario = async (clave: string, role: "USER" | "ADMIN") => {
		const user = await prisma.user.create({
			data: {
				email: `${clave}-papelera-${sufijo}@e2e.test`,
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

	const call = (clave: string, method: string, path: string) =>
		app.request(path, {
			method,
			headers: { Authorization: `Bearer ${usuarios[clave]?.token}` },
		});

	const crearGanado = async (identificador: string) =>
		(
			await prisma.ganado.create({
				data: {
					identificador,
					peso: 300,
					fechaNacimiento: new Date("2024-01-01"),
					sexo: "MACHO",
					razaId,
					terrenoId,
					propietarioId,
				},
			})
		).id;

	// La auditoría se escribe sin await tras responder
	const esperarAuditoria = () => new Promise((r) => setTimeout(r, 100));

	beforeAll(async () => {
		({ prisma } = await import("@/core/config/prisma"));
		({ app } = await import("@/core/shared/infrastructure/http/server"));

		await crearUsuario("a", "USER");
		await crearUsuario("b", "USER");
		await crearUsuario("admin", "ADMIN");
		const usuarioId = usuarios.a?.id as number;
		terrenoId = (
			await prisma.terreno.create({
				data: {
					nombre: "T",
					ubicacion: "x",
					extensionHectareas: 1,
					capacidadMaxima: 100,
					usuarioId,
				},
			})
		).id;
		propietarioId = (
			await prisma.propietario.create({ data: { nombre: "P", usuarioId } })
		).id;
		razaId = (
			(await prisma.raza.findFirst()) ??
			(await prisma.raza.create({ data: { nombre: `R-${sufijo}` } }))
		).id;
	});

	afterAll(async () => {
		if (!prisma) return;
		const ids = Object.values(usuarios).map((u) => u.id);
		await prisma.ganado.deleteMany({
			where: { terrenoId, deletedAt: { not: undefined } },
		});
		await prisma.auditLog.deleteMany({ where: { usuarioId: { in: ids } } });
		await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
		await prisma.user.deleteMany({ where: { id: { in: ids } } });
	});

	it("un animal eliminado aparece en la papelera de su dueño y se puede restaurar", async () => {
		const id = await crearGanado(`PAP-${sufijo}-1`);
		expect((await call("a", "DELETE", `/api/ganado/${id}`)).status).toBe(200);

		const lista = await call("a", "GET", "/api/papelera/ganado");
		expect(lista.status).toBe(200);
		const { data } = (await lista.json()) as {
			data: { id: number; nombre: string }[];
		};
		expect(data.find((e) => e.id === id)?.nombre).toBe(`PAP-${sufijo}-1`);

		// Otro usuario no lo ve ni lo puede tocar
		const ajena = (await (
			await call("b", "GET", "/api/papelera/ganado")
		).json()) as {
			data: { id: number }[];
		};
		expect(ajena.data.some((e) => e.id === id)).toBe(false);
		expect(
			(await call("b", "POST", `/api/papelera/ganado/${id}/restaurar`)).status,
		).toBe(404);

		expect(
			(await call("a", "POST", `/api/papelera/ganado/${id}/restaurar`)).status,
		).toBe(200);
		expect((await call("a", "GET", `/api/ganado/${id}`)).status).toBe(200);
	});

	it("no restaura un identificador ya reutilizado por un animal activo", async () => {
		const identificador = `PAP-${sufijo}-2`;
		const id = await crearGanado(identificador);
		await call("a", "DELETE", `/api/ganado/${id}`);
		await crearGanado(identificador);

		expect(
			(await call("a", "POST", `/api/papelera/ganado/${id}/restaurar`)).status,
		).toBe(409);
	});

	it("no restaura un animal cuyo terreno sigue eliminado", async () => {
		const otroTerreno = await prisma.terreno.create({
			data: {
				nombre: "T2",
				ubicacion: "x",
				extensionHectareas: 1,
				capacidadMaxima: 10,
				usuarioId: usuarios.a?.id as number,
			},
		});
		const id = (
			await prisma.ganado.create({
				data: {
					identificador: `PAP-${sufijo}-3`,
					peso: 1,
					fechaNacimiento: new Date("2024-01-01"),
					sexo: "HEMBRA",
					razaId,
					terrenoId: otroTerreno.id,
					propietarioId,
					deletedAt: new Date(),
				},
			})
		).id;
		await prisma.terreno.update({
			where: { id: otroTerreno.id },
			data: { deletedAt: new Date() },
		});

		expect(
			(await call("a", "POST", `/api/papelera/ganado/${id}/restaurar`)).status,
		).toBe(409);

		// Borrado definitivo del animal y luego del terreno
		expect(
			(await call("a", "DELETE", `/api/papelera/ganado/${id}`)).status,
		).toBe(200);
		expect(
			(await call("a", "DELETE", `/api/papelera/terreno/${otroTerreno.id}`))
				.status,
		).toBe(200);
		expect(
			await prisma.terreno.findUnique({ where: { id: otroTerreno.id } }),
		).toBeNull();
	});

	it("un tipo desconocido da 404 y un elemento activo no está en la papelera", async () => {
		expect((await call("a", "GET", "/api/papelera/usuarios")).status).toBe(404);
		const id = await crearGanado(`PAP-${sufijo}-4`);
		expect(
			(await call("a", "DELETE", `/api/papelera/ganado/${id}`)).status,
		).toBe(404);
	});

	it("la purga borra lo antiguo y conserva lo referenciado", async () => {
		const { container } = await import(
			"@/core/shared/infrastructure/di/container"
		);
		const purga = container.resolve<
			import("@/core/papelera/application/useCases/PapeleraUseCases").PurgarPapeleraUseCase
		>("PurgarPapeleraUseCase");
		const hace40Dias = new Date(Date.now() - 40 * 86_400_000);

		const viejo = await crearGanado(`PAP-${sufijo}-5`);
		const reciente = await crearGanado(`PAP-${sufijo}-6`);
		await prisma.ganado.update({
			where: { id: viejo },
			data: { deletedAt: hace40Dias },
		});
		await prisma.ganado.update({
			where: { id: reciente },
			data: { deletedAt: new Date() },
		});

		await purga.run();

		expect(await prisma.ganado.findUnique({ where: { id: viejo } })).toBeNull();
		expect(
			await prisma.ganado.findUnique({ where: { id: reciente } }),
		).not.toBeNull();
	});

	it("registra las escrituras y solo un ADMIN consulta la auditoría", async () => {
		const id = await crearGanado(`PAP-${sufijo}-7`);
		await call("a", "DELETE", `/api/ganado/${id}`);
		await call("a", "GET", "/api/papelera/ganado");
		await esperarAuditoria();

		expect((await call("a", "GET", "/api/auditoria")).status).toBe(403);

		const res = await call(
			"admin",
			"GET",
			`/api/auditoria?usuarioId=${usuarios.a?.id}&limit=100`,
		);
		expect(res.status).toBe(200);
		const { data } = (await res.json()) as {
			data: {
				metodo: string;
				ruta: string;
				estado: number;
				usuario: { id: number };
			}[];
		};
		expect(
			data.some(
				(r) =>
					r.metodo === "DELETE" &&
					r.ruta === `/api/ganado/${id}` &&
					r.estado === 200,
			),
		).toBe(true);
		// Las lecturas no se registran
		expect(data.every((r) => r.metodo !== "GET")).toBe(true);
	});
});

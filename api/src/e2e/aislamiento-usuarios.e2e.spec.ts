/**
 * E2E contra una BD real (migraciones aplicadas y `bun prisma/seed.ts` ejecutado).
 * Se omite salvo que se indique E2E_DATABASE_URL:
 *
 *   E2E_DATABASE_URL=postgresql://... JWT_SECRET=x \
 *     bun test --preload reflect-metadata src/e2e
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

describe.skipIf(!E2E_URL)("Aislamiento de datos por usuario (e2e)", () => {
	let app: App;
	let prisma: Prisma;
	const sufijo = Date.now();
	const usuarios: Record<string, { id: number; token: string }> = {};

	const crearUsuario = async (clave: string, role: "USER" | "ADMIN") => {
		const user = await prisma.user.create({
			data: {
				email: `${clave}-${sufijo}@e2e.test`,
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

		// El rol USER no puede borrar sesiones; se concede directo para probar la propiedad
		if (role === "USER") {
			const permiso = await prisma.permission.findFirstOrThrow({
				where: { resource: "sesiones-sanitarias", action: "delete" },
			});
			await prisma.userPermission.create({
				data: { userId: user.id, permissionId: permiso.id },
			});
		}
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

	// Recursos creados por A
	let terrenoA: number;
	let propietarioA: number;
	let ganadoA: number;
	let veterinarioA: number;
	let insumoA: number;
	let sesionA: number;
	let razaId: number;
	let motivoBajaId: number;

	// Recursos de B (para cruzar referencias)
	let terrenoB: number;
	let propietarioB: number;

	beforeAll(async () => {
		({ prisma } = await import("@/core/config/prisma"));
		({ app } = await import("@/core/shared/infrastructure/http/server"));

		await crearUsuario("a", "USER");
		await crearUsuario("b", "USER");
		await crearUsuario("admin", "ADMIN");

		const raza =
			(await prisma.raza.findFirst()) ??
			(await prisma.raza.create({ data: { nombre: `Raza-${sufijo}` } }));
		razaId = raza.id;
		const motivo =
			(await prisma.motivoBaja.findFirst()) ??
			(await prisma.motivoBaja.create({
				data: { nombre: `Motivo-${sufijo}` },
			}));
		motivoBajaId = motivo.id;

		const crear = async (res: Response) => {
			expect([200, 201]).toContain(res.status);
			return ((await res.json()) as { id: number }).id;
		};

		terrenoA = await crear(
			await call(
				"a",
				"POST",
				"/api/terrenos",
				form({
					nombre: "TA",
					ubicacion: "x",
					extensionHectareas: 5,
					capacidadMaxima: 50,
				}),
			),
		);
		terrenoB = await crear(
			await call(
				"b",
				"POST",
				"/api/terrenos",
				form({
					nombre: "TB",
					ubicacion: "x",
					extensionHectareas: 5,
					capacidadMaxima: 50,
				}),
			),
		);
		propietarioA = await crear(
			await call("a", "POST", "/api/propietarios", form({ nombre: "PA" })),
		);
		propietarioB = await crear(
			await call("b", "POST", "/api/propietarios", form({ nombre: "PB" })),
		);
		ganadoA = await crear(
			await call(
				"a",
				"POST",
				"/api/ganado",
				form({
					identificador: `A-${sufijo}`,
					peso: 300,
					fechaNacimiento: "2024-01-01",
					sexo: "MACHO",
					razaId,
					terrenoId: terrenoA,
					propietarioId: propietarioA,
				}),
			),
		);
		veterinarioA = await crear(
			await call("a", "POST", "/api/veterinarios", {
				nombre: "Vet A",
				telefono: "555",
				cedulaProfesional: `CED-${sufijo}`,
			}),
		);
		insumoA = await crear(
			await call("a", "POST", "/api/insumos", {
				nombre: "Vacuna A",
				tipo: "VACUNA",
				stockInicial: 100,
				stockMinimo: 5,
				unidadMedida: "ml",
				lote: "L1",
				fechaCaducidad: "2030-01-01",
			}),
		);
		sesionA = await crear(
			await call("a", "POST", "/api/sesiones-sanitarias", {
				fecha: "2026-01-01",
				veterinarioId: veterinarioA,
				descripcion: "Vacunación",
				insumoId: insumoA,
				aplicaciones: [{ ganadoId: ganadoA, dosisAplicada: 2 }],
			}),
		);
	});

	afterAll(async () => {
		if (!prisma) return;
		const ids = Object.values(usuarios).map((u) => u.id);
		// Los hijos se eliminan en cascada con el usuario; ganado y sesiones primero por RESTRICT
		await prisma.aplicacionSanitaria.deleteMany({
			where: { ganadoId: ganadoA },
		});
		await prisma.sesionSanitaria.deleteMany({ where: { id: sesionA } });
		await prisma.ganado.deleteMany({
			where: { terrenoId: { in: [terrenoA, terrenoB] } },
		});
		await prisma.userPermission.deleteMany({ where: { userId: { in: ids } } });
		await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
		await prisma.user.deleteMany({ where: { id: { in: ids } } });
	});

	describe("ganado", () => {
		it("el dueño lo ve en listado y ficha", async () => {
			const lista = (await (await call("a", "GET", "/api/ganado")).json()) as {
				data: { id: number }[];
			};
			expect(lista.data.map((g) => g.id)).toContain(ganadoA);
			expect((await call("a", "GET", `/api/ganado/${ganadoA}`)).status).toBe(
				200,
			);
		});

		it("otro usuario no lo ve en el listado", async () => {
			const lista = (await (await call("b", "GET", "/api/ganado")).json()) as {
				data: { id: number }[];
			};
			expect(lista.data.map((g) => g.id)).not.toContain(ganadoA);
		});

		it("otro usuario recibe 404 al leer, editar, borrar y operar", async () => {
			const rutas: [string, string, Record<string, unknown> | undefined][] = [
				["GET", `/api/ganado/${ganadoA}`, undefined],
				["GET", `/api/ganado/A-${sufijo}`, undefined],
				["PUT", `/api/ganado/${ganadoA}`, undefined],
				["DELETE", `/api/ganado/${ganadoA}`, undefined],
				["POST", `/api/ganado/${ganadoA}/pesajes`, { peso: 1 }],
				["POST", `/api/ganado/${ganadoA}/traslados`, { terrenoId: terrenoB }],
				[
					"POST",
					`/api/ganado/${ganadoA}/baja`,
					{ motivoBajaId, fechaBaja: "2026-01-01" },
				],
			];
			for (const [method, path, body] of rutas) {
				const res = await call("b", method, path, body ?? form({ peso: 1 }));
				expect({ path, status: res.status }).toEqual({ path, status: 404 });
			}
		});

		it("no permite registrar ganado en terrenos o con propietarios ajenos", async () => {
			const base = {
				peso: 100,
				fechaNacimiento: "2024-01-01",
				sexo: "HEMBRA",
				razaId,
			};
			const conTerrenoAjeno = await call(
				"b",
				"POST",
				"/api/ganado",
				form({
					...base,
					identificador: `X1-${sufijo}`,
					terrenoId: terrenoA,
					propietarioId: propietarioB,
				}),
			);
			const conPropietarioAjeno = await call(
				"b",
				"POST",
				"/api/ganado",
				form({
					...base,
					identificador: `X2-${sufijo}`,
					terrenoId: terrenoB,
					propietarioId: propietarioA,
				}),
			);
			const conPadreAjeno = await call(
				"b",
				"POST",
				"/api/ganado",
				form({
					...base,
					identificador: `X3-${sufijo}`,
					terrenoId: terrenoB,
					propietarioId: propietarioB,
					padreId: ganadoA,
				}),
			);
			expect(conTerrenoAjeno.status).toBe(404);
			expect(conPropietarioAjeno.status).toBe(404);
			expect(conPadreAjeno.status).toBe(404);
		});

		it("el ADMIN accede al ganado de cualquier usuario", async () => {
			expect(
				(await call("admin", "GET", `/api/ganado/${ganadoA}`)).status,
			).toBe(200);
		});

		it("el ganado de A sigue intacto tras los intentos ajenos", async () => {
			const res = await call("a", "GET", `/api/ganado/${ganadoA}`);
			const ficha = (await res.json()) as {
				peso: number;
				terreno: { id: number };
			};
			expect(ficha.peso).toBe(300);
			expect(ficha.terreno.id).toBe(terrenoA);
		});
	});

	describe("propietarios", () => {
		it("cada usuario solo lista los suyos", async () => {
			const deA = (await (
				await call("a", "GET", "/api/propietarios")
			).json()) as {
				data: { id: number }[];
			};
			const deB = (await (
				await call("b", "GET", "/api/propietarios")
			).json()) as {
				data: { id: number }[];
			};
			expect(deA.data.map((p) => p.id)).toContain(propietarioA);
			expect(deA.data.map((p) => p.id)).not.toContain(propietarioB);
			expect(deB.data.map((p) => p.id)).not.toContain(propietarioA);
		});

		it("otro usuario recibe 404 al leer, editar y borrar", async () => {
			for (const method of ["GET", "PUT", "DELETE"]) {
				const res = await call(
					"b",
					method,
					`/api/propietarios/${propietarioA}`,
					form({ nombre: "hack" }),
				);
				expect({ method, status: res.status }).toEqual({ method, status: 404 });
			}
		});

		it("el correo solo es único dentro del mismo usuario", async () => {
			const correo = `dup-${sufijo}@e2e.test`;
			const a = await call(
				"a",
				"POST",
				"/api/propietarios",
				form({ nombre: "A1", correo }),
			);
			const b = await call(
				"b",
				"POST",
				"/api/propietarios",
				form({ nombre: "B1", correo }),
			);
			const aRepetido = await call(
				"a",
				"POST",
				"/api/propietarios",
				form({ nombre: "A2", correo }),
			);
			expect(a.status).toBe(201);
			expect(b.status).toBe(201);
			expect(aRepetido.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe("sesiones sanitarias", () => {
		it("otro usuario no las ve ni las modifica", async () => {
			const lista = (await (
				await call("b", "GET", "/api/sesiones-sanitarias")
			).json()) as {
				data: { id: number }[];
			};
			expect(lista.data.map((s) => s.id)).not.toContain(sesionA);

			expect(
				(await call("b", "GET", `/api/sesiones-sanitarias/${sesionA}`)).status,
			).toBe(404);
			expect(
				(await call("b", "DELETE", `/api/sesiones-sanitarias/${sesionA}`))
					.status,
			).toBe(404);
		});

		it("otro usuario no ve el historial sanitario de un animal ajeno", async () => {
			const res = await call(
				"b",
				"GET",
				`/api/sesiones-sanitarias/ganado/${ganadoA}/historial`,
			);
			expect(res.status).toBe(404);
		});

		it("no permite usar veterinario, insumo o animales ajenos al registrar", async () => {
			const res = await call("b", "POST", "/api/sesiones-sanitarias", {
				fecha: "2026-01-01",
				veterinarioId: veterinarioA,
				descripcion: "Intento",
				insumoId: insumoA,
				aplicaciones: [{ ganadoId: ganadoA, dosisAplicada: 1 }],
			});
			expect(res.status).toBe(404);
			const insumo = await prisma.insumo.findUnique({ where: { id: insumoA } });
			expect(insumo?.stock).toBe(98);
		});

		it("el dueño sí las ve", async () => {
			expect(
				(await call("a", "GET", `/api/sesiones-sanitarias/${sesionA}`)).status,
			).toBe(200);
		});
	});

	describe("usuarios (U-5 y U-7)", () => {
		it("PUT /api/user/:id aplica nombre, correo y contraseña, y revoca sesiones", async () => {
			await prisma.refreshToken.create({
				data: {
					tokenHash: `h-${sufijo}`,
					userId: usuarios.b?.id as number,
					expiresAt: new Date(Date.now() + 86_400_000),
				},
			});

			const res = await call("admin", "PUT", `/api/user/${usuarios.b?.id}`, {
				name: "Nuevo Nombre",
				email: `nuevo-${sufijo}@e2e.test`,
				password: "NuevaClave#12345",
			});
			expect(res.status).toBe(200);

			const guardado = await prisma.user.findUnique({
				where: { id: usuarios.b?.id },
			});
			expect(guardado?.name).toBe("Nuevo Nombre");
			expect(guardado?.email).toBe(`nuevo-${sufijo}@e2e.test`);
			expect(guardado?.password).not.toBe("x");
			expect(guardado?.password).toStartWith("$2");

			const token = await prisma.refreshToken.findUnique({
				where: { tokenHash: `h-${sufijo}` },
			});
			expect(token?.revoked).toBe(true);
		});

		it("rechaza un correo ya usado por otro usuario", async () => {
			const res = await call("admin", "PUT", `/api/user/${usuarios.b?.id}`, {
				email: `A-${sufijo}@e2e.test`,
			});
			expect(res.status).toBe(400);
		});

		it("un usuario desactivado pierde el acceso, el login y el refresh", async () => {
			const hash = await Bun.password.hash("ClaveSegura#123", {
				algorithm: "bcrypt",
			});
			await prisma.user.update({
				where: { id: usuarios.a?.id },
				data: { password: hash },
			});
			const email = `a-${sufijo}@e2e.test`;
			const login = () =>
				app.request("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-forwarded-for": "1.1.1.1",
					},
					body: JSON.stringify({ email, password: "ClaveSegura#123" }),
				});

			const ok = await login();
			expect(ok.status).toBe(200);
			const cookie = ok.headers.get("set-cookie")?.split(";")[0] as string;

			const desactivar = await call(
				"admin",
				"PUT",
				`/api/user/${usuarios.a?.id}`,
				{ isActive: false },
			);
			expect(desactivar.status).toBe(200);

			// El access token aún vigente deja de tener permisos
			expect((await call("a", "GET", "/api/ganado")).status).toBe(403);
			expect((await login()).status).toBe(401);

			const refresh = await app.request("/api/auth/refresh", {
				method: "POST",
				headers: { Cookie: cookie },
			});
			expect(refresh.status).toBe(401);

			// Reactivar restablece el acceso
			await call("admin", "PUT", `/api/user/${usuarios.a?.id}`, {
				isActive: true,
			});
			expect((await call("a", "GET", "/api/ganado")).status).toBe(200);
		});
	});

	describe("refresh tokens (M-1)", () => {
		const post = (cookie: string) =>
			app.request("/api/auth/refresh", {
				method: "POST",
				headers: { Cookie: cookie },
			});
		const cookieDe = (res: Response) =>
			res.headers.get("set-cookie")?.split(";")[0] as string;

		const iniciarSesion = async () => {
			const email = `rt-${sufijo}-${Math.random().toString(36).slice(2)}@e2e.test`;
			const hash = await Bun.password.hash("ClaveSegura#123", {
				algorithm: "bcrypt",
			});
			const user = await prisma.user.create({
				data: {
					email,
					name: "rt",
					password: hash,
					roles: { create: { role: { connect: { name: "USER" } } } },
				},
			});
			usuarios[email] = { id: user.id, token: "" };
			const res = await app.request("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password: "ClaveSegura#123" }),
			});
			expect(res.status).toBe(200);
			return { userId: user.id, cookie: cookieDe(res) };
		};

		const activos = (userId: number) =>
			prisma.refreshToken.count({ where: { userId, revoked: false } });

		it("rota el token y el anterior queda revocado", async () => {
			const { userId, cookie } = await iniciarSesion();
			const res = await post(cookie);
			expect(res.status).toBe(200);
			expect(cookieDe(res)).not.toBe(cookie);
			expect(await activos(userId)).toBe(1);
		});

		it("reusar un token ya rotado revoca todas las sesiones del usuario", async () => {
			const { userId, cookie } = await iniciarSesion();
			const rotado = await post(cookie);
			const nuevaCookie = cookieDe(rotado);
			expect(await activos(userId)).toBe(1);

			// Un atacante presenta el token viejo
			expect((await post(cookie)).status).toBe(401);
			expect(await activos(userId)).toBe(0);

			// El token legítimo más reciente también queda invalidado
			expect((await post(nuevaCookie)).status).toBe(401);
		});

		it("dos refresh simultáneos con el mismo token no pueden prosperar ambos", async () => {
			const { userId, cookie } = await iniciarSesion();
			const respuestas = await Promise.all([post(cookie), post(cookie)]);
			const exitosas = respuestas.filter((r) => r.status === 200);

			expect(exitosas.length).toBeLessThanOrEqual(1);
			expect(respuestas.some((r) => r.status === 401)).toBe(true);
			// La pérdida de la carrera se trata como reuso: no quedan sesiones activas
			expect(await activos(userId)).toBe(0);
		});

		it("un token expirado se rechaza sin tocar el resto de sesiones", async () => {
			const { userId, cookie } = await iniciarSesion();
			await prisma.refreshToken.updateMany({
				where: { userId },
				data: { expiresAt: new Date(Date.now() - 1000) },
			});
			const otraSesion = await prisma.refreshToken.create({
				data: {
					tokenHash: `otro-${sufijo}-${userId}`,
					userId,
					expiresAt: new Date(Date.now() + 86_400_000),
				},
			});

			expect((await post(cookie)).status).toBe(401);
			const intacta = await prisma.refreshToken.findUnique({
				where: { id: otraSesion.id },
			});
			expect(intacta?.revoked).toBe(false);
		});
	});

	describe("errores y autenticación (M-2 y M-3)", () => {
		it("rechaza un JWT válido pero sin id de usuario", async () => {
			const token = jwt.sign(
				{ role: "ADMIN" },
				process.env.JWT_SECRET as string,
			);
			const res = await app.request("/api/ganado", {
				headers: { Authorization: `Bearer ${token}` },
			});
			expect(res.status).toBe(401);
		});

		it("rechaza un JWT firmado con otro algoritmo", async () => {
			const token = jwt.sign(
				{ id: 1, role: "ADMIN" },
				process.env.JWT_SECRET as string,
				{
					algorithm: "HS512",
				},
			);
			const res = await app.request("/api/ganado", {
				headers: { Authorization: `Bearer ${token}` },
			});
			expect(res.status).toBe(401);
		});

		it("un conflicto de unicidad devuelve 409 sin detalles de la BD", async () => {
			const cedula = `DUP-${sufijo}`;
			const alta = () =>
				call("a", "POST", "/api/veterinarios", {
					nombre: "Dup",
					telefono: "1",
					cedulaProfesional: cedula,
				});
			expect((await alta()).status).toBe(201);
			const res = await alta();
			expect(res.status).toBeGreaterThanOrEqual(400);
			expect(res.status).toBeLessThan(500);
			expect(JSON.stringify(await res.json())).not.toContain("prisma");
		});
	});
});

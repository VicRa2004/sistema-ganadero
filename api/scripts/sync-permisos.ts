import { prisma } from "../src/core/config/prisma";
import {
	ACCIONES,
	type PermissionKey,
	RECURSOS,
} from "../src/modules/authorization/domain/Recursos";

/** Permisos de cada rol. ADMIN recibe todo el catálogo. */
const PERMISOS_POR_ROL: Record<string, PermissionKey[] | "*"> = {
	ADMIN: "*",
	USER: [
		"ganado:read",
		"ganado:create",
		"ganado:update",
		"ganado:delete",
		"terreno:read",
		"terreno:create",
		"terreno:update",
		"terreno:delete",
		"inventario-insumos:read",
		"inventario-insumos:create",
		"inventario-insumos:update",
		"inventario-insumos:delete",
		"propietario:read",
		"propietario:create",
		"propietario:update",
		"propietario:delete",
		"sesiones-sanitarias:read",
		"sesiones-sanitarias:create",
		"sesiones-sanitarias:update",
		"tratamientos-medicos:read",
		"tratamientos-medicos:create",
		"tratamientos-medicos:update",
		"veterinarios:read",
		"veterinarios:create",
		"veterinarios:update",
		"veterinarios:delete",
		"reproduccion:read",
		"reproduccion:create",
		"reproduccion:update",
		"reproduccion:delete",
		"comercial:read",
		"comercial:create",
		"comercial:update",
		"comercial:delete",
		"lotes:read",
		"lotes:create",
		"lotes:update",
		"lotes:delete",
		"alimentacion:read",
		"alimentacion:create",
		"alimentacion:update",
		"alimentacion:delete",
	],
};

const clave = (p: { resource: string; action: string }) =>
	`${p.resource}:${p.action}`;

/**
 * Sincroniza la BD con el catálogo `Recursos.ts` y `PERMISOS_POR_ROL`:
 * crea permisos que falten, borra los que ya no existen en el catálogo
 * y deja cada rol con exactamente sus permisos. Idempotente.
 * No toca los permisos directos por usuario salvo los de permisos borrados.
 */
export async function syncPermisos() {
	const catalogo = RECURSOS.flatMap((resource) =>
		ACCIONES.map((action) => ({ resource, action })),
	);
	const claves = new Set(catalogo.map(clave));

	const existentes = await prisma.permission.findMany();
	const obsoletos = existentes
		.filter((p) => !claves.has(clave(p)))
		.map((p) => p.id);
	const yaExisten = new Set(existentes.map(clave));
	const faltantes = catalogo.filter((p) => !yaExisten.has(clave(p)));

	await prisma.$transaction(async (tx) => {
		if (obsoletos.length) {
			await tx.rolePermission.deleteMany({
				where: { permissionId: { in: obsoletos } },
			});
			await tx.userPermission.deleteMany({
				where: { permissionId: { in: obsoletos } },
			});
			await tx.permission.deleteMany({ where: { id: { in: obsoletos } } });
		}
		if (faltantes.length) await tx.permission.createMany({ data: faltantes });

		const permisos = await tx.permission.findMany();
		const idPorClave = new Map(permisos.map((p) => [clave(p), p.id]));

		for (const [rolName, asignados] of Object.entries(PERMISOS_POR_ROL)) {
			const rol = await tx.role.findUnique({ where: { name: rolName } });
			if (!rol) {
				console.warn(`⚠️  Rol ${rolName} no existe, se omite`);
				continue;
			}
			const ids =
				asignados === "*"
					? permisos.map((p) => p.id)
					: asignados.map((k) => idPorClave.get(k) as number);

			await tx.rolePermission.deleteMany({
				where: { roleId: rol.id, permissionId: { notIn: ids } },
			});
			await tx.rolePermission.createMany({
				data: ids.map((permissionId) => ({ roleId: rol.id, permissionId })),
				skipDuplicates: true,
			});
		}
	});

	console.log(
		`✅ Permisos sincronizados (+${faltantes.length} creados, -${obsoletos.length} eliminados)`,
	);
}

if (import.meta.main) {
	syncPermisos()
		.catch((e) => {
			console.error("❌ Error sincronizando permisos:", e);
			process.exitCode = 1;
		})
		.finally(() => prisma.$disconnect());
}

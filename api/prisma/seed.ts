import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
	console.log("🌱 Iniciando el proceso de seed...");

	// ─── 1. Roles ───────────────────────────────────────────────────────────────
	const rolesData = [
		{ name: "ADMIN", description: "Administrador con acceso total" },
		{
			name: "USER",
			description: "Usuario estándar de consulta y operación básica",
		},
	];

	const rolesMap: Record<
		string,
		{ id: number; name: string; description: string | null; isActive: boolean }
	> = {};

	for (const role of rolesData) {
		const dbRole = await prisma.role.upsert({
			where: { name: role.name },
			update: { description: role.description },
			create: role,
		});
		rolesMap[role.name] = dbRole;
	}
	console.log("✅ Roles inicializados");

	// ─── 2. Recursos y Permisos atómicos ─────────────────────────────────────────
	const resources = [
		"users",
		"permissions",
		"ganado",
		"terreno",
		"inventario-insumos",
		"propietario",
		"razas",
		"sesiones-sanitarias",
		"tratamientos-medicos",
		"veterinarios",
	];
	const actions = ["create", "read", "update", "delete"];

	const permissionsList: { resource: string; action: string }[] = [];
	for (const resource of resources) {
		for (const action of actions) {
			permissionsList.push({ resource, action });
		}
	}

	const permissionsMap: Record<
		string,
		{ id: number; resource: string; action: string }
	> = {};

	for (const perm of permissionsList) {
		const dbPerm = await prisma.permission.upsert({
			where: {
				resource_action: { resource: perm.resource, action: perm.action },
			},
			update: {},
			create: perm,
		});
		permissionsMap[`${perm.resource}:${perm.action}`] = dbPerm;
	}
	console.log("✅ Permisos atómicos inicializados");

	// ─── 3. Asignación de permisos a roles (Idempotente & Limpieza de obsoletos) ──
	const rolePermissionsSetup: Record<string, string[]> = {
		ADMIN: Object.keys(permissionsMap), // Todos los permisos
		USER: [
			// Lectura de todo el negocio
			"ganado:read",
			"terreno:read",
			"inventario-insumos:read",
			"propietario:read",
			"propietario:create",
			"propietario:update",
			"propietario:delete",
			"sesiones-sanitarias:read",
			"tratamientos-medicos:read",
			"veterinarios:read",
			// Operación básica (creación, actualización, eliminación)
			"ganado:create",
			"ganado:update",
			"terreno:create",
			"terreno:update",
			"terreno:delete",
			"inventario-insumos:create",
			"inventario-insumos:update",
			"sesiones-sanitarias:create",
			"sesiones-sanitarias:update",
			"tratamientos-medicos:create",
			"tratamientos-medicos:update",
			"veterinarios:create",
			"veterinarios:update",
			"veterinarios:delete",
		],
	};

	for (const [roleName, allowedPermKeys] of Object.entries(
		rolePermissionsSetup,
	)) {
		const role = rolesMap[roleName];
		if (!role) continue;

		const targetPermissionIds: number[] = [];

		for (const key of allowedPermKeys) {
			const perm = permissionsMap[key];
			if (perm) {
				targetPermissionIds.push(perm.id);
			}
		}

		// Registrar los permisos requeridos de forma idempotente
		for (const permissionId of targetPermissionIds) {
			await prisma.rolePermission.upsert({
				where: {
					roleId_permissionId: { roleId: role.id, permissionId },
				},
				update: {},
				create: { roleId: role.id, permissionId },
			});
		}

		// Purgar permisos que hayan sido eliminados del seed para este rol
		await prisma.rolePermission.deleteMany({
			where: {
				roleId: role.id,
				permissionId: { notIn: targetPermissionIds },
			},
		});
	}
	console.log(
		"✅ Permisos asignados a roles (limpieza de obsoletos realizada)",
	);

	// ─── 4. Usuarios de prueba ───────────────────────────────────────────────────
	const passwordHash = await bcrypt.hash("SecurePass123!", 10);

	const usersData = [
		{
			email: "admin@dev.com",
			name: "Administrador",
			password: passwordHash,
			roleName: "ADMIN",
		},
		{
			email: "user@dev.com",
			name: "Usuario Estándar",
			password: passwordHash,
			roleName: "USER",
		},
	];

	for (const { roleName, ...userFields } of usersData) {
		// Crear o actualizar usuario
		const user = await prisma.user.upsert({
			where: { email: userFields.email },
			update: {
				name: userFields.name,
				password: userFields.password,
			},
			create: userFields,
		});

		const role = rolesMap[roleName];
		if (!role) continue;

		// Asignar el rol de forma idempotente a través de UserRole
		await prisma.userRole.upsert({
			where: { userId_roleId: { userId: user.id, roleId: role.id } },
			update: {},
			create: { userId: user.id, roleId: role.id },
		});

		// Purgar otros roles del usuario si queremos asegurar que solo tenga el rol de seed
		await prisma.userRole.deleteMany({
			where: {
				userId: user.id,
				roleId: { not: role.id },
			},
		});
	}

	// Opcional: Desactivar o eliminar roles obsoletos de la base de datos que no están en el seed (ej. "MOD")
	const activeRoleIds = Object.values(rolesMap).map((r) => r.id);
	await prisma.role.updateMany({
		where: {
			id: { notIn: activeRoleIds },
		},
		data: {
			isActive: false,
		},
	});

	console.log(
		"✅ Usuarios de prueba creados (CONTRASEÑA PARA TODOS: SecurePass123!)",
	);
	console.log("   - admin@dev.com (ADMIN) → todos los permisos");
	console.log(
		"   - user@dev.com  (USER)  → lectura global y operaciones de negocio",
	);

	// ─── 5. Semillas de Razas de Ganado ──────────────────────────────────────────
	const razasData = [
		{
			nombre: "Angus",
			descripcion:
				"Raza productora de carne de alta calidad, originaria de Escocia.",
		},
		{
			nombre: "Hereford",
			descripcion:
				"Excelente adaptabilidad y docilidad, carne de gran calidad.",
		},
		{
			nombre: "Charolais",
			descripcion:
				"Raza francesa de gran tamaño y musculatura, excelente rendimiento.",
		},
		{
			nombre: "Holstein",
			descripcion: "Raza lechera por excelencia, gran volumen de producción.",
		},
		{
			nombre: "Brahman",
			descripcion:
				"Raza tolerante al calor y parásitos, ideal para climas cálidos.",
		},
		{
			nombre: "Nelore",
			descripcion:
				"Muy resistente a climas tropicales y pasturas de baja calidad.",
		},
		{
			nombre: "Simmental",
			descripcion: "Doble propósito (carne y leche), gran crecimiento.",
		},
	];

	for (const raza of razasData) {
		await prisma.raza.upsert({
			where: { nombre: raza.nombre },
			update: { descripcion: raza.descripcion },
			create: raza,
		});
	}
	console.log("✅ Razas de ganado inicializadas");

	// ─── 6. Semillas de Veterinarios ─────────────────────────────────────────────
	const dbAdmin = await prisma.user.findFirst({
		where: { email: "admin@dev.com" },
	});
	const dbUser = await prisma.user.findFirst({
		where: { email: "user@dev.com" },
	});

	const veterinariosData = [
		{
			nombre: "Dr. Juan Pérez",
			telefono: "555-0199",
			cedulaProfesional: "VET-12345",
			especialidad: "Cirugía y Reproducción",
			usuarioId: dbAdmin?.id ?? 1,
		},
		{
			nombre: "Dra. María López",
			telefono: "555-0188",
			cedulaProfesional: "VET-67890",
			especialidad: "Nutrición y Epidemiología",
			usuarioId: dbUser?.id ?? 2,
		},
	];

	for (const vet of veterinariosData) {
		await prisma.veterinario.upsert({
			where: { cedulaProfesional: vet.cedulaProfesional },
			update: {
				nombre: vet.nombre,
				telefono: vet.telefono,
				especialidad: vet.especialidad,
				usuarioId: vet.usuarioId,
			},
			create: vet,
		});
	}
	console.log("✅ Veterinarios inicializados");

	// ─── 7. Semillas de Motivos de Baja ──────────────────────────────────────────
	const motivosBajaData = [
		{ nombre: "VENTA", descripcion: "El animal fue vendido a un tercero." },
		{
			nombre: "MUERTE NATURAL",
			descripcion: "El animal falleció por causas naturales.",
		},
		{
			nombre: "ENFERMEDAD",
			descripcion:
				"El animal fue dado de baja por enfermedad grave o terminal.",
		},
		{ nombre: "ROBO", descripcion: "El animal fue robado." },
		{
			nombre: "SACRIFICIO",
			descripcion: "El animal fue sacrificado para consumo o por bienestar.",
		},
		{
			nombre: "OTRO",
			descripcion:
				"Motivo de baja no contemplado en las categorías anteriores.",
		},
	];

	for (const motivo of motivosBajaData) {
		await prisma.motivoBaja.upsert({
			where: { nombre: motivo.nombre },
			update: { descripcion: motivo.descripcion },
			create: motivo,
		});
	}
	console.log("✅ Motivos de baja inicializados");
}

main()
	.then(async () => {
		await prisma.$disconnect();
		console.log("🏁 Seed finalizado correctamente.");
	})
	.catch(async (e) => {
		console.error("❌ Error ejecutando seed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});

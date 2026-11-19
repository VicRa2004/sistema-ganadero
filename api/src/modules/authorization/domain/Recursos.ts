/**
 * Catálogo único de recursos y acciones protegidos por permisos.
 * El seed y los routers lo comparten: un recurso o acción mal escrito
 * falla al compilar en lugar de dar un 403 silencioso.
 */
export const RECURSOS = [
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
	"reproduccion",
	"comercial",
	"lotes",
	"alimentacion",
] as const;

export type Recurso = (typeof RECURSOS)[number];

export const ACCIONES = ["create", "read", "update", "delete"] as const;

export type Accion = (typeof ACCIONES)[number];

export type PermissionKey = `${Recurso}:${Accion}`;

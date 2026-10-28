/**
 * Catálogo único de recursos protegidos por permisos. El seed y los routers
 * lo comparten: un recurso mal escrito en una ruta falla al compilar en lugar
 * de dar un 403 silencioso.
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
] as const;

export type Recurso = (typeof RECURSOS)[number];

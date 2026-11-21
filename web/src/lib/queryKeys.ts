/**
 * Registro centralizado de Query Keys para TanStack Query.
 * Garantiza invalidaciones granulares y evita typos (ej. `"ganados"` vs `"ganado"`).
 */
export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		permissions: (userId: number) => ["auth", "permissions", userId] as const,
	},
	dashboard: {
		all: ["dashboard"] as const,
		resumen: () => ["dashboard", "resumen"] as const,
	},
	ganado: {
		all: ["ganado"] as const,
		lists: () => ["ganado", "list"] as const,
		list: (filters?: unknown) => ["ganado", "list", filters] as const,
		detail: (idOrIdentificador: number | string) =>
			["ganado", "ficha", idOrIdentificador] as const,
		pesajes: (id: number) => ["ganado", "pesajes", id] as const,
		traslados: (id: number) => ["ganado", "traslados", id] as const,
		genealogia: (id: number, generaciones?: number) =>
			["ganado", "genealogia", id, generaciones] as const,
		motivosBaja: () => ["ganado", "motivos-baja"] as const,
	},
	insumos: {
		all: ["insumos"] as const,
		lists: () => ["insumos", "list"] as const,
		list: (filters?: unknown) => ["insumos", "list", filters] as const,
		criticos: () => ["insumos", "criticos"] as const,
		detail: (id: number) => ["insumos", "detail", id] as const,
		kardexPrefix: (id: number) => ["insumos", "kardex", id] as const,
		kardex: (id: number, filters?: unknown) =>
			["insumos", "kardex", id, filters] as const,
	},
	terrenos: {
		all: ["terrenos"] as const,
		lists: () => ["terrenos", "list"] as const,
		list: (page?: number, limit?: number) =>
			["terrenos", "list", page, limit] as const,
		detail: (id: number) => ["terrenos", "detail", id] as const,
		capacidad: (id: number) => ["terrenos", "detail", id, "capacidad"] as const,
	},
	propietarios: {
		all: ["propietarios"] as const,
		lists: () => ["propietarios", "list"] as const,
		list: (page?: number, limit?: number) =>
			["propietarios", "list", page, limit] as const,
		detail: (id: number) => ["propietarios", "detail", id] as const,
	},
	razas: {
		all: ["razas"] as const,
		list: () => ["razas", "list"] as const,
	},
	veterinarios: {
		all: ["veterinarios"] as const,
		lists: () => ["veterinarios", "list"] as const,
		list: (filters?: unknown) => ["veterinarios", "list", filters] as const,
		detail: (id: number) => ["veterinarios", "detail", id] as const,
	},
	sesionesSanitarias: {
		all: ["sesiones-sanitarias"] as const,
		lists: () => ["sesiones-sanitarias", "list"] as const,
		list: (filters?: unknown) =>
			["sesiones-sanitarias", "list", filters] as const,
		detail: (id: number) => ["sesiones-sanitarias", "detail", id] as const,
		historialGanado: (ganadoId: number) =>
			["sesiones-sanitarias", "historial-ganado", ganadoId] as const,
		calendario: (filters?: unknown) =>
			["sesiones-sanitarias", "calendario", filters] as const,
		calendarioAll: () => ["sesiones-sanitarias", "calendario"] as const,
		planes: () => ["sesiones-sanitarias", "planes"] as const,
	},
	tratamientosMedicos: {
		all: ["tratamientos-medicos"] as const,
		lists: () => ["tratamientos-medicos", "list"] as const,
		list: (filters?: unknown) =>
			["tratamientos-medicos", "list", filters] as const,
		detail: (id: number) => ["tratamientos-medicos", "detail", id] as const,
		porGanado: (ganadoId: number) =>
			["tratamientos-medicos", "ganado", ganadoId] as const,
	},
	reproduccion: {
		all: ["reproduccion"] as const,
		eventosAll: () => ["reproduccion", "eventos"] as const,
		eventos: (filters?: unknown) =>
			["reproduccion", "eventos", filters] as const,
		indicadoresAll: () => ["reproduccion", "indicadores"] as const,
		indicadores: (params?: unknown) =>
			["reproduccion", "indicadores", params] as const,
	},
	notificaciones: {
		all: ["notificaciones"] as const,
		lists: () => ["notificaciones", "list"] as const,
		list: (soloNoLeidas?: boolean, limit?: number) =>
			["notificaciones", "list", { soloNoLeidas, limit }] as const,
		preferencias: () => ["notificaciones", "preferencias"] as const,
	},
	usuarios: {
		all: ["usuarios"] as const,
		lists: () => ["usuarios", "list"] as const,
		list: (filters?: unknown) => ["usuarios", "list", filters] as const,
	},
	permisos: {
		all: ["permisos"] as const,
		list: () => ["permisos", "list"] as const,
		roles: () => ["permisos", "roles"] as const,
		userAccess: (userId: number) =>
			["permisos", "user-access", userId] as const,
	},
	lotes: {
		all: ["lotes"] as const,
		lists: () => ["lotes", "list"] as const,
		list: (filters?: unknown) => ["lotes", "list", filters] as const,
		detail: (id: number) => ["lotes", "detail", id] as const,
	},
	alimentacion: {
		all: ["alimentacion"] as const,
		racionesAll: () => ["alimentacion", "raciones"] as const,
		raciones: (filters?: unknown) =>
			["alimentacion", "raciones", filters] as const,
		suministrosAll: () => ["alimentacion", "suministros"] as const,
		suministros: (filters?: unknown) =>
			["alimentacion", "suministros", filters] as const,
		autonomia: () => ["alimentacion", "autonomia"] as const,
	},
	papelera: {
		all: ["papelera"] as const,
		list: (tipo: string, page: number) => ["papelera", tipo, page] as const,
	},
	auditoria: {
		list: (filters: unknown) => ["auditoria", filters] as const,
	},
	comercial: {
		all: ["comercial"] as const,
		transaccionesAll: () => ["comercial", "transacciones"] as const,
		transacciones: (filters?: unknown) =>
			["comercial", "transacciones", filters] as const,
		transaccionDetail: (id: number) =>
			["comercial", "transacciones", "detail", id] as const,
		gastosAll: () => ["comercial", "gastos"] as const,
		gastos: (filters?: unknown) => ["comercial", "gastos", filters] as const,
		rentabilidadAll: () => ["comercial", "rentabilidad"] as const,
		rentabilidad: (filters?: unknown) =>
			["comercial", "rentabilidad", filters] as const,
		rentabilidadGanado: (ganadoId: number) =>
			["comercial", "rentabilidad", "ganado", ganadoId] as const,
	},
} as const;

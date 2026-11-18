export const TIPOS_NOTIFICACION = [
	"STOCK_BAJO",
	"INSUMO_POR_CADUCAR",
	"TRATAMIENTO_POR_VENCER",
	"SESION_PROGRAMADA",
	"VACUNA_PENDIENTE",
] as const;

export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

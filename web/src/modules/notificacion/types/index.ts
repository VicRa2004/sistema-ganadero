export type TipoNotificacion =
	| "STOCK_BAJO"
	| "INSUMO_POR_CADUCAR"
	| "TRATAMIENTO_POR_VENCER"
	| "SESION_PROGRAMADA"
	| "VACUNA_PENDIENTE"
	| "PARTO_PROXIMO";

export interface NotificacionDto {
	id: number;
	usuarioId: number;
	tipo: TipoNotificacion;
	titulo: string;
	cuerpo: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
	leida: boolean;
	leidaAt: string | null;
	createdAt: string;
}

export interface ListarNotificacionesResponse {
	data: NotificacionDto[];
	page: number;
	totalItems: number;
	totalPages: number;
	noLeidas: number;
}

export interface PreferenciaNotificacionDto {
	tipo: TipoNotificacion;
	inApp: boolean;
	email: boolean;
}

export const TIPO_NOTIFICACION_LABELS: Record<
	TipoNotificacion,
	{ label: string; descripcion: string }
> = {
	STOCK_BAJO: {
		label: "Stock bajo de insumos",
		descripcion: "Aviso cuando un insumo alcanza o baja de su stock mínimo.",
	},
	INSUMO_POR_CADUCAR: {
		label: "Insumos próximos a caducar",
		descripcion: "Alertas a 30, 15 y 7 días antes de la fecha de caducidad.",
	},
	TRATAMIENTO_POR_VENCER: {
		label: "Tratamientos por terminar o vencidos",
		descripcion:
			"Recordatorios de tratamientos médicos activos próximos a su fecha fin.",
	},
	SESION_PROGRAMADA: {
		label: "Sesiones sanitarias programadas",
		descripcion: "Recordatorios de jornadas y planes de vacunación próximos.",
	},
	VACUNA_PENDIENTE: {
		label: "Animales sin vacuna vigente",
		descripcion:
			"Resumen mensual de animales sin vacunación registrada en 6 meses.",
	},
	PARTO_PROXIMO: {
		label: "Partos próximos estimados",
		descripcion:
			"Aviso de hembras con fecha probable de parto dentro de los próximos 14 días.",
	},
};

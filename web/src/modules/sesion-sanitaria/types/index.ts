export type EstadoSesionSanitaria = "PROGRAMADA" | "REALIZADA" | "CANCELADA";

export interface AplicacionSanitariaInput {
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface RegistrarSesionSanitariaInput {
	fecha: string;
	veterinarioId: number;
	descripcion: string;
	insumoId: number;
	estado?: "PROGRAMADA" | "REALIZADA";
	aplicaciones: AplicacionSanitariaInput[];
}

export interface RegistrarResultadoAnimalInput {
	sesionId: number;
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface AplicacionSanitariaDto {
	id: number;
	sesionId: number;
	ganadoId: number;
	identificadorGanado?: string;
	dosisAplicada: number;
	observaciones: string | null;
	createdAt?: string;
}

export interface SesionSanitariaDto {
	id: number;
	fecha: string;
	estado: EstadoSesionSanitaria;
	planSanitarioId: number | null;
	veterinarioId: number;
	nombreVeterinario?: string;
	descripcion: string;
	insumoId: number;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	totalDosisAplicadas: number;
	totalAnimales: number;
	aplicaciones: AplicacionSanitariaDto[];
	createdAt?: string;
}

export interface HistorialSanitarioGanadoDto {
	aplicacionId: number;
	sesionId: number;
	fechaSesion: string;
	descripcionSesion: string;
	nombreVeterinario?: string;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	dosisAplicada: number;
	observaciones: string | null;
}

export interface SesionSanitariaFilters {
	page: number;
	limit: number;
	veterinarioId?: number;
	insumoId?: number;
	estado?: EstadoSesionSanitaria;
	busqueda?: string;
	fechaInicio?: string;
	fechaFin?: string;
}

export type TipoEventoCalendario =
	| "SESION_SANITARIA"
	| "TRATAMIENTO_MEDICO"
	| "CADUCIDAD_INSUMO";

export interface CalendarioEventoDto {
	id: string;
	tipo: TipoEventoCalendario;
	fecha: string;
	titulo: string;
	subtitulo: string;
	estado: EstadoSesionSanitaria | "ACTIVO" | "CONCLUIDO" | "POR_CADUCAR";
	referenciaId: number;
	ganadoId?: number;
	terrenoId?: number;
}

export interface CalendarioSanitarioDto {
	desde: string;
	hasta: string;
	eventos: CalendarioEventoDto[];
}

export interface PlanSanitarioDto {
	id: number;
	nombre: string;
	descripcion: string;
	frecuenciaDias: number;
	dosisPorAnimal: number;
	veterinarioId: number;
	nombreVeterinario?: string;
	insumoId: number;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	terrenoId: number | null;
	nombreTerreno?: string | null;
	razaId: number | null;
	nombreRaza?: string | null;
	edadMinimaMeses: number | null;
	proximaEjecucion: string;
	activo: boolean;
	usuarioId: number;
}

export interface CrearPlanSanitarioInput {
	nombre: string;
	descripcion: string;
	frecuenciaDias: number;
	dosisPorAnimal: number;
	veterinarioId: number;
	insumoId: number;
	terrenoId?: number | null;
	razaId?: number | null;
	edadMinimaMeses?: number | null;
	proximaEjecucion: string;
	activo?: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface AplicacionSanitariaInputDto {
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface RegistrarSesionSanitariaInputDto {
	fecha: string;
	veterinarioId: number;
	descripcion: string;
	insumoId: number;
	aplicaciones: AplicacionSanitariaInputDto[];
}

export interface RegistrarResultadoAnimalInputDto {
	sesionId: number;
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface AplicacionSanitariaOutputDto {
	id: number;
	sesionId: number;
	ganadoId: number;
	identificadorGanado?: string;
	dosisAplicada: number;
	observaciones: string | null;
	createdAt?: string;
}

export interface SesionSanitariaOutputDto {
	id: number;
	fecha: string;
	veterinarioId: number;
	nombreVeterinario?: string;
	descripcion: string;
	insumoId: number;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	totalDosisAplicadas: number;
	totalAnimales: number;
	aplicaciones: AplicacionSanitariaOutputDto[];
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

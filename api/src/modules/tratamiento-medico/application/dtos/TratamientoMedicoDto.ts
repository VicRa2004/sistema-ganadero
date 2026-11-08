export interface RecetarTratamientoInputDto {
	ganadoId: number;
	diagnostico: string;
	fechaInicio: string;
	fechaFin: string;
	insumoId: number;
	dosisDiaria: number;
	veterinarioId?: number | null;
}

export interface ActualizarTratamientoInputDto {
	diagnostico?: string;
	fechaInicio?: string;
	fechaFin?: string;
	insumoId?: number;
	dosisDiaria?: number;
	veterinarioId?: number | null;
	activo?: boolean;
}

export interface RegistrarAplicacionDiariaInputDto {
	tratamientoId: number;
	cantidadDosis?: number;
	observaciones?: string | null;
	fechaAplicacion?: string;
}

export interface TratamientoMedicoOutputDto {
	id: number;
	ganadoId: number;
	ganadoIdentificador?: string;
	diagnostico: string;
	fechaInicio: string;
	fechaFin: string;
	activo: boolean;
	insumoId: number;
	insumoNombre?: string;
	insumoUnidad?: string;
	dosisDiaria: number;
	veterinarioId: number | null;
	veterinarioNombre?: string;
	createdAt?: string;
	updatedAt?: string;
}

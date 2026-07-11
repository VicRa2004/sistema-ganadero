export type SexoGanado = "MACHO" | "HEMBRA";

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface GanadoDto {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	razaId: number;
	ranchoId: number;
	propietarioId: number;
}

export interface GanadoDetalleDto {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	raza: {
		id: number;
		nombre: string;
	};
	rancho: {
		id: number;
		nombre: string;
		ubicacion: string;
	};
	propietario: {
		id: number;
		nombre: string;
	};
}

export interface RegistrarGanadoInput {
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	razaId: number;
	ranchoId: number;
	propietarioId: number;
}

export interface ActualizarGanadoInput {
	identificador?: string;
	peso?: number;
	edadEnMeses?: number;
	sexo?: SexoGanado;
	razaId?: number;
	ranchoId?: number;
	propietarioId?: number;
}

export interface RegistrarPesajeInput {
	peso: number;
}

export interface TrasladarGanadoInput {
	ranchoId: number;
}

export interface GanadoFilters {
	page: number;
	limit: number;
	identificador?: string;
	razaId?: number;
	ranchoId?: number;
	propietarioId?: number;
}

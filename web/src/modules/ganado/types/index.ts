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
	fechaNacimiento: string; // "YYYY-MM-DD"
	sexo: SexoGanado;
	imagenGanado: string | null;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	padreId: number | null;
	madreId: number | null;
	fechaBaja: string | null;
	motivoBajaId: number | null;
}

export interface GanadoDetalleDto {
	id: number;
	identificador: string;
	peso: number;
	fechaNacimiento: string; // "YYYY-MM-DD"
	sexo: SexoGanado;
	imagenGanado: string | null;
	raza: {
		id: number;
		nombre: string;
	};
	terreno: {
		id: number;
		nombre: string;
		ubicacion: string;
	};
	propietario: {
		id: number;
		nombre: string;
	};
	padre: {
		id: number;
		identificador: string;
	} | null;
	madre: {
		id: number;
		identificador: string;
	} | null;
	fechaBaja: string | null;
	motivoBaja: {
		id: number;
		nombre: string;
	} | null;
}

export interface MotivoBajaDto {
	id: number;
	nombre: string;
	descripcion: string | null;
}

export interface RegistrarGanadoInput {
	identificador: string;
	peso: number;
	fechaNacimiento: string; // "YYYY-MM-DD"
	sexo: SexoGanado;
	imagenGanado?: File | null;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	padreId?: number | null;
	madreId?: number | null;
}

export interface ActualizarGanadoInput {
	identificador?: string;
	peso?: number;
	fechaNacimiento?: string;
	sexo?: SexoGanado;
	imagenGanado?: File | null;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
	padreId?: number | null;
	madreId?: number | null;
}

export interface RegistrarPesajeInput {
	peso: number;
}

export interface TrasladarGanadoInput {
	terrenoId: number;
}

export interface DarDeBajaGanadoInput {
	fechaBaja: string; // ISO date string
	motivoBajaId: number;
}

export interface GanadoFilters {
	page: number;
	limit: number;
	identificador?: string;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
	soloActivos?: boolean;
}

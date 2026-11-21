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
	procedencia?: string | null;
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
	enPeriodoRetiro?: boolean;
	retiroHasta?: string | null;
	retiroMotivo?: string | null;
	procedencia?: string | null;
}

export interface FilaImportacionGanadoDto {
	fila: number;
	valido: boolean;
	errores: string[];
	identificador: string;
	sexo: string;
	peso: number | null;
	fechaNacimiento: string;
	raza: string;
	terreno: string;
	propietario: string;
}

export interface PrevisualizacionImportacionGanadoDto {
	totalFilas: number;
	validasCount: number;
	erroresCount: number;
	filas: FilaImportacionGanadoDto[];
}

export interface ConfirmacionImportacionGanadoDto {
	insertados: number;
	identificadores: string[];
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
	procedencia?: string | null;
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
	fechaBaja?: string | null;
	motivoBajaId?: number | null;
	procedencia?: string | null;
}

export interface RegistrarPesajeInput {
	peso: number;
}

export interface PesajeDto {
	id: number;
	peso: number;
	fecha: string;
	observaciones: string | null;
	/** GDP (kg/día) respecto al pesaje anterior; null en el primero. */
	gananciaDiaria: number | null;
}

export interface ComparacionRazaEdadDto {
	pesoActual: number;
	razaNombre: string;
	edadMeses: number;
	promedioRazaEdad: number | null;
	cantidadMuestra: number;
	diferenciaKg: number | null;
	porcentajeDiferencia: number | null;
}

export interface TrasladoDto {
	id: number;
	fecha: string;
	terrenoOrigen: { id: number; nombre: string };
	terrenoDestino: { id: number; nombre: string };
}

export interface HistorialPesajesDto {
	pesajes: PesajeDto[];
	gananciaDiariaAcumulada: number | null;
	perdidaDePeso: boolean;
	comparacionRazaEdad?: ComparacionRazaEdadDto;
}

export interface NodoGenealogiaDto {
	id: number;
	identificador: string;
	sexo: SexoGanado;
	fechaNacimiento: string;
	peso: number;
	razaNombre: string;
	fechaBaja: string | null;
	padre: NodoGenealogiaDto | null;
	madre: NodoGenealogiaDto | null;
}

export interface DescendienteDto {
	id: number;
	identificador: string;
	sexo: SexoGanado;
	fechaNacimiento: string;
	peso: number;
	razaNombre: string;
	fechaBaja: string | null;
}

export interface GenealogiaDto {
	generaciones: number;
	animal: NodoGenealogiaDto;
	descendencia: DescendienteDto[];
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
	sexo?: SexoGanado;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
	soloActivos?: boolean;
}

import type { SexoGanado } from "../../domain/Ganado";

// ── Inputs ─────────────────────────────────────────────────────────────────────

export interface RegistrarGanadoInputDto {
	identificador: string;
	peso: number;
	fechaNacimiento: string; // ISO date string "YYYY-MM-DD"
	sexo: SexoGanado;
	imagenGanado?: File | null;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	padreId?: number | null;
	madreId?: number | null;
	procedencia?: string | null;
}

export interface ActualizarGanadoInputDto {
	identificador?: string;
	peso?: number;
	fechaNacimiento?: string; // ISO date string "YYYY-MM-DD"
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

export interface RegistrarPesajeInputDto {
	peso: number;
}

export interface TrasladarGanadoInputDto {
	terrenoId: number;
}

export interface DarDeBajaGanadoInputDto {
	fechaBaja: string; // ISO date string
	motivoBajaId: number;
}

// ── Outputs ────────────────────────────────────────────────────────────────────

export interface GanadoOutputDto {
	id: number;
	identificador: string;
	peso: number;
	fechaNacimiento: string; // ISO date string
	sexo: SexoGanado;
	imagenGanado: string | null;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	padreId: number | null;
	madreId: number | null;
	fechaBaja: string | null;
	motivoBajaId: number | null;
	procedencia: string | null;
}

export interface GanadoDetalleOutputDto {
	id: number;
	identificador: string;
	peso: number;
	fechaNacimiento: string; // ISO date string
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
	enPeriodoRetiro: boolean;
	retiroHasta: string | null;
	retiroMotivo: string | null;
	procedencia: string | null;
}

export interface MotivoBajaOutputDto {
	id: number;
	nombre: string;
	descripcion: string | null;
}

export interface PesajeOutputDto {
	id: number;
	peso: number;
	fecha: string;
	observaciones: string | null;
	/** GDP respecto al pesaje anterior; null en el primero. */
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

export interface TrasladoOutputDto {
	id: number;
	fecha: string;
	terrenoOrigen: { id: number; nombre: string };
	terrenoDestino: { id: number; nombre: string };
}

export interface HistorialPesajesOutputDto {
	pesajes: PesajeOutputDto[];
	gananciaDiariaAcumulada: number | null;
	perdidaDePeso: boolean;
	comparacionRazaEdad: ComparacionRazaEdadDto;
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

export interface GenealogiaOutputDto {
	generaciones: number;
	animal: NodoGenealogiaDto;
	descendencia: DescendienteDto[];
}

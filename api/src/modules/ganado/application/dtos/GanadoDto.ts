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
}

export interface MotivoBajaOutputDto {
	id: number;
	nombre: string;
	descripcion: string | null;
}

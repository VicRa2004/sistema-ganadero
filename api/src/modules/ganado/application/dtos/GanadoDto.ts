import type { SexoGanado } from "../../domain/Ganado";

export interface RegistrarGanadoInputDto {
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
}

export interface ActualizarGanadoInputDto {
	identificador?: string;
	peso?: number;
	edadEnMeses?: number;
	sexo?: SexoGanado;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
}

export interface RegistrarPesajeInputDto {
	peso: number;
}

export interface TrasladarGanadoInputDto {
	terrenoId: number;
}

export interface GanadoOutputDto {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
}

export interface GanadoDetalleOutputDto {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
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
}

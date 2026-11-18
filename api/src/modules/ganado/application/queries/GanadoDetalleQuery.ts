import type { GanadoDetalleOutputDto } from "../dtos/GanadoDto";

export interface RetiroVigenteInfo {
	vigente: boolean;
	hasta: Date | null;
	motivo: string | null;
}

/** `usuarioId` restringe la consulta al ganado de terrenos de ese usuario (undefined = sin restricción). */
export interface GanadoDetalleQuery {
	obtenerFichaPorId(
		id: number,
		usuarioId?: number,
	): Promise<GanadoDetalleOutputDto | null>;
	obtenerFichaPorIdentificador(
		identificador: string,
		usuarioId?: number,
	): Promise<GanadoDetalleOutputDto | null>;
	obtenerRetiroVigente(
		ganadoId: number,
		fechaReferencia?: Date,
	): Promise<RetiroVigenteInfo>;
}

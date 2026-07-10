import type { GanadoDetalleOutputDto } from "../dtos/GanadoDto";

export interface GanadoDetalleQuery {
	obtenerFichaPorId(id: number): Promise<GanadoDetalleOutputDto | null>;
	obtenerFichaPorIdentificador(
		identificador: string,
	): Promise<GanadoDetalleOutputDto | null>;
}

import type { Actor } from "@/core/shared/domain/Actor";
import type {
	GanadoDetalleOutputDto,
	GenealogiaOutputDto,
} from "../dtos/GanadoDto";

export interface RetiroVigenteInfo {
	vigente: boolean;
	hasta: Date | null;
	motivo: string | null;
}

/** Restringe la consulta al ganado de terrenos accesibles para `actor`. */
export interface GanadoDetalleQuery {
	obtenerFichaPorId(
		id: number,
		actor: Actor,
	): Promise<GanadoDetalleOutputDto | null>;
	obtenerFichaPorIdentificador(
		identificador: string,
		actor: Actor,
	): Promise<GanadoDetalleOutputDto | null>;
	obtenerRetiroVigente(
		ganadoId: number,
		fechaReferencia?: Date,
	): Promise<RetiroVigenteInfo>;
	obtenerGenealogia(
		ganadoId: number,
		generaciones: number,
		actor: Actor,
	): Promise<GenealogiaOutputDto | null>;
}

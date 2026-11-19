import { inject, injectable } from "tsyringe";
import { type Actor, puedeAcceder } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { LoteNotFoundError } from "../../domain/error/LoteNotFoundError";
import type { Lote } from "../../domain/Lote";
import type {
	LoteDetailRecord,
	LoteRepository,
} from "../../domain/repository/LoteRepository";

@injectable()
export class LoteAccessService {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
	) {}

	public async obtenerLote(id: number, actor: Actor): Promise<Lote> {
		const lote = await this.loteRepository.findById(id);
		if (!lote || !puedeAcceder(actor, lote.getUsuarioId())) {
			throw new LoteNotFoundError(id);
		}
		return lote;
	}

	public async obtenerDetalle(
		id: number,
		actor: Actor,
	): Promise<LoteDetailRecord> {
		const detail = await this.loteRepository.findDetailById(id);
		if (!detail || !puedeAcceder(actor, detail.lote.getUsuarioId())) {
			throw new LoteNotFoundError(id);
		}
		return detail;
	}

	public async validarTerreno(terrenoId: number, actor: Actor): Promise<void> {
		await this.ganadoAccess.obtenerTerreno(terrenoId, actor);
	}

	public async validarGanadoActivo(ganadoId: number, actor: Actor) {
		return this.ganadoAccess.obtenerGanado(ganadoId, actor);
	}
}

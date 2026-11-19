import { inject, injectable } from "tsyringe";
import { type Actor, puedeAcceder } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { LoteAccessService } from "@/modules/lote/application/services/LoteAccessService";
import { GastoNotFoundError } from "../../domain/error/GastoNotFoundError";
import { TransaccionNotFoundError } from "../../domain/error/TransaccionNotFoundError";
import type { Gasto } from "../../domain/Gasto";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import type { Transaccion } from "../../domain/Transaccion";

@injectable()
export class ComercialAccessService {
	constructor(
		@inject("TransaccionRepository")
		private readonly transaccionRepository: TransaccionRepository,
		@inject("GastoRepository")
		private readonly gastoRepository: GastoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("LoteAccessService")
		private readonly loteAccess: LoteAccessService,
	) {}

	public async obtenerTransaccion(
		id: number,
		actor: Actor,
	): Promise<Transaccion> {
		const tr = await this.transaccionRepository.findById(id);
		if (!tr || !puedeAcceder(actor, tr.getUsuarioId())) {
			throw new TransaccionNotFoundError(id);
		}
		return tr;
	}

	public async obtenerGasto(id: number, actor: Actor): Promise<Gasto> {
		const gasto = await this.gastoRepository.findById(id);
		if (!gasto || !puedeAcceder(actor, gasto.getUsuarioId())) {
			throw new GastoNotFoundError(id);
		}
		return gasto;
	}

	public async validarReferenciasGasto(
		refs: {
			terrenoId?: number | null;
			ganadoId?: number | null;
			loteId?: number | null;
		},
		actor: Actor,
	): Promise<void> {
		if (refs.terrenoId) {
			await this.ganadoAccess.obtenerTerreno(refs.terrenoId, actor);
		}
		if (refs.ganadoId) {
			await this.ganadoAccess.obtenerGanado(refs.ganadoId, actor);
		}
		if (refs.loteId) {
			await this.loteAccess.obtenerLote(refs.loteId, actor);
		}
	}
}

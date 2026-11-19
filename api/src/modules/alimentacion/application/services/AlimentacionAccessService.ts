import { inject, injectable } from "tsyringe";
import { type Actor, puedeAcceder } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { InsumoNotFoundError } from "@/modules/inventario-insumos/domain/error/InsumoNotFoundError";
import type { Insumo } from "@/modules/inventario-insumos/domain/Insumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { LoteAccessService } from "@/modules/lote/application/services/LoteAccessService";
import { TerrenoNotFoundError } from "@/modules/terreno/domain/error/TerrenoNotFoundError";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import { RacionNotFoundError } from "../../domain/error/RacionNotFoundError";
import type { RacionAlimentacion } from "../../domain/RacionAlimentacion";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";

@injectable()
export class AlimentacionAccessService {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("LoteAccessService")
		private readonly loteAccess: LoteAccessService,
	) {}

	public async obtenerRacion(
		id: number,
		actor: Actor,
	): Promise<RacionAlimentacion> {
		const racion = await this.alimentacionRepository.findRacionById(id);
		if (!racion || !puedeAcceder(actor, racion.getUsuarioId())) {
			throw new RacionNotFoundError(id);
		}
		return racion;
	}

	public async obtenerInsumoAlimento(
		insumoId: number,
		actor: Actor,
	): Promise<Insumo> {
		const insumo = await this.insumoRepository.findById(insumoId);
		if (!insumo || !puedeAcceder(actor, insumo.getUsuarioId())) {
			throw new InsumoNotFoundError(insumoId);
		}
		if (insumo.getTipo() !== "ALIMENTO") {
			throw new ValidationError(
				"Las raciones de alimentación solo pueden usar insumos de tipo ALIMENTO",
			);
		}
		return insumo;
	}

	public async validarDestino(
		terrenoId: number | null | undefined,
		loteId: number | null | undefined,
		actor: Actor,
	): Promise<void> {
		if (!terrenoId && !loteId) {
			throw new ValidationError(
				"La ración debe estar asignada a un terreno o a un lote",
			);
		}
		if (terrenoId) {
			const terreno = await this.terrenoRepository.findById(terrenoId);
			if (!terreno || !puedeAcceder(actor, terreno.getUsuarioId())) {
				throw new TerrenoNotFoundError(terrenoId);
			}
		}
		if (loteId) {
			await this.loteAccess.obtenerLote(loteId, actor);
		}
	}
}

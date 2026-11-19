import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { Ganado } from "@/modules/ganado/domain/Ganado";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { TrasladoMasivoLoteInputDto } from "../dtos/LoteDto";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class TrasladoMasivoLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("LoteAccessService")
		private readonly loteAccess: LoteAccessService,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
	) {}

	public async run(
		loteId: number,
		dto: TrasladoMasivoLoteInputDto,
		actor: Actor,
	): Promise<{
		loteId: number;
		terrenoDestinoId: number;
		animalesTrasladados: number;
	}> {
		const lote = await this.loteAccess.obtenerLote(loteId, actor);
		const terrenoDestino = await this.ganadoAccess.obtenerTerreno(
			dto.terrenoDestinoId,
			actor,
		);

		const memberIds = await this.loteRepository.findActiveMemberIds(loteId);
		if (memberIds.length === 0) {
			throw new ValidationError(
				"El lote no tiene animales activos para trasladar",
			);
		}

		const animalesAMover: Ganado[] = [];
		for (const ganadoId of memberIds) {
			const animal = await this.ganadoAccess.obtenerGanado(ganadoId, actor);
			if (
				animal.estaActivo() &&
				animal.getTerrenoId() !== dto.terrenoDestinoId
			) {
				animalesAMover.push(animal);
			}
		}

		const ocupacionActual = await this.terrenoRepository.countGanadoByRanchoId(
			dto.terrenoDestinoId,
		);
		if (
			ocupacionActual + animalesAMover.length >
			terrenoDestino.getCapacidadMaxima()
		) {
			throw new ValidationError(
				`El terreno "${terrenoDestino.getNombre()}" no tiene capacidad suficiente (${ocupacionActual} ocupados + ${animalesAMover.length} a trasladar > ${terrenoDestino.getCapacidadMaxima()} máx.)`,
			);
		}

		await this.transactionRunner.run(async () => {
			for (const animal of animalesAMover) {
				animal.cambiarDeTerreno(dto.terrenoDestinoId);
				await this.ganadoRepository.save(animal);
			}
			lote.setTerrenoId(dto.terrenoDestinoId);
			await this.loteRepository.save(lote);
		});

		return {
			loteId,
			terrenoDestinoId: dto.terrenoDestinoId,
			animalesTrasladados: animalesAMover.length,
		};
	}
}

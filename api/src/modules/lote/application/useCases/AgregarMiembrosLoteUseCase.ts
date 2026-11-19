import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { LoteDetalleOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class AgregarMiembrosLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(
		loteId: number,
		ganadoIds: number[],
		actor: Actor,
	): Promise<LoteDetalleOutputDto> {
		await this.accessService.obtenerLote(loteId, actor);
		const uniqueIds = [...new Set(ganadoIds)];
		if (uniqueIds.length === 0) {
			throw new ValidationError("Debe proporcionar al menos un animal");
		}

		for (const ganadoId of uniqueIds) {
			const ganado = await this.accessService.validarGanadoActivo(
				ganadoId,
				actor,
			);
			if (!ganado.estaActivo()) {
				throw new ValidationError(
					`El ganado ${ganado.getIdentificador()} está dado de baja`,
				);
			}
		}

		await this.loteRepository.addMembers(loteId, uniqueIds);
		const detail = await this.accessService.obtenerDetalle(loteId, actor);
		return this.mapper.toDetalleDto(detail);
	}
}

import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { Lote } from "../../domain/Lote";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { CrearLoteInputDto, LoteOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class CrearLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(
		dto: CrearLoteInputDto,
		actor: Actor,
	): Promise<LoteOutputDto> {
		if (dto.terrenoId) {
			await this.accessService.validarTerreno(dto.terrenoId, actor);
		}

		const ganadoIds = [...new Set(dto.ganadoIds ?? [])];
		for (const ganadoId of ganadoIds) {
			const g = await this.accessService.validarGanadoActivo(ganadoId, actor);
			if (!g.estaActivo()) {
				throw new ValidationError(
					`El ganado ${g.getIdentificador()} está dado de baja y no puede agregarse al lote`,
				);
			}
		}

		const lote = Lote.create({
			nombre: dto.nombre,
			proposito: dto.proposito,
			descripcion: dto.descripcion,
			terrenoId: dto.terrenoId ?? null,
			activo: dto.activo ?? true,
			usuarioId: actor.id,
		});

		const saved = await this.transactionRunner.run(async () => {
			const created = await this.loteRepository.save(lote);
			if (ganadoIds.length > 0) {
				await this.loteRepository.addMembers(created.getId(), ganadoIds);
			}
			return (await this.loteRepository.findById(created.getId())) ?? created;
		});

		return this.mapper.toDto(saved);
	}
}

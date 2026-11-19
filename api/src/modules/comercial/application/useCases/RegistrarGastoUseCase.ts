import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { Gasto } from "../../domain/Gasto";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type {
	GastoOutputDto,
	RegistrarGastoInputDto,
} from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class RegistrarGastoUseCase {
	constructor(
		@inject("GastoRepository")
		private readonly repository: GastoRepository,
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
	) {}

	public async run(
		dto: RegistrarGastoInputDto,
		actor: Actor,
	): Promise<GastoOutputDto> {
		await this.accessService.validarReferenciasGasto(
			{
				terrenoId: dto.terrenoId,
				ganadoId: dto.ganadoId,
				loteId: dto.loteId,
			},
			actor,
		);

		const gasto = Gasto.create({
			categoria: dto.categoria,
			concepto: dto.concepto,
			monto: dto.monto,
			fecha: new Date(dto.fecha),
			terrenoId: dto.terrenoId ?? null,
			ganadoId: dto.ganadoId ?? null,
			loteId: dto.loteId ?? null,
			observaciones: dto.observaciones,
			usuarioId: actor.id,
		});

		const saved = await this.repository.save(gasto);
		return this.mapper.gastoToDto(saved);
	}
}

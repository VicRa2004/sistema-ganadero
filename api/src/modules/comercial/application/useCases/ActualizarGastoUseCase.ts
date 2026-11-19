import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type {
	ActualizarGastoInputDto,
	GastoOutputDto,
} from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class ActualizarGastoUseCase {
	constructor(
		@inject("GastoRepository")
		private readonly repository: GastoRepository,
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarGastoInputDto,
		actor: Actor,
	): Promise<GastoOutputDto> {
		const gasto = await this.accessService.obtenerGasto(id, actor);
		await this.accessService.validarReferenciasGasto(
			{
				terrenoId: dto.terrenoId,
				ganadoId: dto.ganadoId,
				loteId: dto.loteId,
			},
			actor,
		);

		gasto.actualizar({
			categoria: dto.categoria,
			concepto: dto.concepto,
			monto: dto.monto,
			fecha: dto.fecha ? new Date(dto.fecha) : undefined,
			terrenoId: dto.terrenoId,
			ganadoId: dto.ganadoId,
			loteId: dto.loteId,
			observaciones: dto.observaciones,
		});

		const saved = await this.repository.save(gasto);
		return this.mapper.gastoToDto(saved);
	}
}

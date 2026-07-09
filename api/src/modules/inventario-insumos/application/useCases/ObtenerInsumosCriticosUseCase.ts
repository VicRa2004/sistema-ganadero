import { inject, injectable } from "tsyringe";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { InsumoOutputDto } from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ObtenerInsumosCriticosUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(): Promise<InsumoOutputDto[]> {
		const insumos = await this.insumoRepository.findCriticos();
		return insumos.map((insumo) => this.mapper.toDto(insumo));
	}
}

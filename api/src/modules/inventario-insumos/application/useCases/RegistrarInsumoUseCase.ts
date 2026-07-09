import { inject, injectable } from "tsyringe";
import { Insumo } from "../../domain/Insumo";
import type { TipoInsumo } from "../../domain/TipoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type {
	RegistrarInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class RegistrarInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(dto: RegistrarInsumoInputDto): Promise<InsumoOutputDto> {
		const insumo = Insumo.create(
			dto.nombre,
			dto.tipo as TipoInsumo,
			dto.stockInicial,
			dto.stockMinimo,
			dto.unidadMedida,
			dto.lote,
			new Date(dto.fechaCaducidad),
		);

		const saved = await this.insumoRepository.save(insumo);
		return this.mapper.toDto(saved);
	}
}

import { inject, injectable } from "tsyringe";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type {
	ConsumirInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ConsumirInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(
		id: number,
		dto: ConsumirInsumoInputDto,
	): Promise<InsumoOutputDto> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}

		insumo.descontarStock(dto.cantidad);
		const saved = await this.insumoRepository.save(insumo);

		if (saved.esBajoStock()) {
			console.warn(
				`⚠️ [ALERTA INVENTARIO] El insumo "${saved.getNombre()}" (ID: ${saved.getId()}) ha caído por debajo de su stock mínimo de seguridad. Stock actual: ${saved.getStock()} ${saved.getUnidadMedida()} (Mínimo: ${saved.getStockMinimo()}).`,
			);
		}

		return this.mapper.toDto(saved);
	}
}

import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoStockInsuficienteError } from "../../domain/error/InsumoStockInsuficienteError";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type {
	ConsumirInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";
import { logger } from "@/core/config/logger";

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
		usuarioId: number,
		rol: string,
	): Promise<InsumoOutputDto> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			insumo.getUsuarioId(),
			"No tienes permiso para consumir este insumo",
		);

		// Validación temprana con el stock leído (cantidad válida y stock suficiente)
		insumo.validarDescuento(dto.cantidad);

		// Descuento atómico: si otra petición consumió stock entretanto, no se aplica
		const saved = await this.insumoRepository.descontarStock(id, dto.cantidad);
		if (!saved) {
			throw new InsumoStockInsuficienteError(
				`Stock insuficiente para descontar ${dto.cantidad} ${insumo.getUnidadMedida()}`,
			);
		}

		if (saved.esBajoStock()) {
			logger.warn(
				`Alerta de inventario: el insumo "${saved.getNombre()}" (ID: ${saved.getId()}) ha caído por debajo de su stock mínimo de seguridad. Stock actual: ${saved.getStock()} ${saved.getUnidadMedida()} (Mínimo: ${saved.getStockMinimo()}).`,
			);
		}

		return this.mapper.toDto(saved);
	}
}

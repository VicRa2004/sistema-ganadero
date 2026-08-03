import { inject, injectable } from "tsyringe";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import { SesionSanitariaNotFoundError } from "../../domain/error/SesionSanitariaNotFoundError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type {
	AplicacionSanitariaOutputDto,
	RegistrarResultadoAnimalInputDto,
} from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";

@injectable()
export class RegistrarResultadoAnimalUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		dto: RegistrarResultadoAnimalInputDto,
	): Promise<AplicacionSanitariaOutputDto> {
		const sesion = await this.sesionSanitariaRepository.findById(dto.sesionId);
		if (!sesion) {
			throw new SesionSanitariaNotFoundError(dto.sesionId);
		}

		const animal = await this.ganadoRepository.findById(dto.ganadoId);
		if (!animal) {
			throw new Error(`El animal de ganado con ID ${dto.ganadoId} no existe`);
		}

		const insumo = await this.insumoRepository.findById(sesion.getInsumoId());
		if (!insumo) {
			throw new Error(`El insumo de la sesión no fue encontrado`);
		}

		if (insumo.getStock() < dto.dosisAplicada) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				dto.dosisAplicada,
			);
		}

		insumo.descontarStock(dto.dosisAplicada);
		await this.insumoRepository.save(insumo);

		const aplicacion = AplicacionSanitaria.create(
			dto.ganadoId,
			dto.dosisAplicada,
			dto.observaciones,
			null,
			dto.sesionId,
		);

		const result = await this.sesionSanitariaRepository.addAplicacion(
			dto.sesionId,
			aplicacion,
		);

		return this.mapper.toAplicacionDto(result, animal.getIdentificador());
	}
}

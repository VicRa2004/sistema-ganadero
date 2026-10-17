import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { InsumoNotFoundError } from "@/modules/inventario-insumos/domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type {
	AplicacionSanitariaOutputDto,
	RegistrarResultadoAnimalInputDto,
} from "../dtos/SesionSanitariaDto";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class RegistrarResultadoAnimalUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		dto: RegistrarResultadoAnimalInputDto,
		actor: Actor,
	): Promise<AplicacionSanitariaOutputDto> {
		const sesion = await this.accessService.obtenerSesion(dto.sesionId, actor);

		const animal = await this.ganadoAccessService.obtenerGanado(
			dto.ganadoId,
			actor,
		);

		const insumo = await this.insumoRepository.findById(sesion.getInsumoId());
		if (!insumo) {
			throw new InsumoNotFoundError(sesion.getInsumoId());
		}

		if (insumo.getStock() < dto.dosisAplicada) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				dto.dosisAplicada,
			);
		}

		const aplicacion = AplicacionSanitaria.create(
			dto.ganadoId,
			dto.dosisAplicada,
			dto.observaciones,
			null,
			dto.sesionId,
		);

		// El descuento de stock y la aplicación se guardan juntos
		const result = await this.transactionRunner.run(async () => {
			const actualizado = await this.insumoRepository.descontarStock(
				insumo.getId(),
				dto.dosisAplicada,
			);
			if (!actualizado) {
				const actual = await this.insumoRepository.findById(insumo.getId());
				throw new InsuficienteStockInsumoError(
					insumo.getId(),
					actual?.getStock() ?? 0,
					dto.dosisAplicada,
				);
			}

			return this.sesionSanitariaRepository.addAplicacion(
				dto.sesionId,
				aplicacion,
			);
		});

		return this.mapper.toAplicacionDto(result, animal.getIdentificador());
	}
}

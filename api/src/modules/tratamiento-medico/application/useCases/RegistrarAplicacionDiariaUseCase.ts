import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type {
	RegistrarAplicacionDiariaInputDto,
	TratamientoMedicoOutputDto,
} from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";

@injectable()
export class RegistrarAplicacionDiariaUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("TratamientoAccessService")
		private readonly accessService: TratamientoAccessService,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
	) {}

	public async run(
		dto: RegistrarAplicacionDiariaInputDto,
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto> {
		const tratamiento = await this.accessService.obtenerTratamiento(
			dto.tratamientoId,
			actor,
		);

		if (!tratamiento.esActivo()) {
			throw new ValidationError(
				"No se puede aplicar dosis a un tratamiento finalizado",
			);
		}

		const dosisAplicada = dto.cantidadDosis ?? tratamiento.getDosisDiaria();
		if (dosisAplicada <= 0) {
			throw new ValidationError(
				"La cantidad de dosis a aplicar debe ser mayor a cero",
			);
		}

		const insumo = await this.accessService.obtenerInsumo(
			tratamiento.getInsumoId(),
			actor,
		);

		if (insumo.getStock() < dosisAplicada) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				dosisAplicada,
			);
		}

		const guardado = await this.transactionRunner.run(async () => {
			const actualizado = await this.insumoRepository.descontarStock(
				insumo.getId(),
				dosisAplicada,
			);

			if (!actualizado) {
				const actual = await this.insumoRepository.findById(insumo.getId());
				throw new InsuficienteStockInsumoError(
					insumo.getId(),
					actual?.getStock() ?? 0,
					dosisAplicada,
				);
			}

			return this.tratamientoRepository.save(tratamiento);
		});

		return this.mapper.toDto(guardado, {
			insumoNombre: insumo.getNombre(),
			insumoUnidad: insumo.getUnidadMedida(),
		});
	}
}

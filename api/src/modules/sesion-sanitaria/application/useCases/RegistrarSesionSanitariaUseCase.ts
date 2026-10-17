import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { SesionSanitaria } from "../../domain/SesionSanitaria";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type {
	RegistrarSesionSanitariaInputDto,
	SesionSanitariaOutputDto,
} from "../dtos/SesionSanitariaDto";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { SesionAccessService } from "../services/SesionAccessService";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

@injectable()
export class RegistrarSesionSanitariaUseCase {
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
		dto: RegistrarSesionSanitariaInputDto,
		actor: Actor,
	): Promise<SesionSanitariaOutputDto> {
		// El veterinario, el insumo y los animales deben existir y ser del usuario
		const veterinario = await this.accessService.obtenerVeterinario(
			dto.veterinarioId,
			actor,
		);

		const insumo = await this.accessService.obtenerInsumo(dto.insumoId, actor);

		if (!dto.aplicaciones || dto.aplicaciones.length === 0) {
			throw new ValidationError(
				"Debe incluir al menos una aplicación a un animal de ganado para registrar la sesión",
			);
		}

		const aplicaciones: AplicacionSanitaria[] = [];
		let totalDosisRequerida = 0;

		for (const appDto of dto.aplicaciones) {
			await this.ganadoAccessService.obtenerGanado(appDto.ganadoId, actor);

			const app = AplicacionSanitaria.create(
				appDto.ganadoId,
				appDto.dosisAplicada,
				appDto.observaciones,
			);
			aplicaciones.push(app);
			totalDosisRequerida += appDto.dosisAplicada;
		}

		if (insumo.getStock() < totalDosisRequerida) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				totalDosisRequerida,
			);
		}

		const sesion = SesionSanitaria.create(
			new Date(dto.fecha),
			dto.veterinarioId,
			dto.descripcion,
			dto.insumoId,
			aplicaciones,
		);

		// El descuento de stock y la sesión se guardan juntos: si algo falla, no se pierde stock
		const sesionGuardada = await this.transactionRunner.run(async () => {
			const actualizado = await this.insumoRepository.descontarStock(
				insumo.getId(),
				totalDosisRequerida,
			);
			if (!actualizado) {
				// Otra operación consumió stock entre la lectura y el descuento
				const actual = await this.insumoRepository.findById(insumo.getId());
				throw new InsuficienteStockInsumoError(
					insumo.getId(),
					actual?.getStock() ?? 0,
					totalDosisRequerida,
				);
			}

			return this.sesionSanitariaRepository.save(sesion);
		});

		return this.mapper.toDto(sesionGuardada, {
			nombreVeterinario: veterinario.getNombre(),
			nombreInsumo: insumo.getNombre(),
			unidadMedidaInsumo: insumo.getUnidadMedida(),
		});
	}
}

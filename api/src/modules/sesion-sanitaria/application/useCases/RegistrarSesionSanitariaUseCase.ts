import { inject, injectable } from "tsyringe";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { SesionSanitaria } from "../../domain/SesionSanitaria";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type {
	RegistrarSesionSanitariaInputDto,
	SesionSanitariaOutputDto,
} from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";

@injectable()
export class RegistrarSesionSanitariaUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		dto: RegistrarSesionSanitariaInputDto,
	): Promise<SesionSanitariaOutputDto> {
		const veterinario = await this.veterinarioRepository.findById(
			dto.veterinarioId,
		);
		if (!veterinario) {
			throw new Error(`El veterinario con ID ${dto.veterinarioId} no existe`);
		}

		const insumo = await this.insumoRepository.findById(dto.insumoId);
		if (!insumo) {
			throw new Error(`El insumo con ID ${dto.insumoId} no existe`);
		}

		if (!dto.aplicaciones || dto.aplicaciones.length === 0) {
			throw new Error(
				"Debe incluir al menos una aplicación a un animal de ganado para registrar la sesión",
			);
		}

		const aplicaciones: AplicacionSanitaria[] = [];
		let totalDosisRequerida = 0;

		for (const appDto of dto.aplicaciones) {
			const animal = await this.ganadoRepository.findById(appDto.ganadoId);
			if (!animal) {
				throw new Error(
					`El animal de ganado con ID ${appDto.ganadoId} no existe`,
				);
			}

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

		insumo.descontarStock(totalDosisRequerida);
		await this.insumoRepository.save(insumo);

		const sesion = SesionSanitaria.create(
			new Date(dto.fecha),
			dto.veterinarioId,
			dto.descripcion,
			dto.insumoId,
			aplicaciones,
		);

		const sesionGuardada = await this.sesionSanitariaRepository.save(sesion);

		return this.mapper.toDto(sesionGuardada, {
			nombreVeterinario: veterinario.getNombre(),
			nombreInsumo: insumo.getNombre(),
			unidadMedidaInsumo: insumo.getUnidadMedida(),
		});
	}
}

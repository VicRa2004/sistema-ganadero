import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import { TratamientoMedico } from "../../domain/TratamientoMedico";
import type {
	RecetarTratamientoInputDto,
	TratamientoMedicoOutputDto,
} from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";

@injectable()
export class RecetarTratamientoUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("TratamientoAccessService")
		private readonly accessService: TratamientoAccessService,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
	) {}

	public async run(
		dto: RecetarTratamientoInputDto,
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto> {
		const ganado = await this.ganadoAccessService.obtenerGanado(
			dto.ganadoId,
			actor,
		);
		const insumo = await this.accessService.obtenerInsumo(dto.insumoId, actor);
		const veterinario =
			dto.veterinarioId != null
				? await this.accessService.obtenerVeterinario(dto.veterinarioId, actor)
				: null;

		const tratamiento = TratamientoMedico.create(
			dto.ganadoId,
			dto.diagnostico,
			new Date(dto.fechaInicio),
			new Date(dto.fechaFin),
			dto.insumoId,
			dto.dosisDiaria,
			dto.veterinarioId ?? null,
		);

		const guardado = await this.tratamientoRepository.save(tratamiento);

		return this.mapper.toDto(guardado, {
			ganadoIdentificador: ganado.getIdentificador(),
			insumoNombre: insumo.getNombre(),
			insumoUnidad: insumo.getUnidadMedida(),
			veterinarioNombre: veterinario?.getNombre(),
		});
	}
}

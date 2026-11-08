import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type {
	ActualizarTratamientoInputDto,
	TratamientoMedicoOutputDto,
} from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";

@injectable()
export class ActualizarTratamientoUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("TratamientoAccessService")
		private readonly accessService: TratamientoAccessService,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarTratamientoInputDto,
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto> {
		const tratamiento = await this.accessService.obtenerTratamiento(id, actor);

		const insumoId = dto.insumoId ?? tratamiento.getInsumoId();
		const veterinarioId =
			dto.veterinarioId !== undefined
				? dto.veterinarioId
				: tratamiento.getVeterinarioId();

		const insumo = await this.accessService.obtenerInsumo(insumoId, actor);
		const veterinario =
			veterinarioId != null
				? await this.accessService.obtenerVeterinario(veterinarioId, actor)
				: null;

		tratamiento.actualizar(
			dto.diagnostico ?? tratamiento.getDiagnostico(),
			dto.fechaInicio
				? new Date(dto.fechaInicio)
				: tratamiento.getFechaInicio(),
			dto.fechaFin ? new Date(dto.fechaFin) : tratamiento.getFechaFin(),
			insumoId,
			dto.dosisDiaria ?? tratamiento.getDosisDiaria(),
			veterinarioId,
			dto.activo,
		);

		const guardado = await this.tratamientoRepository.save(tratamiento);

		return this.mapper.toDto(guardado, {
			insumoNombre: insumo.getNombre(),
			insumoUnidad: insumo.getUnidadMedida(),
			veterinarioNombre: veterinario?.getNombre(),
		});
	}
}

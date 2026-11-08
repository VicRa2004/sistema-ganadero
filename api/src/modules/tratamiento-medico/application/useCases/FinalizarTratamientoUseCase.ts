import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type { TratamientoMedicoOutputDto } from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";

@injectable()
export class FinalizarTratamientoUseCase {
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
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto> {
		const tratamiento = await this.accessService.obtenerTratamiento(id, actor);
		tratamiento.finalizarTratamiento();

		const guardado = await this.tratamientoRepository.save(tratamiento);
		return this.mapper.toDto(guardado);
	}
}

import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";

@injectable()
export class EliminarTratamientoUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("TratamientoAccessService")
		private readonly accessService: TratamientoAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerTratamiento(id, actor);
		await this.tratamientoRepository.delete(id);
	}
}

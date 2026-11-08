import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type { TratamientoMedicoOutputDto } from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";

@injectable()
export class ListarTratamientosPorGanadoUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
	) {}

	public async run(
		ganadoId: number,
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto[]> {
		const ganado = await this.ganadoAccessService.obtenerGanado(
			ganadoId,
			actor,
		);
		const tratamientos =
			await this.tratamientoRepository.findByGanadoId(ganadoId);

		return tratamientos.map((t) =>
			this.mapper.toDto(t, {
				ganadoIdentificador: ganado.getIdentificador(),
			}),
		);
	}
}

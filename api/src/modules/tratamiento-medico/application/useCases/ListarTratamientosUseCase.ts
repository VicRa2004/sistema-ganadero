import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TratamientoMedicoFilters } from "../../domain/repository/TratamientoMedicoFilters";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type { TratamientoMedicoOutputDto } from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";

@injectable()
export class ListarTratamientosUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
	) {}

	public async run(
		filters: Omit<TratamientoMedicoFilters, "actor">,
		actor: Actor,
	): Promise<Pagination<TratamientoMedicoOutputDto>> {
		const result = await this.tratamientoRepository.find({
			...filters,
			actor,
		});

		const data = result.data.map((tratamiento) =>
			this.mapper.toDto(tratamiento),
		);

		return {
			data,
			page: result.page,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}
}

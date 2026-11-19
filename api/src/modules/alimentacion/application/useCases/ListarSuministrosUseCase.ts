import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import type { SuministroOutputDto } from "../dtos/AlimentacionDto";
import type { AlimentacionMapper } from "../mappers/AlimentacionMapper";

@injectable()
export class ListarSuministrosUseCase {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("AlimentacionMapper")
		private readonly mapper: AlimentacionMapper,
	) {}

	public async run(
		filters: {
			page: number;
			limit: number;
			racionId?: number;
			desde?: Date;
			hasta?: Date;
		},
		actor: Actor,
	): Promise<Pagination<SuministroOutputDto>> {
		const res = await this.alimentacionRepository.findSuministros({
			...filters,
			actor,
		});
		return {
			...res,
			data: res.data.map((s) => this.mapper.suministroToDto(s)),
		};
	}
}

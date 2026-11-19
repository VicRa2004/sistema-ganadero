import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import type { RacionOutputDto } from "../dtos/AlimentacionDto";
import type { AlimentacionMapper } from "../mappers/AlimentacionMapper";

@injectable()
export class ListarRacionesUseCase {
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
			activo?: boolean;
			terrenoId?: number;
			loteId?: number;
		},
		actor: Actor,
	): Promise<Pagination<RacionOutputDto>> {
		const res = await this.alimentacionRepository.findRaciones({
			...filters,
			actor,
		});
		return {
			...res,
			data: res.data.map((r) => this.mapper.racionToDto(r)),
		};
	}
}

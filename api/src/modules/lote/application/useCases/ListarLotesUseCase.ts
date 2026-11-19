import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { PropositoLote } from "../../domain/PropositoLote";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { LoteOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";

@injectable()
export class ListarLotesUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(
		filters: {
			page: number;
			limit: number;
			nombre?: string;
			proposito?: PropositoLote;
			activo?: boolean;
		},
		actor: Actor,
	): Promise<Pagination<LoteOutputDto>> {
		const res = await this.loteRepository.findAll({ ...filters, actor });
		return {
			...res,
			data: res.data.map((l) => this.mapper.toDto(l)),
		};
	}
}

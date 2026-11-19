import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { CategoriaGasto } from "../../domain/CategoriaGasto";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type { GastoOutputDto } from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";

@injectable()
export class ListarGastosUseCase {
	constructor(
		@inject("GastoRepository")
		private readonly repository: GastoRepository,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
	) {}

	public async run(
		filters: {
			page: number;
			limit: number;
			categoria?: CategoriaGasto;
			terrenoId?: number;
			ganadoId?: number;
			loteId?: number;
			desde?: Date;
			hasta?: Date;
		},
		actor: Actor,
	): Promise<Pagination<GastoOutputDto>> {
		const res = await this.repository.findAll({ ...filters, actor });
		return {
			...res,
			data: res.data.map((g) => this.mapper.gastoToDto(g)),
		};
	}
}

import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TipoTransaccion } from "../../domain/CategoriaGasto";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import type { TransaccionOutputDto } from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";

@injectable()
export class ListarTransaccionesUseCase {
	constructor(
		@inject("TransaccionRepository")
		private readonly repository: TransaccionRepository,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
	) {}

	public async run(
		filters: {
			page: number;
			limit: number;
			tipo?: TipoTransaccion;
			desde?: Date;
			hasta?: Date;
		},
		actor: Actor,
	): Promise<Pagination<TransaccionOutputDto>> {
		const res = await this.repository.findAll({ ...filters, actor });
		return {
			...res,
			data: res.data.map((t) => this.mapper.transaccionToDto(t)),
		};
	}
}

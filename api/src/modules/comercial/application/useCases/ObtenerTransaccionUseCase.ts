import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { TransaccionOutputDto } from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class ObtenerTransaccionUseCase {
	constructor(
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
	) {}

	public async run(id: number, actor: Actor): Promise<TransaccionOutputDto> {
		const tr = await this.accessService.obtenerTransaccion(id, actor);
		return this.mapper.transaccionToDto(tr);
	}
}

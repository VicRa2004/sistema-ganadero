import { inject, injectable } from "tsyringe";
import type { MotivoBajaRepository } from "../../domain/repository/MotivoBajaRepository";
import type { MotivoBajaOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

@injectable()
export class ListarMotivosBajaUseCase {
	constructor(
		@inject("MotivoBajaRepository")
		private readonly motivoBajaRepository: MotivoBajaRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(): Promise<MotivoBajaOutputDto[]> {
		const motivos = await this.motivoBajaRepository.findAll();
		return motivos.map((m) => this.mapper.motivoBajaToDto(m));
	}
}

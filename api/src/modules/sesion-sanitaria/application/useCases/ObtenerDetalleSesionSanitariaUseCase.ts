import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import type { SesionSanitariaOutputDto } from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class ObtenerDetalleSesionSanitariaUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		id: number,
		actor: Actor,
	): Promise<SesionSanitariaOutputDto> {
		const sesion = await this.accessService.obtenerSesion(id, actor);

		const veterinario = await this.veterinarioRepository.findById(
			sesion.getVeterinarioId(),
		);
		const insumo = await this.insumoRepository.findById(sesion.getInsumoId());

		const mapeoIdentificadoresGanado: Record<number, string> = {};
		for (const app of sesion.getAplicaciones()) {
			const animal = await this.ganadoRepository.findById(app.getGanadoId());
			if (animal) {
				mapeoIdentificadoresGanado[app.getGanadoId()] =
					animal.getIdentificador();
			}
		}

		return this.mapper.toDto(sesion, {
			nombreVeterinario: veterinario?.getNombre(),
			nombreInsumo: insumo?.getNombre(),
			unidadMedidaInsumo: insumo?.getUnidadMedida(),
			mapeoIdentificadoresGanado,
		});
	}
}

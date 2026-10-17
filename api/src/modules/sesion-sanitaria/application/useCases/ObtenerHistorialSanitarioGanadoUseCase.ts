import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { HistorialSanitarioGanadoDto } from "../dtos/SesionSanitariaDto";

@injectable()
export class ObtenerHistorialSanitarioGanadoUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
	) {}

	public async run(
		ganadoId: number,
		actor: Actor,
	): Promise<HistorialSanitarioGanadoDto[]> {
		await this.ganadoAccessService.obtenerGanado(ganadoId, actor);

		const aplicaciones =
			await this.sesionSanitariaRepository.findAplicacionesByGanadoId(ganadoId);

		const historial: HistorialSanitarioGanadoDto[] = [];

		for (const app of aplicaciones) {
			const sesionId = app.getSesionId();
			if (!sesionId) continue;

			const sesion = await this.sesionSanitariaRepository.findById(sesionId);
			if (!sesion) continue;

			const veterinario = await this.veterinarioRepository.findById(
				sesion.getVeterinarioId(),
			);
			const insumo = await this.insumoRepository.findById(sesion.getInsumoId());

			historial.push({
				aplicacionId: app.getId() ?? 0,
				sesionId: sesion.getId() ?? 0,
				fechaSesion: sesion.getFecha().toISOString(),
				descripcionSesion: sesion.getDescripcion(),
				nombreVeterinario: veterinario?.getNombre(),
				nombreInsumo: insumo?.getNombre(),
				unidadMedidaInsumo: insumo?.getUnidadMedida(),
				dosisAplicada: app.getDosisAplicada(),
				observaciones: app.getObservaciones(),
			});
		}

		return historial;
	}
}

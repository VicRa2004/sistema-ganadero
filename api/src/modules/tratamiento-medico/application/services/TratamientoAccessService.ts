import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { puedeAcceder } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { GanadoNotFoundError } from "@/modules/ganado/domain/error/GanadoNotFoundError";
import { InsumoNotFoundError } from "@/modules/inventario-insumos/domain/error/InsumoNotFoundError";
import type { Insumo } from "@/modules/inventario-insumos/domain/Insumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { VeterinarioNotFoundError } from "@/modules/veterinario/domain/error/VeterinarioNotFoundError";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import type { Veterinario } from "@/modules/veterinario/domain/Veterinario";
import { TratamientoMedicoNotFoundError } from "../../domain/error/TratamientoMedicoNotFoundError";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type { TratamientoMedico } from "../../domain/TratamientoMedico";

@injectable()
export class TratamientoAccessService {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
	) {}

	public async obtenerTratamiento(
		id: number,
		actor: Actor,
	): Promise<TratamientoMedico> {
		const tratamiento = await this.tratamientoRepository.findById(id);
		if (!tratamiento) {
			throw new TratamientoMedicoNotFoundError(id);
		}

		try {
			await this.ganadoAccessService.obtenerGanado(
				tratamiento.getGanadoId(),
				actor,
			);
		} catch (error) {
			if (error instanceof GanadoNotFoundError) {
				throw new TratamientoMedicoNotFoundError(id);
			}
			throw error;
		}

		return tratamiento;
	}

	public async obtenerInsumo(id: number, actor: Actor): Promise<Insumo> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo || !puedeAcceder(actor, insumo.getUsuarioId())) {
			throw new InsumoNotFoundError(id);
		}
		return insumo;
	}

	public async obtenerVeterinario(
		id: number,
		actor: Actor,
	): Promise<Veterinario> {
		const veterinario = await this.veterinarioRepository.findById(id);
		if (!veterinario || !puedeAcceder(actor, veterinario.getUsuarioId())) {
			throw new VeterinarioNotFoundError(id);
		}
		return veterinario;
	}
}

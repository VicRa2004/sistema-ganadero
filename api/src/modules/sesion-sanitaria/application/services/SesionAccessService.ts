import { inject, injectable } from "tsyringe";
import { esAdmin, puedeAcceder } from "@/core/shared/domain/Actor";
import type { Actor } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "@/modules/inventario-insumos/domain/error/InsumoNotFoundError";
import type { Insumo } from "@/modules/inventario-insumos/domain/Insumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { VeterinarioNotFoundError } from "@/modules/veterinario/domain/error/VeterinarioNotFoundError";
import type { Veterinario } from "@/modules/veterinario/domain/Veterinario";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import type { SesionSanitaria } from "../../domain/SesionSanitaria";
import { SesionSanitariaNotFoundError } from "../../domain/error/SesionSanitariaNotFoundError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";

/**
 * Regla de propiedad de las sesiones sanitarias: una sesión pertenece al
 * usuario dueño del veterinario que la realizó. Para quien no tiene acceso el
 * recurso "no existe" (404). Los ADMIN acceden a todo.
 */
@injectable()
export class SesionAccessService {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
	) {}

	public async obtenerSesion(
		id: number,
		actor: Actor,
	): Promise<SesionSanitaria> {
		const sesion = await this.sesionRepository.findById(id);
		if (!sesion) {
			throw new SesionSanitariaNotFoundError(id);
		}

		const veterinario = await this.veterinarioRepository.findById(
			sesion.getVeterinarioId(),
		);
		// Si el veterinario ya no existe solo un ADMIN puede seguir operando la sesión
		const permitido = veterinario
			? puedeAcceder(actor, veterinario.getUsuarioId())
			: esAdmin(actor);
		if (!permitido) {
			throw new SesionSanitariaNotFoundError(id);
		}

		return sesion;
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

	public async obtenerInsumo(id: number, actor: Actor): Promise<Insumo> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo || !puedeAcceder(actor, insumo.getUsuarioId())) {
			throw new InsumoNotFoundError(id);
		}
		return insumo;
	}
}

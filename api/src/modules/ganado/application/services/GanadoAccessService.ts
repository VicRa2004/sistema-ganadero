import { inject, injectable } from "tsyringe";
import { esAdmin, puedeAcceder } from "@/core/shared/domain/Actor";
import type { Actor } from "@/core/shared/domain/Actor";
import { PropietarioNotFoundError } from "@/modules/propietario/domain/error/PropietarioNotFoundError";
import type { PropietarioRepository } from "@/modules/propietario/domain/repository/PropietarioRepository";
import { TerrenoNotFoundError } from "@/modules/terreno/domain/error/TerrenoNotFoundError";
import type { Terreno } from "@/modules/terreno/domain/Terreno";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import type { Propietario } from "@/modules/propietario/domain/Propietario";
import type { Ganado } from "../../domain/Ganado";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";

/**
 * Centraliza la regla de propiedad del ganado: un animal pertenece al usuario
 * dueño de su terreno. Para quien no tiene acceso el recurso "no existe" (404),
 * así no se revela la existencia de datos ajenos. Los ADMIN acceden a todo.
 */
@injectable()
export class GanadoAccessService {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
	) {}

	public async obtenerGanado(id: number, actor: Actor): Promise<Ganado> {
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		const terreno = await this.terrenoRepository.findById(
			ganado.getTerrenoId(),
		);
		// Si el terreno ya no existe solo un ADMIN puede seguir operando el animal
		const permitido = terreno
			? puedeAcceder(actor, terreno.getUsuarioId())
			: esAdmin(actor);
		if (!permitido) {
			throw new GanadoNotFoundError(id);
		}

		return ganado;
	}

	public async obtenerTerreno(
		terrenoId: number,
		actor: Actor,
	): Promise<Terreno> {
		const terreno = await this.terrenoRepository.findById(terrenoId);
		if (!terreno || !puedeAcceder(actor, terreno.getUsuarioId())) {
			throw new TerrenoNotFoundError(terrenoId);
		}
		return terreno;
	}

	public async obtenerPropietario(
		propietarioId: number,
		actor: Actor,
	): Promise<Propietario> {
		const propietario =
			await this.propietarioRepository.findById(propietarioId);
		if (!propietario || !puedeAcceder(actor, propietario.getUsuarioId())) {
			throw new PropietarioNotFoundError(propietarioId);
		}
		return propietario;
	}
}

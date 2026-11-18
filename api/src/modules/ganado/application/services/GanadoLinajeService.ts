import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { Ganado } from "../../domain/Ganado";
import {
	EDAD_MINIMA_REPRODUCTIVA_MESES,
	calcularEdadMeses,
} from "../../domain/ReproduccionReglas";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoAccessService } from "./GanadoAccessService";

export interface ValidarPadresParams {
	ganadoId?: number;
	fechaNacimientoCria: Date;
	padreId: number | null;
	madreId: number | null;
	actor: Actor;
}

/**
 * Valida reglas genealógicas y reproductivas al asignar padre o madre a un animal:
 * - Existencia y acceso del actor.
 * - Sexo compatible (MACHO para padre, HEMBRA para madre).
 * - Edad mínima reproductiva al nacimiento de la cría.
 * - Ausencia de auto-referencias y ciclos genealógicos.
 */
@injectable()
export class GanadoLinajeService {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
	) {}

	public async validarPadres({
		ganadoId,
		fechaNacimientoCria,
		padreId,
		madreId,
		actor,
	}: ValidarPadresParams): Promise<{
		padre: Ganado | null;
		madre: Ganado | null;
	}> {
		if (padreId !== null && madreId !== null && padreId === madreId) {
			throw new ValidationError(
				"El padre y la madre no pueden ser el mismo animal",
			);
		}

		let padre: Ganado | null = null;
		if (padreId !== null) {
			if (ganadoId !== undefined && padreId === ganadoId) {
				throw new ValidationError(
					"Un ganado no puede ser registrado como su propio padre",
				);
			}
			padre = await this.accessService.obtenerGanado(padreId, actor);
			if (padre.getSexo() !== "MACHO") {
				throw new ValidationError(
					`El padre (${padre.getIdentificador()}) debe ser de sexo MACHO`,
				);
			}
			this.validarEdadProgenitor(padre, fechaNacimientoCria, "padre");
			if (ganadoId !== undefined) {
				await this.asegurarSinCiclo(ganadoId, padreId, "padre");
			}
		}

		let madre: Ganado | null = null;
		if (madreId !== null) {
			if (ganadoId !== undefined && madreId === ganadoId) {
				throw new ValidationError(
					"Un ganado no puede ser registrado como su propia madre",
				);
			}
			madre = await this.accessService.obtenerGanado(madreId, actor);
			if (madre.getSexo() !== "HEMBRA") {
				throw new ValidationError(
					`La madre (${madre.getIdentificador()}) debe ser de sexo HEMBRA`,
				);
			}
			this.validarEdadProgenitor(madre, fechaNacimientoCria, "madre");
			if (ganadoId !== undefined) {
				await this.asegurarSinCiclo(ganadoId, madreId, "madre");
			}
		}

		return { padre, madre };
	}

	private validarEdadProgenitor(
		progenitor: Ganado,
		fechaNacimientoCria: Date,
		rol: "padre" | "madre",
	): void {
		const edadMeses = calcularEdadMeses(
			progenitor.getFechaNacimiento(),
			fechaNacimientoCria,
		);
		if (edadMeses < EDAD_MINIMA_REPRODUCTIVA_MESES) {
			throw new ValidationError(
				`El/la ${rol} (${progenitor.getIdentificador()}) debe tener al menos ${EDAD_MINIMA_REPRODUCTIVA_MESES} meses de edad al nacimiento de la cría`,
			);
		}
	}

	private async asegurarSinCiclo(
		ganadoId: number,
		progenitorId: number,
		rol: "padre" | "madre",
	): Promise<void> {
		const visitados = new Set<number>();
		const cola: number[] = [progenitorId];

		while (cola.length > 0) {
			const actualId = cola.shift();
			if (actualId === undefined || visitados.has(actualId)) continue;
			visitados.add(actualId);

			const animal = await this.ganadoRepository.findById(actualId);
			if (!animal) continue;

			const pId = animal.getPadreId();
			const mId = animal.getMadreId();
			if (pId === ganadoId || mId === ganadoId) {
				throw new ValidationError(
					`La asignación de ${rol} crearía un ciclo genealógico`,
				);
			}
			if (pId !== null && !visitados.has(pId)) cola.push(pId);
			if (mId !== null && !visitados.has(mId)) cola.push(mId);
		}
	}
}

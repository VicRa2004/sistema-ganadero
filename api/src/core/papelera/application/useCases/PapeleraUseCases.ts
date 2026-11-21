import { inject, injectable } from "tsyringe";
import { logger } from "@/core/config/logger";
import type { Actor } from "@/core/shared/domain/Actor";
import { esAdmin, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type {
	ElementoPapelera,
	PapeleraRepository,
} from "../../domain/repository/PapeleraRepository";
import {
	DIAS_EN_PAPELERA,
	TIPOS_PAPELERA,
	type TipoPapelera,
} from "../../domain/TipoPapelera";

export interface ElementoPapeleraOutputDto {
	tipo: TipoPapelera;
	id: number;
	nombre: string;
	eliminadoEn: string;
	purgaEn: string;
	dependeDeEliminado: boolean;
}

const MS_POR_DIA = 86_400_000;

const toDto = (
	tipo: TipoPapelera,
	e: ElementoPapelera,
): ElementoPapeleraOutputDto => ({
	tipo,
	id: e.id,
	nombre: e.nombre,
	eliminadoEn: e.eliminadoEn.toISOString(),
	purgaEn: new Date(
		e.eliminadoEn.getTime() + DIAS_EN_PAPELERA * MS_POR_DIA,
	).toISOString(),
	dependeDeEliminado: e.dependeDeEliminado,
});

/** Busca el elemento eliminado y comprueba que el actor sea su dueño (o ADMIN). */
async function obtenerPropio(
	repository: PapeleraRepository,
	tipo: TipoPapelera,
	id: number,
	actor: Actor,
): Promise<ElementoPapelera> {
	const elemento = await repository.buscarEliminado(tipo, id);
	// 404 también si es ajeno: no se revela qué existe en la papelera de otros
	if (!elemento || (!esAdmin(actor) && elemento.usuarioId !== actor.id)) {
		throw new BaseError("El elemento no está en la papelera", 404);
	}
	return elemento;
}

@injectable()
export class ListarPapeleraUseCase {
	constructor(
		@inject("PapeleraRepository")
		private readonly repository: PapeleraRepository,
	) {}

	public async run(
		tipo: TipoPapelera,
		params: { page: number; limit: number },
		actor: Actor,
	): Promise<Pagination<ElementoPapeleraOutputDto>> {
		const result = await this.repository.listar(tipo, {
			...params,
			usuarioId: usuarioIdDeFiltro(actor),
		});
		return { ...result, data: result.data.map((e) => toDto(tipo, e)) };
	}
}

@injectable()
export class RestaurarElementoUseCase {
	constructor(
		@inject("PapeleraRepository")
		private readonly repository: PapeleraRepository,
	) {}

	public async run(
		tipo: TipoPapelera,
		id: number,
		actor: Actor,
	): Promise<void> {
		const elemento = await obtenerPropio(this.repository, tipo, id, actor);
		if (elemento.dependeDeEliminado) {
			throw new BaseError(
				"Restaura primero el terreno, propietario o lote del que depende",
				409,
			);
		}
		await this.repository.restaurar(tipo, id);
	}
}

@injectable()
export class EliminarDefinitivoUseCase {
	constructor(
		@inject("PapeleraRepository")
		private readonly repository: PapeleraRepository,
	) {}

	public async run(
		tipo: TipoPapelera,
		id: number,
		actor: Actor,
	): Promise<void> {
		await obtenerPropio(this.repository, tipo, id, actor);
		await this.repository.eliminarDefinitivo(tipo, id);
	}
}

@injectable()
export class PurgarPapeleraUseCase {
	constructor(
		@inject("PapeleraRepository")
		private readonly repository: PapeleraRepository,
	) {}

	/** Borra definitivamente lo eliminado hace más de `DIAS_EN_PAPELERA` días. */
	public async run(
		ahora = new Date(),
	): Promise<{ eliminados: number; conservados: number }> {
		const limite = new Date(ahora.getTime() - DIAS_EN_PAPELERA * MS_POR_DIA);
		let eliminados = 0;
		let conservados = 0;

		for (const tipo of TIPOS_PAPELERA) {
			for (const id of await this.repository.idsEliminadosAntesDe(
				tipo,
				limite,
			)) {
				try {
					await this.repository.eliminarDefinitivo(tipo, id);
					eliminados++;
				} catch (error) {
					// Sigue referenciado (p. ej. un animal con historial sanitario): se conserva
					conservados++;
					logger.debug(`Purga: se conserva ${tipo} ${id}`, error);
				}
			}
		}
		return { eliminados, conservados };
	}
}

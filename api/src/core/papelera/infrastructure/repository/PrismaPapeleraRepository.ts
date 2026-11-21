import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type {
	ElementoPapelera,
	PapeleraFilters,
	PapeleraRepository,
} from "../../domain/repository/PapeleraRepository";
import type { TipoPapelera } from "../../domain/TipoPapelera";

type Eliminable = { deletedAt: Date | null } | null;

interface Fila {
	id: number;
	deletedAt: Date | null;
	nombre?: string;
	identificador?: string;
	usuarioId?: number;
	terreno?: ({ usuarioId: number } & Eliminable) | null;
	propietario?: Eliminable;
}

/** Lo común de los delegados de Prisma que usa la papelera. */
interface Delegado {
	findMany(args: object): Promise<Fila[]>;
	count(args: object): Promise<number>;
	update(args: object): Promise<unknown>;
	delete(args: object): Promise<unknown>;
}

interface Config {
	delegado: () => Delegado;
	select: object;
	whereDueño: (usuarioId: number) => object;
}

const eliminado = { deletedAt: true } as const;

const CONFIG: Record<TipoPapelera, Config> = {
	ganado: {
		delegado: () => prisma.ganado as unknown as Delegado,
		select: {
			identificador: true,
			terreno: { select: { usuarioId: true, ...eliminado } },
			propietario: { select: eliminado },
		},
		whereDueño: (usuarioId) => ({ terreno: { usuarioId } }),
	},
	lote: {
		delegado: () => prisma.lote as unknown as Delegado,
		select: {
			nombre: true,
			usuarioId: true,
			terreno: { select: { usuarioId: true, ...eliminado } },
		},
		whereDueño: (usuarioId) => ({ usuarioId }),
	},
	insumo: {
		delegado: () => prisma.insumo as unknown as Delegado,
		select: { nombre: true, usuarioId: true },
		whereDueño: (usuarioId) => ({ usuarioId }),
	},
	veterinario: {
		delegado: () => prisma.veterinario as unknown as Delegado,
		select: { nombre: true, usuarioId: true },
		whereDueño: (usuarioId) => ({ usuarioId }),
	},
	propietario: {
		delegado: () => prisma.propietario as unknown as Delegado,
		select: { nombre: true, usuarioId: true },
		whereDueño: (usuarioId) => ({ usuarioId }),
	},
	terreno: {
		delegado: () => prisma.terreno as unknown as Delegado,
		select: { nombre: true, usuarioId: true },
		whereDueño: (usuarioId) => ({ usuarioId }),
	},
};

const toElemento = (f: Fila): ElementoPapelera => ({
	id: f.id,
	nombre: f.nombre ?? f.identificador ?? `#${f.id}`,
	eliminadoEn: f.deletedAt as Date,
	usuarioId: f.usuarioId ?? f.terreno?.usuarioId ?? 0,
	dependeDeEliminado: Boolean(f.terreno?.deletedAt || f.propietario?.deletedAt),
});

@injectable()
export class PrismaPapeleraRepository implements PapeleraRepository {
	private consultar(tipo: TipoPapelera, where: object) {
		const { delegado, select } = CONFIG[tipo];
		// `deletedAt` explícito anula el filtro automático de borrado lógico
		return {
			delegado: delegado(),
			select: { id: true, deletedAt: true, ...select },
			where: { deletedAt: { not: null }, ...where },
		};
	}

	async listar(
		tipo: TipoPapelera,
		{ page, limit, usuarioId }: PapeleraFilters,
	): Promise<Pagination<ElementoPapelera>> {
		const { delegado, select, where } = this.consultar(
			tipo,
			usuarioId === undefined ? {} : CONFIG[tipo].whereDueño(usuarioId),
		);
		const [filas, totalItems] = await Promise.all([
			delegado.findMany({
				where,
				select,
				orderBy: [{ deletedAt: "desc" }, { id: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
			}),
			delegado.count({ where }),
		]);
		return {
			data: filas.map(toElemento),
			page,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		};
	}

	async buscarEliminado(
		tipo: TipoPapelera,
		id: number,
	): Promise<ElementoPapelera | null> {
		const { delegado, select, where } = this.consultar(tipo, { id });
		const [fila] = await delegado.findMany({ where, select, take: 1 });
		return fila ? toElemento(fila) : null;
	}

	async restaurar(tipo: TipoPapelera, id: number): Promise<void> {
		await CONFIG[tipo].delegado().update({
			where: { id },
			data: { deletedAt: null },
		});
	}

	async eliminarDefinitivo(tipo: TipoPapelera, id: number): Promise<void> {
		await CONFIG[tipo].delegado().delete({ where: { id } });
	}

	async idsEliminadosAntesDe(
		tipo: TipoPapelera,
		fecha: Date,
	): Promise<number[]> {
		const filas = await CONFIG[tipo].delegado().findMany({
			where: { deletedAt: { lt: fecha } },
			select: { id: true },
		});
		return filas.map((f) => f.id);
	}
}

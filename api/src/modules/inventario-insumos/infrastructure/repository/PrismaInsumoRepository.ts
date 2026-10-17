import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/core/config/transaction";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Insumo } from "../../domain/Insumo";
import type { TipoInsumo } from "../../domain/TipoInsumo";
import type { InsumoFilters } from "../../domain/repository/InsumoFilters";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

interface PrismaInsumoRecord {
	id: number;
	nombre: string;
	tipo: TipoInsumo;
	stock: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: Date;
	usuarioId: number;
	deletedAt: Date | null;
}

@injectable()
export class PrismaInsumoRepository implements InsumoRepository {
	private toDomain(record: PrismaInsumoRecord): Insumo {
		return Insumo.reconstitute(
			record.id,
			record.nombre,
			record.tipo,
			record.stock,
			record.stockMinimo,
			record.unidadMedida,
			record.lote,
			record.fechaCaducidad,
			record.usuarioId,
		);
	}

	public async findById(id: number): Promise<Insumo | null> {
		const record = await db().insumo.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaInsumoRecord);
	}

	public async findAll(filters: InsumoFilters): Promise<Pagination<Insumo>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.InsumoWhereInput = { deletedAt: null };

		if (filters.usuarioId !== undefined) {
			whereClause.usuarioId = filters.usuarioId;
		}

		if (filters.nombre && filters.nombre.trim() !== "") {
			whereClause.nombre = {
				contains: filters.nombre,
				mode: "insensitive",
			};
		}

		if (filters.tipo && filters.tipo.trim() !== "") {
			whereClause.tipo = filters.tipo as Prisma.EnumTipoInsumoFilter;
		}

		const [records, totalItems] = await Promise.all([
			db().insumo.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			db().insumo.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: records.map((record) =>
				this.toDomain(record as unknown as PrismaInsumoRecord),
			),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async findCriticos(usuarioId?: number): Promise<Insumo[]> {
		const whereClause: Prisma.InsumoWhereInput = {
			deletedAt: null,
			// Comparación columna con columna en la BD: stock <= stock_minimo
			stock: { lte: db().insumo.fields.stockMinimo },
		};
		if (usuarioId !== undefined) {
			whereClause.usuarioId = usuarioId;
		}

		const records = await db().insumo.findMany({
			where: whereClause,
			orderBy: { id: "asc" },
		});

		return records.map((record) =>
			this.toDomain(record as unknown as PrismaInsumoRecord),
		);
	}

	public async save(insumo: Insumo): Promise<Insumo> {
		if (insumo.esNuevo()) {
			const record = await db().insumo.create({
				data: {
					nombre: insumo.getNombre(),
					tipo: insumo.getTipo(),
					stock: insumo.getStock(),
					stockMinimo: insumo.getStockMinimo(),
					unidadMedida: insumo.getUnidadMedida(),
					lote: insumo.getLote(),
					fechaCaducidad: insumo.getFechaCaducidad(),
					usuarioId: insumo.getUsuarioId(),
				},
			});
			return this.toDomain(record as unknown as PrismaInsumoRecord);
		}

		// El stock no se escribe aquí: se modifica solo con descontarStock/adicionarStock
		// (operaciones atómicas) para no pisar movimientos concurrentes con un valor viejo.
		const record = await db().insumo.update({
			where: { id: insumo.getId() },
			data: {
				nombre: insumo.getNombre(),
				tipo: insumo.getTipo(),
				stockMinimo: insumo.getStockMinimo(),
				unidadMedida: insumo.getUnidadMedida(),
				lote: insumo.getLote(),
				fechaCaducidad: insumo.getFechaCaducidad(),
				usuarioId: insumo.getUsuarioId(),
			},
		});
		return this.toDomain(record as unknown as PrismaInsumoRecord);
	}

	public async descontarStock(
		id: number,
		cantidad: number,
	): Promise<Insumo | null> {
		// Un único UPDATE condicionado: nunca deja el stock en negativo, ni siquiera con concurrencia
		const { count } = await db().insumo.updateMany({
			where: { id, deletedAt: null, stock: { gte: cantidad } },
			data: { stock: { decrement: cantidad } },
		});
		if (count !== 1) return null;

		return this.findById(id);
	}

	public async adicionarStock(
		id: number,
		cantidad: number,
	): Promise<Insumo | null> {
		const { count } = await db().insumo.updateMany({
			where: { id, deletedAt: null },
			data: { stock: { increment: cantidad } },
		});
		if (count !== 1) return null;

		return this.findById(id);
	}

	public async delete(id: number): Promise<void> {
		await db().insumo.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

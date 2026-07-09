import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
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
		);
	}

	public async findById(id: number): Promise<Insumo | null> {
		const record = await prisma.insumo.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaInsumoRecord);
	}

	public async findAll(filters: InsumoFilters): Promise<Pagination<Insumo>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.InsumoWhereInput = { deletedAt: null };

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
			prisma.insumo.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.insumo.count({
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

	public async findCriticos(): Promise<Insumo[]> {
		const records = await prisma.insumo.findMany({
			where: { deletedAt: null },
		});

		// Filtramos en memoria los insumos cuyo stock es inferior o igual a stockMinimo
		const criticos = records.filter((r) => r.stock <= r.stockMinimo);

		return criticos.map((record) =>
			this.toDomain(record as unknown as PrismaInsumoRecord),
		);
	}

	public async save(insumo: Insumo): Promise<Insumo> {
		if (insumo.esNuevo()) {
			const record = await prisma.insumo.create({
				data: {
					nombre: insumo.getNombre(),
					tipo: insumo.getTipo(),
					stock: insumo.getStock(),
					stockMinimo: insumo.getStockMinimo(),
					unidadMedida: insumo.getUnidadMedida(),
					lote: insumo.getLote(),
					fechaCaducidad: insumo.getFechaCaducidad(),
				},
			});
			return this.toDomain(record as unknown as PrismaInsumoRecord);
		}

		const record = await prisma.insumo.update({
			where: { id: insumo.getId() },
			data: {
				nombre: insumo.getNombre(),
				tipo: insumo.getTipo(),
				stock: insumo.getStock(),
				stockMinimo: insumo.getStockMinimo(),
				unidadMedida: insumo.getUnidadMedida(),
				lote: insumo.getLote(),
				fechaCaducidad: insumo.getFechaCaducidad(),
			},
		});
		return this.toDomain(record as unknown as PrismaInsumoRecord);
	}

	public async delete(id: number): Promise<void> {
		await prisma.insumo.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

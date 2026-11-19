import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import type { CategoriaGasto } from "../../domain/CategoriaGasto";
import { Gasto } from "../../domain/Gasto";
import type { GastoFilters } from "../../domain/repository/ComercialFilters";
import type { GastoRepository } from "../../domain/repository/GastoRepository";

interface PrismaGastoRecord {
	id: number;
	categoria: CategoriaGasto;
	concepto: string;
	monto: Prisma.Decimal;
	fecha: Date;
	terrenoId: number | null;
	ganadoId: number | null;
	loteId: number | null;
	observaciones: string | null;
	usuarioId: number;
	terreno?: { nombre: string } | null;
	ganado?: { identificador: string } | null;
	lote?: { nombre: string } | null;
}

@injectable()
export class PrismaGastoRepository implements GastoRepository {
	private toDomain(record: PrismaGastoRecord): Gasto {
		return Gasto.reconstitute({
			id: record.id,
			categoria: record.categoria,
			concepto: record.concepto,
			monto: record.monto.toNumber(),
			fecha: record.fecha,
			terrenoId: record.terrenoId,
			ganadoId: record.ganadoId,
			loteId: record.loteId,
			observaciones: record.observaciones,
			usuarioId: record.usuarioId,
			terrenoNombre: record.terreno?.nombre ?? null,
			ganadoIdentificador: record.ganado?.identificador ?? null,
			loteNombre: record.lote?.nombre ?? null,
		});
	}

	private readonly includeRefs = {
		terreno: { select: { nombre: true } },
		ganado: { select: { identificador: true } },
		lote: { select: { nombre: true } },
	} as const;

	public async save(gasto: Gasto): Promise<Gasto> {
		if (gasto.esNuevo()) {
			const created = await db().gasto.create({
				data: {
					categoria: gasto.getCategoria(),
					concepto: gasto.getConcepto(),
					monto: gasto.getMonto(),
					fecha: gasto.getFecha(),
					terrenoId: gasto.getTerrenoId(),
					ganadoId: gasto.getGanadoId(),
					loteId: gasto.getLoteId(),
					observaciones: gasto.getObservaciones(),
					usuarioId: gasto.getUsuarioId(),
				},
				include: this.includeRefs,
			});
			return this.toDomain(created as unknown as PrismaGastoRecord);
		}

		const updated = await db().gasto.update({
			where: { id: gasto.getId() },
			data: {
				categoria: gasto.getCategoria(),
				concepto: gasto.getConcepto(),
				monto: gasto.getMonto(),
				fecha: gasto.getFecha(),
				terrenoId: gasto.getTerrenoId(),
				ganadoId: gasto.getGanadoId(),
				loteId: gasto.getLoteId(),
				observaciones: gasto.getObservaciones(),
			},
			include: this.includeRefs,
		});
		return this.toDomain(updated as unknown as PrismaGastoRecord);
	}

	public async findById(id: number): Promise<Gasto | null> {
		const record = await db().gasto.findFirst({
			where: { id },
			include: this.includeRefs,
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaGastoRecord);
	}

	public async findAll(filters: GastoFilters): Promise<Pagination<Gasto>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.GastoWhereInput = {};
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) where.usuarioId = usuarioId;
		if (filters.categoria) where.categoria = filters.categoria;
		if (filters.terrenoId) where.terrenoId = filters.terrenoId;
		if (filters.ganadoId) where.ganadoId = filters.ganadoId;
		if (filters.loteId) where.loteId = filters.loteId;
		if (filters.desde || filters.hasta) {
			where.fecha = {
				...(filters.desde && { gte: filters.desde }),
				...(filters.hasta && { lte: filters.hasta }),
			};
		}

		const [records, totalItems] = await Promise.all([
			db().gasto.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
				include: this.includeRefs,
			}),
			db().gasto.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toDomain(r as unknown as PrismaGastoRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async delete(id: number): Promise<void> {
		await db().gasto.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

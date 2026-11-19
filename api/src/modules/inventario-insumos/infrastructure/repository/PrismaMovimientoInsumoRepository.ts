import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/core/config/transaction";
import type { Pagination } from "@/core/shared/domain/Pagination";
import {
	MovimientoInsumo,
	type TipoMovimientoInsumo,
} from "../../domain/MovimientoInsumo";
import type { MovimientoInsumoFilters } from "../../domain/repository/MovimientoInsumoFilters";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";

interface PrismaMovimientoRecord {
	id: number;
	insumoId: number;
	tipo: TipoMovimientoInsumo;
	cantidad: Prisma.Decimal;
	delta: Prisma.Decimal;
	costoUnitario: Prisma.Decimal | null;
	motivo: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
	ganadoId: number | null;
	terrenoId: number | null;
	loteId: number | null;
	usuarioId: number;
	fecha: Date;
}

@injectable()
export class PrismaMovimientoInsumoRepository
	implements MovimientoInsumoRepository
{
	private toDomain(record: PrismaMovimientoRecord): MovimientoInsumo {
		return MovimientoInsumo.reconstitute({
			id: record.id,
			insumoId: record.insumoId,
			tipo: record.tipo,
			cantidad: record.cantidad.toNumber(),
			delta: record.delta.toNumber(),
			costoUnitario: record.costoUnitario?.toNumber() ?? null,
			motivo: record.motivo,
			referenciaTipo: record.referenciaTipo,
			referenciaId: record.referenciaId,
			ganadoId: record.ganadoId,
			terrenoId: record.terrenoId,
			loteId: record.loteId,
			usuarioId: record.usuarioId,
			fecha: record.fecha,
		});
	}

	public async registrar(mov: MovimientoInsumo): Promise<MovimientoInsumo> {
		const record = await db().movimientoInsumo.create({
			data: {
				insumoId: mov.getInsumoId(),
				tipo: mov.getTipo(),
				cantidad: mov.getCantidad(),
				delta: mov.getDelta(),
				costoUnitario: mov.getCostoUnitario(),
				motivo: mov.getMotivo(),
				referenciaTipo: mov.getReferenciaTipo(),
				referenciaId: mov.getReferenciaId(),
				ganadoId: mov.getGanadoId(),
				terrenoId: mov.getTerrenoId(),
				loteId: mov.getLoteId(),
				usuarioId: mov.getUsuarioId(),
				fecha: mov.getFecha(),
			},
		});
		return this.toDomain(record as unknown as PrismaMovimientoRecord);
	}

	public async registrarMuchos(movimientos: MovimientoInsumo[]): Promise<void> {
		if (movimientos.length === 0) return;
		await db().movimientoInsumo.createMany({
			data: movimientos.map((mov) => ({
				insumoId: mov.getInsumoId(),
				tipo: mov.getTipo(),
				cantidad: mov.getCantidad(),
				delta: mov.getDelta(),
				costoUnitario: mov.getCostoUnitario(),
				motivo: mov.getMotivo(),
				referenciaTipo: mov.getReferenciaTipo(),
				referenciaId: mov.getReferenciaId(),
				ganadoId: mov.getGanadoId(),
				terrenoId: mov.getTerrenoId(),
				loteId: mov.getLoteId(),
				usuarioId: mov.getUsuarioId(),
				fecha: mov.getFecha(),
			})),
		});
	}

	public async findByInsumo(
		filters: MovimientoInsumoFilters,
	): Promise<Pagination<MovimientoInsumo>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.MovimientoInsumoWhereInput = {
			insumoId: filters.insumoId,
			...(filters.tipo && { tipo: filters.tipo }),
			...((filters.desde || filters.hasta) && {
				fecha: {
					...(filters.desde && { gte: filters.desde }),
					...(filters.hasta && { lte: filters.hasta }),
				},
			}),
		};

		const [records, totalItems] = await Promise.all([
			db().movimientoInsumo.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
			}),
			db().movimientoInsumo.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toDomain(r as unknown as PrismaMovimientoRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async sumDeltaByInsumo(insumoId: number): Promise<number> {
		const result = await db().movimientoInsumo.aggregate({
			where: { insumoId },
			_sum: { delta: true },
		});
		const total = result._sum.delta?.toNumber() ?? 0;
		return Number(total.toFixed(3));
	}
}

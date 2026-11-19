import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import type { TipoTransaccion } from "../../domain/CategoriaGasto";
import type { TransaccionFilters } from "../../domain/repository/ComercialFilters";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import { Transaccion } from "../../domain/Transaccion";
import { TransaccionGanado } from "../../domain/TransaccionGanado";

interface PrismaTransaccionRecord {
	id: number;
	tipo: TipoTransaccion;
	fecha: Date;
	contraparte: string;
	total: Prisma.Decimal;
	moneda: string;
	documento: string | null;
	documentoAdjunto: string | null;
	observaciones: string | null;
	usuarioId: number;
	detalles: Array<{
		id: number;
		transaccionId: number;
		ganadoId: number;
		precio: Prisma.Decimal;
		pesoRegistro: number;
		procedencia: string | null;
		ganado?: { identificador: string } | null;
	}>;
}

@injectable()
export class PrismaTransaccionRepository implements TransaccionRepository {
	private toDomain(record: PrismaTransaccionRecord): Transaccion {
		return Transaccion.reconstitute({
			id: record.id,
			tipo: record.tipo,
			fecha: record.fecha,
			contraparte: record.contraparte,
			total: record.total.toNumber(),
			moneda: record.moneda,
			documento: record.documento,
			documentoAdjunto: record.documentoAdjunto,
			observaciones: record.observaciones,
			usuarioId: record.usuarioId,
			detalles: record.detalles.map((d) =>
				TransaccionGanado.reconstitute({
					id: d.id,
					transaccionId: d.transaccionId,
					ganadoId: d.ganadoId,
					precio: d.precio.toNumber(),
					pesoRegistro: d.pesoRegistro,
					procedencia: d.procedencia,
					ganadoIdentificador: d.ganado?.identificador ?? "",
				}),
			),
		});
	}

	private readonly includeDetalles = {
		detalles: {
			include: { ganado: { select: { identificador: true } } },
			orderBy: { id: "asc" as const },
		},
	};

	public async save(t: Transaccion): Promise<Transaccion> {
		const created = await db().transaccion.create({
			data: {
				tipo: t.getTipo(),
				fecha: t.getFecha(),
				contraparte: t.getContraparte(),
				total: t.getTotal(),
				moneda: t.getMoneda(),
				documento: t.getDocumento(),
				documentoAdjunto: t.getDocumentoAdjunto(),
				observaciones: t.getObservaciones(),
				usuarioId: t.getUsuarioId(),
				detalles: {
					create: t.getDetalles().map((d) => ({
						ganadoId: d.getGanadoId(),
						precio: d.getPrecio(),
						pesoRegistro: d.getPesoRegistro(),
						procedencia: d.getProcedencia(),
					})),
				},
			},
			include: this.includeDetalles,
		});
		return this.toDomain(created as unknown as PrismaTransaccionRecord);
	}

	public async findById(id: number): Promise<Transaccion | null> {
		const record = await db().transaccion.findFirst({
			where: { id },
			include: this.includeDetalles,
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaTransaccionRecord);
	}

	public async findAll(
		filters: TransaccionFilters,
	): Promise<Pagination<Transaccion>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.TransaccionWhereInput = {};
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) where.usuarioId = usuarioId;
		if (filters.tipo) where.tipo = filters.tipo;
		if (filters.desde || filters.hasta) {
			where.fecha = {
				...(filters.desde && { gte: filters.desde }),
				...(filters.hasta && { lte: filters.hasta }),
			};
		}

		const [records, totalItems] = await Promise.all([
			db().transaccion.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
				include: this.includeDetalles,
			}),
			db().transaccion.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toDomain(r as unknown as PrismaTransaccionRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async delete(id: number): Promise<void> {
		await db().transaccion.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

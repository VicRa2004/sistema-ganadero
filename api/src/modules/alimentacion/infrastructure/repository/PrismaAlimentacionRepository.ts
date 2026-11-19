import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import { RacionAlimentacion } from "../../domain/RacionAlimentacion";
import type {
	RacionFilters,
	SuministroFilters,
} from "../../domain/repository/AlimentacionFilters";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import { SuministroRacion } from "../../domain/SuministroRacion";

interface PrismaRacionRecord {
	id: number;
	nombre: string;
	insumoId: number;
	terrenoId: number | null;
	loteId: number | null;
	cantidadDiariaPorAnimal: Prisma.Decimal;
	diasAlertaAutonomia: number;
	activo: boolean;
	observaciones: string | null;
	usuarioId: number;
	insumo?: { nombre: string; unidadMedida: string };
	terreno?: { nombre: string } | null;
	lote?: { nombre: string } | null;
}

interface PrismaSuministroRecord {
	id: number;
	racionId: number;
	insumoId: number;
	terrenoId: number | null;
	loteId: number | null;
	fecha: Date;
	cantidadAnimales: number;
	cantidadTotal: Prisma.Decimal;
	costoTotal: Prisma.Decimal;
	observaciones: string | null;
	usuarioId: number;
	racion?: { nombre: string };
	insumo?: { nombre: string; unidadMedida: string };
}

@injectable()
export class PrismaAlimentacionRepository implements AlimentacionRepository {
	private toRacionDomain(record: PrismaRacionRecord): RacionAlimentacion {
		return RacionAlimentacion.reconstitute({
			id: record.id,
			nombre: record.nombre,
			insumoId: record.insumoId,
			terrenoId: record.terrenoId,
			loteId: record.loteId,
			cantidadDiariaPorAnimal: record.cantidadDiariaPorAnimal.toNumber(),
			diasAlertaAutonomia: record.diasAlertaAutonomia,
			activo: record.activo,
			observaciones: record.observaciones,
			usuarioId: record.usuarioId,
			insumoNombre: record.insumo?.nombre ?? "",
			insumoUnidad: record.insumo?.unidadMedida ?? "",
			terrenoNombre: record.terreno?.nombre ?? null,
			loteNombre: record.lote?.nombre ?? null,
		});
	}

	private toSuministroDomain(record: PrismaSuministroRecord): SuministroRacion {
		return SuministroRacion.reconstitute({
			id: record.id,
			racionId: record.racionId,
			insumoId: record.insumoId,
			terrenoId: record.terrenoId,
			loteId: record.loteId,
			fecha: record.fecha,
			cantidadAnimales: record.cantidadAnimales,
			cantidadTotal: record.cantidadTotal.toNumber(),
			costoTotal: record.costoTotal.toNumber(),
			observaciones: record.observaciones,
			usuarioId: record.usuarioId,
			racionNombre: record.racion?.nombre ?? "",
			insumoNombre: record.insumo?.nombre ?? "",
			insumoUnidad: record.insumo?.unidadMedida ?? "",
		});
	}

	private readonly racionInclude = {
		insumo: { select: { nombre: true, unidadMedida: true } },
		terreno: { select: { nombre: true } },
		lote: { select: { nombre: true } },
	} as const;

	public async findRacionById(id: number): Promise<RacionAlimentacion | null> {
		const record = await db().racionAlimentacion.findFirst({
			where: { id },
			include: this.racionInclude,
		});
		if (!record) return null;
		return this.toRacionDomain(record as unknown as PrismaRacionRecord);
	}

	public async findRaciones(
		filters: RacionFilters,
	): Promise<Pagination<RacionAlimentacion>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.RacionAlimentacionWhereInput = {};
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) where.usuarioId = usuarioId;
		if (filters.activo !== undefined) where.activo = filters.activo;
		if (filters.terrenoId !== undefined) where.terrenoId = filters.terrenoId;
		if (filters.loteId !== undefined) where.loteId = filters.loteId;

		const [records, totalItems] = await Promise.all([
			db().racionAlimentacion.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: { id: "desc" },
				include: this.racionInclude,
			}),
			db().racionAlimentacion.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toRacionDomain(r as unknown as PrismaRacionRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async saveRacion(
		racion: RacionAlimentacion,
	): Promise<RacionAlimentacion> {
		if (racion.esNuevo()) {
			const created = await db().racionAlimentacion.create({
				data: {
					nombre: racion.getNombre(),
					insumoId: racion.getInsumoId(),
					terrenoId: racion.getTerrenoId(),
					loteId: racion.getLoteId(),
					cantidadDiariaPorAnimal: racion.getCantidadDiariaPorAnimal(),
					diasAlertaAutonomia: racion.getDiasAlertaAutonomia(),
					activo: racion.esActivo(),
					observaciones: racion.getObservaciones(),
					usuarioId: racion.getUsuarioId(),
				},
				include: this.racionInclude,
			});
			return this.toRacionDomain(created as unknown as PrismaRacionRecord);
		}

		const updated = await db().racionAlimentacion.update({
			where: { id: racion.getId() },
			data: {
				nombre: racion.getNombre(),
				insumoId: racion.getInsumoId(),
				terrenoId: racion.getTerrenoId(),
				loteId: racion.getLoteId(),
				cantidadDiariaPorAnimal: racion.getCantidadDiariaPorAnimal(),
				diasAlertaAutonomia: racion.getDiasAlertaAutonomia(),
				activo: racion.esActivo(),
				observaciones: racion.getObservaciones(),
			},
			include: this.racionInclude,
		});
		return this.toRacionDomain(updated as unknown as PrismaRacionRecord);
	}

	public async deleteRacion(id: number): Promise<void> {
		await db().racionAlimentacion.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	public async registrarSuministro(
		s: SuministroRacion,
	): Promise<SuministroRacion> {
		const created = await db().suministroRacion.create({
			data: {
				racionId: s.getRacionId(),
				insumoId: s.getInsumoId(),
				terrenoId: s.getTerrenoId(),
				loteId: s.getLoteId(),
				fecha: s.getFecha(),
				cantidadAnimales: s.getCantidadAnimales(),
				cantidadTotal: s.getCantidadTotal(),
				costoTotal: s.getCostoTotal(),
				observaciones: s.getObservaciones(),
				usuarioId: s.getUsuarioId(),
			},
			include: {
				racion: { select: { nombre: true } },
				insumo: { select: { nombre: true, unidadMedida: true } },
			},
		});
		return this.toSuministroDomain(
			created as unknown as PrismaSuministroRecord,
		);
	}

	public async findSuministros(
		filters: SuministroFilters,
	): Promise<Pagination<SuministroRacion>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.SuministroRacionWhereInput = {};
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) where.usuarioId = usuarioId;
		if (filters.racionId !== undefined) where.racionId = filters.racionId;
		if (filters.desde || filters.hasta) {
			where.fecha = {
				...(filters.desde && { gte: filters.desde }),
				...(filters.hasta && { lte: filters.hasta }),
			};
		}

		const [records, totalItems] = await Promise.all([
			db().suministroRacion.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
				include: {
					racion: { select: { nombre: true } },
					insumo: { select: { nombre: true, unidadMedida: true } },
				},
			}),
			db().suministroRacion.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toSuministroDomain(r as unknown as PrismaSuministroRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async countAnimalesGrupo(params: {
		loteId: number | null;
		terrenoId: number | null;
	}): Promise<number> {
		if (params.loteId) {
			return db().loteGanado.count({
				where: {
					loteId: params.loteId,
					lote: { deletedAt: null },
					ganado: { deletedAt: null, fechaBaja: null },
				},
			});
		}
		if (params.terrenoId) {
			return db().ganado.count({
				where: {
					terrenoId: params.terrenoId,
					fechaBaja: null,
				},
			});
		}
		return 0;
	}
}

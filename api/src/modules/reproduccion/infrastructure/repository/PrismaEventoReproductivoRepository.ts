import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { SexoGanado } from "@/modules/ganado/domain/Ganado";
import type { Prisma } from "@/generated/prisma/client";
import {
	EventoReproductivo,
	type ResultadoDiagnostico,
	type TipoEventoReproductivo,
} from "../../domain/EventoReproductivo";
import type { EventoReproductivoFilters } from "../../domain/repository/EventoReproductivoFilters";
import type { EventoReproductivoRepository } from "../../domain/repository/EventoReproductivoRepository";

interface PrismaEventoRecord {
	id: number;
	hembraId: number;
	machoId: number | null;
	tipo: TipoEventoReproductivo;
	fecha: Date;
	resultado: ResultadoDiagnostico | null;
	fechaProbableParto: Date | null;
	observaciones: string | null;
	hembra?: { identificador: string };
	macho?: { identificador: string } | null;
	crias?: { id: number; identificador: string; sexo: SexoGanado }[];
}

@injectable()
export class PrismaEventoReproductivoRepository
	implements EventoReproductivoRepository
{
	private readonly includeRelaciones = {
		hembra: { select: { identificador: true } },
		macho: { select: { identificador: true } },
		crias: {
			where: { deletedAt: null },
			select: { id: true, identificador: true, sexo: true },
		},
	} as const;

	private toDomain(record: PrismaEventoRecord): EventoReproductivo {
		return EventoReproductivo.reconstitute({
			id: record.id,
			hembraId: record.hembraId,
			machoId: record.machoId,
			tipo: record.tipo,
			fecha: record.fecha,
			resultado: record.resultado,
			fechaProbableParto: record.fechaProbableParto,
			observaciones: record.observaciones,
			relaciones: {
				hembraIdentificador: record.hembra?.identificador,
				machoIdentificador: record.macho?.identificador ?? null,
				crias: record.crias ?? [],
			},
		});
	}

	public async save(evento: EventoReproductivo): Promise<EventoReproductivo> {
		const data = {
			hembraId: evento.getHembraId(),
			machoId: evento.getMachoId(),
			tipo: evento.getTipo(),
			fecha: evento.getFecha(),
			resultado: evento.getResultado(),
			fechaProbableParto: evento.getFechaProbableParto(),
			observaciones: evento.getObservaciones(),
		};

		if (evento.esNuevo()) {
			const created = await db().eventoReproductivo.create({
				data,
				include: this.includeRelaciones,
			});
			return this.toDomain(created as unknown as PrismaEventoRecord);
		}

		const updated = await db().eventoReproductivo.update({
			where: { id: evento.getId() },
			data,
			include: this.includeRelaciones,
		});
		return this.toDomain(updated as unknown as PrismaEventoRecord);
	}

	public async findById(id: number): Promise<EventoReproductivo | null> {
		const record = await db().eventoReproductivo.findFirst({
			where: { id },
			include: this.includeRelaciones,
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaEventoRecord);
	}

	public async findAll(
		filters: EventoReproductivoFilters,
	): Promise<Pagination<EventoReproductivo>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.EventoReproductivoWhereInput = {};
		const andConditions: Prisma.EventoReproductivoWhereInput[] = [];

		if (filters.hembraId !== undefined) {
			whereClause.hembraId = filters.hembraId;
		}
		if (filters.ganadoId !== undefined) {
			andConditions.push({
				OR: [{ hembraId: filters.ganadoId }, { machoId: filters.ganadoId }],
			});
		}
		if (filters.tipo !== undefined) {
			whereClause.tipo = filters.tipo;
		}
		if (filters.desde !== undefined || filters.hasta !== undefined) {
			whereClause.fecha = {
				...(filters.desde !== undefined && { gte: filters.desde }),
				...(filters.hasta !== undefined && { lte: filters.hasta }),
			};
		}

		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) {
			andConditions.push({
				hembra: {
					deletedAt: null,
					terreno: { deletedAt: null, usuarioId },
				},
			});
		}

		if (andConditions.length > 0) {
			whereClause.AND = andConditions;
		}

		const [records, totalItems] = await Promise.all([
			db().eventoReproductivo.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
				include: this.includeRelaciones,
			}),
			db().eventoReproductivo.count({ where: whereClause }),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: records.map((r) =>
				this.toDomain(r as unknown as PrismaEventoRecord),
			),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async findUltimoServicioAbierto(
		hembraId: number,
		hastaFecha: Date,
	): Promise<EventoReproductivo | null> {
		const ultimoServicio = await db().eventoReproductivo.findFirst({
			where: {
				hembraId,
				tipo: { in: ["MONTA", "INSEMINACION"] },
				fecha: { lte: hastaFecha },
			},
			orderBy: [{ fecha: "desc" }, { id: "desc" }],
			include: this.includeRelaciones,
		});
		if (!ultimoServicio) return null;

		const cierrePosterior = await db().eventoReproductivo.findFirst({
			where: {
				hembraId,
				tipo: { in: ["PARTO", "ABORTO"] },
				fecha: { gt: ultimoServicio.fecha, lte: hastaFecha },
			},
			select: { id: true },
		});
		if (cierrePosterior) return null;

		return this.toDomain(ultimoServicio as unknown as PrismaEventoRecord);
	}

	public async vincularCrias(
		eventoId: number,
		criaIds: number[],
	): Promise<void> {
		if (criaIds.length === 0) return;
		await db().ganado.updateMany({
			where: { id: { in: criaIds } },
			data: { partoEventoId: eventoId },
		});
	}

	public async delete(id: number): Promise<void> {
		await db().eventoReproductivo.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

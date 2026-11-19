import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import { Lote } from "../../domain/Lote";
import type { PropositoLote } from "../../domain/PropositoLote";
import type { LoteFilters } from "../../domain/repository/LoteFilters";
import type {
	LoteDetailRecord,
	LoteRepository,
} from "../../domain/repository/LoteRepository";

interface PrismaLoteRecord {
	id: number;
	nombre: string;
	proposito: PropositoLote;
	descripcion: string | null;
	terrenoId: number | null;
	activo: boolean;
	usuarioId: number;
	terreno?: { nombre: string } | null;
	_count?: { miembros: number };
}

@injectable()
export class PrismaLoteRepository implements LoteRepository {
	private toDomain(record: PrismaLoteRecord): Lote {
		return Lote.reconstitute({
			id: record.id,
			nombre: record.nombre,
			proposito: record.proposito,
			descripcion: record.descripcion,
			terrenoId: record.terrenoId,
			activo: record.activo,
			usuarioId: record.usuarioId,
			cantidadAnimales: record._count?.miembros ?? 0,
			terrenoNombre: record.terreno?.nombre ?? null,
		});
	}

	public async findById(id: number): Promise<Lote | null> {
		const record = await db().lote.findFirst({
			where: { id },
			include: {
				terreno: { select: { nombre: true } },
				_count: {
					select: {
						miembros: {
							where: { ganado: { deletedAt: null, fechaBaja: null } },
						},
					},
				},
			},
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaLoteRecord);
	}

	public async findDetailById(id: number): Promise<LoteDetailRecord | null> {
		const record = await db().lote.findFirst({
			where: { id },
			include: {
				terreno: { select: { nombre: true } },
				miembros: {
					where: { ganado: { deletedAt: null } },
					orderBy: { fechaIngreso: "desc" },
					include: {
						ganado: {
							select: {
								id: true,
								identificador: true,
								peso: true,
								sexo: true,
								fechaBaja: true,
								terrenoId: true,
								raza: { select: { nombre: true } },
								terreno: { select: { nombre: true } },
							},
						},
					},
				},
			},
		});
		if (!record) return null;

		const activos = record.miembros.filter((m) => m.ganado.fechaBaja === null);
		const lote = this.toDomain({
			...(record as unknown as PrismaLoteRecord),
			_count: { miembros: activos.length },
		});

		return {
			lote,
			miembros: record.miembros.map((m) => ({
				ganadoId: m.ganado.id,
				identificador: m.ganado.identificador,
				peso: m.ganado.peso,
				sexo: m.ganado.sexo,
				razaNombre: m.ganado.raza.nombre,
				terrenoId: m.ganado.terrenoId,
				terrenoNombre: m.ganado.terreno.nombre,
				fechaBaja: m.ganado.fechaBaja?.toISOString() ?? null,
				fechaIngreso: m.fechaIngreso.toISOString(),
			})),
		};
	}

	public async findAll(filters: LoteFilters): Promise<Pagination<Lote>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.LoteWhereInput = {};
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		if (usuarioId !== undefined) where.usuarioId = usuarioId;
		if (filters.nombre?.trim()) {
			where.nombre = { contains: filters.nombre.trim(), mode: "insensitive" };
		}
		if (filters.proposito) where.proposito = filters.proposito;
		if (filters.activo !== undefined) where.activo = filters.activo;

		const [records, totalItems] = await Promise.all([
			db().lote.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: { id: "desc" },
				include: {
					terreno: { select: { nombre: true } },
					_count: {
						select: {
							miembros: {
								where: { ganado: { deletedAt: null, fechaBaja: null } },
							},
						},
					},
				},
			}),
			db().lote.count({ where }),
		]);

		return {
			data: records.map((r) => this.toDomain(r as unknown as PrismaLoteRecord)),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async save(lote: Lote): Promise<Lote> {
		if (lote.esNuevo()) {
			const created = await db().lote.create({
				data: {
					nombre: lote.getNombre(),
					proposito: lote.getProposito(),
					descripcion: lote.getDescripcion(),
					terrenoId: lote.getTerrenoId(),
					activo: lote.esActivo(),
					usuarioId: lote.getUsuarioId(),
				},
				include: {
					terreno: { select: { nombre: true } },
					_count: { select: { miembros: true } },
				},
			});
			return this.toDomain(created as unknown as PrismaLoteRecord);
		}

		const updated = await db().lote.update({
			where: { id: lote.getId() },
			data: {
				nombre: lote.getNombre(),
				proposito: lote.getProposito(),
				descripcion: lote.getDescripcion(),
				terrenoId: lote.getTerrenoId(),
				activo: lote.esActivo(),
			},
			include: {
				terreno: { select: { nombre: true } },
				_count: {
					select: {
						miembros: {
							where: { ganado: { deletedAt: null, fechaBaja: null } },
						},
					},
				},
			},
		});
		return this.toDomain(updated as unknown as PrismaLoteRecord);
	}

	public async delete(id: number): Promise<void> {
		await db().lote.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	public async addMembers(loteId: number, ganadoIds: number[]): Promise<void> {
		if (ganadoIds.length === 0) return;
		await db().loteGanado.createMany({
			data: ganadoIds.map((ganadoId) => ({ loteId, ganadoId })),
			skipDuplicates: true,
		});
	}

	public async removeMember(loteId: number, ganadoId: number): Promise<void> {
		await db().loteGanado.deleteMany({
			where: { loteId, ganadoId },
		});
	}

	public async findActiveMemberIds(loteId: number): Promise<number[]> {
		const rows = await db().loteGanado.findMany({
			where: {
				loteId,
				ganado: { deletedAt: null, fechaBaja: null },
			},
			select: { ganadoId: true },
		});
		return rows.map((r) => r.ganadoId);
	}
}

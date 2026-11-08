import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { db } from "@/core/config/transaction";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import type { TratamientoMedicoFilters } from "../../domain/repository/TratamientoMedicoFilters";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import { TratamientoMedico } from "../../domain/TratamientoMedico";

const includeRelations = {
	ganado: { select: { identificador: true } },
	insumo: { select: { nombre: true, unidadMedida: true } },
	veterinario: { select: { nombre: true } },
} as const;

type PrismaTratamientoRecord = Prisma.TratamientoMedicoGetPayload<{
	include: typeof includeRelations;
}>;

@injectable()
export class PrismaTratamientoMedicoRepository
	implements TratamientoMedicoRepository
{
	private toDomain(record: PrismaTratamientoRecord): TratamientoMedico {
		return TratamientoMedico.reconstitute(
			record.id,
			record.ganadoId,
			record.diagnostico,
			record.fechaInicio,
			record.fechaFin,
			record.activo,
			record.insumoId,
			record.dosisDiaria.toNumber(),
			record.veterinarioId,
			{
				ganadoIdentificador: record.ganado?.identificador,
				insumoNombre: record.insumo?.nombre,
				insumoUnidad: record.insumo?.unidadMedida,
				veterinarioNombre: record.veterinario?.nombre ?? undefined,
				createdAt: record.createdAt,
				updatedAt: record.updatedAt,
			},
		);
	}

	public async findById(id: number): Promise<TratamientoMedico | null> {
		const record = await db().tratamientoMedico.findFirst({
			where: { id, deletedAt: null },
			include: includeRelations,
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async find(
		filters: TratamientoMedicoFilters,
	): Promise<Pagination<TratamientoMedico>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.TratamientoMedicoWhereInput = {
			deletedAt: null,
		};

		if (filters.ganadoId !== undefined) {
			whereClause.ganadoId = filters.ganadoId;
		}
		if (filters.activo !== undefined) {
			whereClause.activo = filters.activo;
		}
		if (filters.insumoId !== undefined) {
			whereClause.insumoId = filters.insumoId;
		}
		if (filters.veterinarioId !== undefined) {
			whereClause.veterinarioId = filters.veterinarioId;
		}

		const andConditions: Prisma.TratamientoMedicoWhereInput[] = [];

		// El tratamiento pertenece al dueño del terreno del ganado
		if (filters.usuarioId !== undefined) {
			andConditions.push({
				ganado: {
					deletedAt: null,
					terreno: {
						deletedAt: null,
						usuarioId: filters.usuarioId,
					},
				},
			});
		}

		if (filters.search && filters.search.trim() !== "") {
			const term = filters.search.trim();
			andConditions.push({
				OR: [
					{ diagnostico: { contains: term, mode: "insensitive" } },
					{
						ganado: {
							deletedAt: null,
							identificador: { contains: term, mode: "insensitive" },
						},
					},
				],
			});
		}

		if (andConditions.length > 0) {
			whereClause.AND = andConditions;
		}

		const [records, totalItems] = await Promise.all([
			prisma.tratamientoMedico.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: [{ activo: "desc" }, { fechaInicio: "desc" }, { id: "desc" }],
				include: includeRelations,
			}),
			prisma.tratamientoMedico.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: records.map((rec) => this.toDomain(rec)),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async findByGanadoId(ganadoId: number): Promise<TratamientoMedico[]> {
		const records = await prisma.tratamientoMedico.findMany({
			where: { ganadoId, deletedAt: null },
			orderBy: [{ activo: "desc" }, { fechaInicio: "desc" }, { id: "desc" }],
			include: includeRelations,
		});
		return records.map((rec) => this.toDomain(rec));
	}

	public async save(
		tratamiento: TratamientoMedico,
	): Promise<TratamientoMedico> {
		const data = {
			ganadoId: tratamiento.getGanadoId(),
			diagnostico: tratamiento.getDiagnostico(),
			fechaInicio: tratamiento.getFechaInicio(),
			fechaFin: tratamiento.getFechaFin(),
			activo: tratamiento.esActivo(),
			insumoId: tratamiento.getInsumoId(),
			dosisDiaria: tratamiento.getDosisDiaria(),
			veterinarioId: tratamiento.getVeterinarioId(),
		};

		if (tratamiento.esNuevo()) {
			const record = await db().tratamientoMedico.create({
				data,
				include: includeRelations,
			});
			return this.toDomain(record);
		}

		const record = await db().tratamientoMedico.update({
			where: { id: tratamiento.getId() },
			data,
			include: includeRelations,
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await db().tratamientoMedico.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

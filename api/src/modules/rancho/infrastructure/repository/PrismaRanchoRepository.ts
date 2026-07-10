import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Rancho } from "../../domain/Rancho";
import type { RanchoFilters } from "../../domain/repository/RanchoFilters";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";

interface PrismaRanchoRecord {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	deletedAt: Date | null;
}

@injectable()
export class PrismaRanchoRepository implements RanchoRepository {
	private toDomain(record: PrismaRanchoRecord): Rancho {
		return Rancho.reconstitute(
			record.id,
			record.nombre,
			record.ubicacion,
			record.extensionHectareas,
			record.capacidadMaxima,
		);
	}

	public async findById(id: number): Promise<Rancho | null> {
		const record = await prisma.rancho.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(filters: RanchoFilters): Promise<Pagination<Rancho>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.RanchoWhereInput = { deletedAt: null };

		if (filters.nombre && filters.nombre.trim() !== "") {
			whereClause.nombre = {
				contains: filters.nombre,
				mode: "insensitive",
			};
		}

		const [records, totalItems] = await Promise.all([
			prisma.rancho.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.rancho.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: records.map((record) => this.toDomain(record)),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async save(rancho: Rancho): Promise<Rancho> {
		if (rancho.esNuevo()) {
			const record = await prisma.rancho.create({
				data: {
					nombre: rancho.getNombre(),
					ubicacion: rancho.getUbicacion(),
					extensionHectareas: rancho.getExtensionHectareas(),
					capacidadMaxima: rancho.getCapacidadMaxima(),
				},
			});
			return this.toDomain(record);
		}

		const record = await prisma.rancho.update({
			where: { id: rancho.getId() },
			data: {
				nombre: rancho.getNombre(),
				ubicacion: rancho.getUbicacion(),
				extensionHectareas: rancho.getExtensionHectareas(),
				capacidadMaxima: rancho.getCapacidadMaxima(),
			},
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.rancho.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	public async countGanadoByRanchoId(ranchoId: number): Promise<number> {
		return prisma.ganado.count({
			where: {
				ranchoId,
				deletedAt: null,
			},
		});
	}
}

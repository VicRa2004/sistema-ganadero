import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Terreno } from "../../domain/Terreno";
import type { TerrenoFilters } from "../../domain/repository/TerrenoFilters";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";

interface PrismaTerrenoRecord {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	imagenTerreno: string | null;
	usuarioId: number;
	deletedAt: Date | null;
}

@injectable()
export class PrismaTerrenoRepository implements TerrenoRepository {
	private toDomain(record: PrismaTerrenoRecord): Terreno {
		return Terreno.reconstitute(
			record.id,
			record.nombre,
			record.ubicacion,
			record.extensionHectareas,
			record.capacidadMaxima,
			record.imagenTerreno,
			record.usuarioId,
		);
	}

	public async findById(id: number): Promise<Terreno | null> {
		const record = await prisma.terreno.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(filters: TerrenoFilters): Promise<Pagination<Terreno>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.TerrenoWhereInput = { deletedAt: null };

		if (filters.nombre && filters.nombre.trim() !== "") {
			whereClause.nombre = {
				contains: filters.nombre,
				mode: "insensitive",
			};
		}

		if (filters.usuarioId !== undefined) {
			whereClause.usuarioId = filters.usuarioId;
		}

		const [records, totalItems] = await Promise.all([
			prisma.terreno.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.terreno.count({
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

	public async save(terreno: Terreno): Promise<Terreno> {
		if (terreno.esNuevo()) {
			const record = await prisma.terreno.create({
				data: {
					nombre: terreno.getNombre(),
					ubicacion: terreno.getUbicacion(),
					extensionHectareas: terreno.getExtensionHectareas(),
					capacidadMaxima: terreno.getCapacidadMaxima(),
					imagenTerreno: terreno.getImagenTerreno(),
					usuarioId: terreno.getUsuarioId(),
				},
			});
			return this.toDomain(record);
		}

		const record = await prisma.terreno.update({
			where: { id: terreno.getId() },
			data: {
				nombre: terreno.getNombre(),
				ubicacion: terreno.getUbicacion(),
				extensionHectareas: terreno.getExtensionHectareas(),
				capacidadMaxima: terreno.getCapacidadMaxima(),
				imagenTerreno: terreno.getImagenTerreno(),
				usuarioId: terreno.getUsuarioId(),
			},
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.terreno.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	public async countGanadoByRanchoId(terrenoId: number): Promise<number> {
		return prisma.ganado.count({
			where: {
				terrenoId,
				deletedAt: null,
			},
		});
	}
}

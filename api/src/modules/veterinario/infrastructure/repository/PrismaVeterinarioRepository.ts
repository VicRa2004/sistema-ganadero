import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Veterinario } from "../../domain/Veterinario";
import type { VeterinarioFilters } from "../../domain/repository/VeterinarioFilters";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";

interface PrismaVeterinarioRecord {
	id: number;
	nombre: string;
	telefono: string;
	cedulaProfesional: string;
	especialidad: string | null;
	deletedAt: Date | null;
}

@injectable()
export class PrismaVeterinarioRepository implements VeterinarioRepository {
	private toDomain(record: PrismaVeterinarioRecord): Veterinario {
		return Veterinario.reconstitute(
			record.id,
			record.nombre,
			record.telefono,
			record.cedulaProfesional,
			record.especialidad,
		);
	}

	public async findById(id: number): Promise<Veterinario | null> {
		const record = await prisma.veterinario.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findByCedula(cedula: string): Promise<Veterinario | null> {
		const record = await prisma.veterinario.findFirst({
			where: {
				cedulaProfesional: { equals: cedula, mode: "insensitive" },
				deletedAt: null,
			},
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(
		filters: VeterinarioFilters,
	): Promise<Pagination<Veterinario>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.VeterinarioWhereInput = { deletedAt: null };

		if (filters.nombre && filters.nombre.trim() !== "") {
			whereClause.nombre = {
				contains: filters.nombre,
				mode: "insensitive",
			};
		}

		if (filters.especialidad && filters.especialidad.trim() !== "") {
			whereClause.especialidad = {
				contains: filters.especialidad,
				mode: "insensitive",
			};
		}

		const [records, totalItems] = await Promise.all([
			prisma.veterinario.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.veterinario.count({
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

	public async save(veterinario: Veterinario): Promise<Veterinario> {
		if (veterinario.esNuevo()) {
			const record = await prisma.veterinario.create({
				data: {
					nombre: veterinario.getNombre(),
					telefono: veterinario.getTelefono(),
					cedulaProfesional: veterinario.getCedulaProfesional(),
					especialidad: veterinario.getEspecialidad(),
				},
			});
			return this.toDomain(record);
		}

		const record = await prisma.veterinario.update({
			where: { id: veterinario.getId() },
			data: {
				nombre: veterinario.getNombre(),
				telefono: veterinario.getTelefono(),
				cedulaProfesional: veterinario.getCedulaProfesional(),
				especialidad: veterinario.getEspecialidad(),
			},
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.veterinario.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

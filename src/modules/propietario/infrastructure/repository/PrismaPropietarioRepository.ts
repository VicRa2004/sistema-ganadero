import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Propietario } from "../../domain/Propietario";
import type { PropietarioFilters } from "../../domain/repository/PropietarioFilters";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";

interface PrismaPropietarioRecord {
	id: number;
	nombre: string;
	telefono: string | null;
	correo: string | null;
	deletedAt: Date | null;
}

@injectable()
export class PrismaPropietarioRepository implements PropietarioRepository {
	private toDomain(record: PrismaPropietarioRecord): Propietario {
		return Propietario.reconstitute(
			record.id,
			record.nombre,
			record.telefono,
			record.correo,
		);
	}

	public async findById(id: number): Promise<Propietario | null> {
		const record = await prisma.propietario.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findByEmail(correo: string): Promise<Propietario | null> {
		const record = await prisma.propietario.findFirst({
			where: {
				correo: { equals: correo, mode: "insensitive" },
				deletedAt: null,
			},
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(
		filters: PropietarioFilters,
	): Promise<Pagination<Propietario>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.PropietarioWhereInput = { deletedAt: null };

		if (filters.nombre && filters.nombre.trim() !== "") {
			whereClause.nombre = {
				contains: filters.nombre,
				mode: "insensitive",
			};
		}

		const [records, totalItems] = await Promise.all([
			prisma.propietario.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.propietario.count({
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

	public async save(propietario: Propietario): Promise<Propietario> {
		if (propietario.esNuevo()) {
			const record = await prisma.propietario.create({
				data: {
					nombre: propietario.getNombre(),
					telefono: propietario.getTelefono(),
					correo: propietario.getCorreo(),
				},
			});
			return this.toDomain(record);
		}

		const record = await prisma.propietario.update({
			where: { id: propietario.getId() },
			data: {
				nombre: propietario.getNombre(),
				telefono: propietario.getTelefono(),
				correo: propietario.getCorreo(),
			},
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.propietario.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

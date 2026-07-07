import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { Raza } from "../../domain/Raza";
import type { RazaRepository } from "../../domain/repository/RazaRepository";

interface PrismaRazaRecord {
	id: number;
	nombre: string;
	descripcion: string | null;
	deletedAt: Date | null;
}

@injectable()
export class PrismaRazaRepository implements RazaRepository {
	private toDomain(record: PrismaRazaRecord): Raza {
		return Raza.reconstitute(record.id, record.nombre, record.descripcion);
	}

	public async findById(id: number): Promise<Raza | null> {
		const record = await prisma.raza.findFirst({
			where: { id, deletedAt: null },
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findByName(nombre: string): Promise<Raza | null> {
		const record = await prisma.raza.findFirst({
			where: {
				nombre: { equals: nombre, mode: "insensitive" },
				deletedAt: null,
			},
		});
		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(): Promise<Raza[]> {
		const records = await prisma.raza.findMany({
			where: { deletedAt: null },
			orderBy: { id: "asc" },
		});
		return records.map((record) => this.toDomain(record));
	}

	public async save(raza: Raza): Promise<Raza> {
		if (raza.esNuevo()) {
			const record = await prisma.raza.create({
				data: {
					nombre: raza.getNombre(),
					descripcion: raza.getDescripcion(),
				},
			});
			return this.toDomain(record);
		}

		const record = await prisma.raza.update({
			where: { id: raza.getId() },
			data: {
				nombre: raza.getNombre(),
				descripcion: raza.getDescripcion(),
			},
		});
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.raza.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Ganado } from "../../domain/Ganado";
import type { SexoGanado } from "../../domain/Ganado";
import type { GanadoFilters } from "../../domain/repository/GanadoFilters";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";

interface PrismaGanadoRecord {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: SexoGanado;
	razaId: number;
	ranchoId: number;
	propietarioId: number;
	deletedAt: Date | null;
}

@injectable()
export class PrismaGanadoRepository implements GanadoRepository {
	private toDomain(record: PrismaGanadoRecord): Ganado {
		return Ganado.reconstitute(
			record.id,
			record.identificador,
			record.peso,
			record.edadEnMeses,
			record.sexo,
			record.razaId,
			record.ranchoId,
			record.propietarioId,
		);
	}

	public async findById(id: number): Promise<Ganado | null> {
		const record = (await prisma.ganado.findFirst({
			where: { id, deletedAt: null },
		})) as PrismaGanadoRecord | null;

		if (!record) return null;
		return this.toDomain(record);
	}

	public async findByIdentificador(
		identificador: string,
	): Promise<Ganado | null> {
		const record = (await prisma.ganado.findFirst({
			where: { identificador, deletedAt: null },
		})) as PrismaGanadoRecord | null;

		if (!record) return null;
		return this.toDomain(record);
	}

	public async findAll(filters: GanadoFilters): Promise<Pagination<Ganado>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.GanadoWhereInput = { deletedAt: null };

		if (filters.identificador && filters.identificador.trim() !== "") {
			whereClause.identificador = {
				contains: filters.identificador,
				mode: "insensitive",
			};
		}

		if (filters.ranchoId !== undefined && filters.ranchoId > 0) {
			whereClause.ranchoId = filters.ranchoId;
		}

		if (filters.razaId !== undefined && filters.razaId > 0) {
			whereClause.razaId = filters.razaId;
		}

		if (filters.propietarioId !== undefined && filters.propietarioId > 0) {
			whereClause.propietarioId = filters.propietarioId;
		}

		const [records, totalItems] = await Promise.all([
			prisma.ganado.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { id: "asc" },
			}),
			prisma.ganado.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: (records as PrismaGanadoRecord[]).map((record) =>
				this.toDomain(record),
			),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async save(ganado: Ganado): Promise<Ganado> {
		if (ganado.esNuevo()) {
			const record = (await prisma.ganado.create({
				data: {
					identificador: ganado.getIdentificador(),
					peso: ganado.getPeso(),
					edadEnMeses: ganado.getEdadEnMeses(),
					sexo: ganado.getSexo(),
					razaId: ganado.getRazaId(),
					ranchoId: ganado.getRanchoId(),
					propietarioId: ganado.getPropietarioId(),
				},
			})) as PrismaGanadoRecord;
			return this.toDomain(record);
		}

		const record = (await prisma.ganado.update({
			where: { id: ganado.getId() },
			data: {
				identificador: ganado.getIdentificador(),
				peso: ganado.getPeso(),
				edadEnMeses: ganado.getEdadEnMeses(),
				sexo: ganado.getSexo(),
				razaId: ganado.getRazaId(),
				ranchoId: ganado.getRanchoId(),
				propietarioId: ganado.getPropietarioId(),
			},
		})) as PrismaGanadoRecord;
		return this.toDomain(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.ganado.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

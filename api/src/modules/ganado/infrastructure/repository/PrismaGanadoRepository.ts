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
	fechaNacimiento: Date;
	sexo: SexoGanado;
	imagenGanado: string | null;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	padreId: number | null;
	madreId: number | null;
	fechaBaja: Date | null;
	motivoBajaId: number | null;
	deletedAt: Date | null;
}

@injectable()
export class PrismaGanadoRepository implements GanadoRepository {
	private toDomain(record: PrismaGanadoRecord): Ganado {
		return Ganado.reconstitute(
			record.id,
			record.identificador,
			record.peso,
			record.fechaNacimiento,
			record.sexo,
			record.imagenGanado,
			record.razaId,
			record.terrenoId,
			record.propietarioId,
			record.padreId,
			record.madreId,
			record.fechaBaja,
			record.motivoBajaId,
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

		// Por defecto excluir dados de baja (soloActivos = true si no se especifica)
		const soloActivos = filters.soloActivos !== false;
		if (soloActivos) {
			whereClause.fechaBaja = null;
		}

		if (filters.identificador && filters.identificador.trim() !== "") {
			whereClause.identificador = {
				contains: filters.identificador,
				mode: "insensitive",
			};
		}

		if (filters.terrenoId !== undefined && filters.terrenoId > 0) {
			whereClause.terrenoId = filters.terrenoId;
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
		const data = {
			identificador: ganado.getIdentificador(),
			peso: ganado.getPeso(),
			fechaNacimiento: ganado.getFechaNacimiento(),
			sexo: ganado.getSexo(),
			imagenGanado: ganado.getImagenGanado(),
			razaId: ganado.getRazaId(),
			terrenoId: ganado.getTerrenoId(),
			propietarioId: ganado.getPropietarioId(),
			padreId: ganado.getPadreId(),
			madreId: ganado.getMadreId(),
			fechaBaja: ganado.getFechaBaja(),
			motivoBajaId: ganado.getMotivoBajaId(),
		};

		if (ganado.esNuevo()) {
			const record = (await prisma.ganado.create({
				data,
			})) as PrismaGanadoRecord;
			return this.toDomain(record);
		}

		const record = (await prisma.ganado.update({
			where: { id: ganado.getId() },
			data,
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

import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/prisma/client";
import { db, runInTransaction } from "@/core/config/transaction";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { Ganado } from "../../domain/Ganado";
import type { SexoGanado } from "../../domain/Ganado";
import type { NuevoPesaje, Pesaje } from "../../domain/Pesaje";
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

		if (filters.sexo) {
			whereClause.sexo = filters.sexo;
		}

		// El ganado pertenece al usuario dueño de su terreno
		if (filters.usuarioId !== undefined) {
			whereClause.terreno = { usuarioId: filters.usuarioId };
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
			// El peso inicial es el primer pesaje del historial
			const record = (await prisma.ganado.create({
				data: {
					...data,
					pesajes: {
						create: { peso: data.peso, fecha: new Date() },
					},
				},
			})) as PrismaGanadoRecord;
			return this.toDomain(record);
		}

		// El peso no se escribe aquí: lo gobierna el historial (registrarPesaje),
		// así una edición con datos viejos no pisa el último pesaje.
		const { peso: _peso, ...dataSinPeso } = data;
		const record = (await prisma.ganado.update({
			where: { id: ganado.getId() },
			data: dataSinPeso,
		})) as PrismaGanadoRecord;
		return this.toDomain(record);
	}

	public async registrarPesaje(
		ganadoId: number,
		pesaje: NuevoPesaje,
	): Promise<Ganado> {
		const record = await runInTransaction(async () => {
			await db().pesaje.create({ data: { ganadoId, ...pesaje } });
			const ultimo = await db().pesaje.findFirstOrThrow({
				where: { ganadoId },
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
			});
			return db().ganado.update({
				where: { id: ganadoId },
				data: { peso: ultimo.peso },
			});
		});
		return this.toDomain(record as PrismaGanadoRecord);
	}

	public async findPesajes(ganadoId: number): Promise<Pesaje[]> {
		return prisma.pesaje.findMany({
			where: { ganadoId },
			orderBy: [{ fecha: "asc" }, { id: "asc" }],
			select: {
				id: true,
				ganadoId: true,
				peso: true,
				fecha: true,
				observaciones: true,
			},
		});
	}

	public async delete(id: number): Promise<void> {
		await prisma.ganado.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

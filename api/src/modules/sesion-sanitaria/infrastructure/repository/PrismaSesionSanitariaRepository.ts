import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { SesionSanitaria } from "../../domain/SesionSanitaria";
import type { SesionSanitariaFilters } from "../../domain/repository/SesionSanitariaFilters";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";

@injectable()
export class PrismaSesionSanitariaRepository
	implements SesionSanitariaRepository
{
	private toDomainAplicacion(record: {
		id: number;
		sesionId: number;
		ganadoId: number;
		dosisAplicada: number;
		observaciones: string | null;
	}): AplicacionSanitaria {
		return AplicacionSanitaria.create(
			record.ganadoId,
			record.dosisAplicada,
			record.observaciones,
			record.id,
			record.sesionId,
		);
	}

	private toDomainSesion(record: {
		id: number;
		fecha: Date;
		veterinarioId: number;
		descripcion: string;
		insumoId: number;
		aplicaciones?: Array<{
			id: number;
			sesionId: number;
			ganadoId: number;
			dosisAplicada: number;
			observaciones: string | null;
		}>;
	}): SesionSanitaria {
		const aplicacionesDomain = (record.aplicaciones ?? []).map((app) =>
			this.toDomainAplicacion(app),
		);

		return SesionSanitaria.create(
			record.fecha,
			record.veterinarioId,
			record.descripcion,
			record.insumoId,
			aplicacionesDomain,
			record.id,
		);
	}

	public async findById(id: number): Promise<SesionSanitaria | null> {
		const record = await prisma.sesionSanitaria.findFirst({
			where: { id, deletedAt: null },
			include: {
				aplicaciones: {
					where: { deletedAt: null },
				},
			},
		});

		if (!record) return null;
		return this.toDomainSesion(record);
	}

	public async find(
		filters: SesionSanitariaFilters,
	): Promise<Pagination<SesionSanitaria>> {
		const skip = (filters.page - 1) * filters.limit;
		const whereClause: Prisma.SesionSanitariaWhereInput = {
			deletedAt: null,
		};

		if (filters.veterinarioId) {
			whereClause.veterinarioId = filters.veterinarioId;
		}

		if (filters.insumoId) {
			whereClause.insumoId = filters.insumoId;
		}

		if (filters.fechaInicio || filters.fechaFin) {
			whereClause.fecha = {};
			if (filters.fechaInicio) {
				whereClause.fecha.gte = filters.fechaInicio;
			}
			if (filters.fechaFin) {
				whereClause.fecha.lte = filters.fechaFin;
			}
		}

		if (filters.busqueda && filters.busqueda.trim() !== "") {
			whereClause.descripcion = {
				contains: filters.busqueda,
				mode: "insensitive",
			};
		}

		const [records, totalItems] = await Promise.all([
			prisma.sesionSanitaria.findMany({
				where: whereClause,
				skip,
				take: filters.limit,
				orderBy: { fecha: "desc" },
				include: {
					aplicaciones: {
						where: { deletedAt: null },
					},
				},
			}),
			prisma.sesionSanitaria.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			data: records.map((rec) => this.toDomainSesion(rec)),
			page: filters.page,
			totalItems,
			totalPages,
		};
	}

	public async save(sesion: SesionSanitaria): Promise<SesionSanitaria> {
		const id = sesion.getId();

		if (!id) {
			// Crear nueva sesión con sus aplicaciones
			const record = await prisma.sesionSanitaria.create({
				data: {
					fecha: sesion.getFecha(),
					veterinarioId: sesion.getVeterinarioId(),
					descripcion: sesion.getDescripcion(),
					insumoId: sesion.getInsumoId(),
					aplicaciones: {
						create: sesion.getAplicaciones().map((app) => ({
							ganadoId: app.getGanadoId(),
							dosisAplicada: app.getDosisAplicada(),
							observaciones: app.getObservaciones(),
						})),
					},
				},
				include: {
					aplicaciones: {
						where: { deletedAt: null },
					},
				},
			});

			return this.toDomainSesion(record);
		}

		// Actualizar sesión existente
		const record = await prisma.sesionSanitaria.update({
			where: { id },
			data: {
				fecha: sesion.getFecha(),
				veterinarioId: sesion.getVeterinarioId(),
				descripcion: sesion.getDescripcion(),
				insumoId: sesion.getInsumoId(),
			},
			include: {
				aplicaciones: {
					where: { deletedAt: null },
				},
			},
		});

		return this.toDomainSesion(record);
	}

	public async delete(id: number): Promise<void> {
		await prisma.$transaction([
			prisma.aplicacionSanitaria.updateMany({
				where: { sesionId: id, deletedAt: null },
				data: { deletedAt: new Date() },
			}),
			prisma.sesionSanitaria.update({
				where: { id },
				data: { deletedAt: new Date() },
			}),
		]);
	}

	public async findAplicacionesByGanadoId(
		ganadoId: number,
	): Promise<AplicacionSanitaria[]> {
		const records = await prisma.aplicacionSanitaria.findMany({
			where: {
				ganadoId,
				deletedAt: null,
				sesion: {
					deletedAt: null,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return records.map((r) => this.toDomainAplicacion(r));
	}

	public async addAplicacion(
		sesionId: number,
		aplicacion: AplicacionSanitaria,
	): Promise<AplicacionSanitaria> {
		const record = await prisma.aplicacionSanitaria.upsert({
			where: {
				sesionId_ganadoId: {
					sesionId,
					ganadoId: aplicacion.getGanadoId(),
				},
			},
			update: {
				dosisAplicada: aplicacion.getDosisAplicada(),
				observaciones: aplicacion.getObservaciones(),
				deletedAt: null,
			},
			create: {
				sesionId,
				ganadoId: aplicacion.getGanadoId(),
				dosisAplicada: aplicacion.getDosisAplicada(),
				observaciones: aplicacion.getObservaciones(),
			},
		});

		return this.toDomainAplicacion(record);
	}
}

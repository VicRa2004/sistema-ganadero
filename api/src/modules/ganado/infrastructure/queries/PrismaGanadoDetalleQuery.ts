import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type {
	GanadoDetalleQuery,
	RetiroVigenteInfo,
} from "../../application/queries/GanadoDetalleQuery";
import type { GanadoDetalleOutputDto } from "../../application/dtos/GanadoDto";

interface PrismaGanadoDetalleRecord {
	id: number;
	identificador: string;
	peso: number;
	fechaNacimiento: Date;
	sexo: "MACHO" | "HEMBRA";
	imagenGanado: string | null;
	fechaBaja: Date | null;
	raza: { id: number; nombre: string };
	terreno: { id: number; nombre: string; ubicacion: string };
	propietario: { id: number; nombre: string };
	padre: { id: number; identificador: string } | null;
	madre: { id: number; identificador: string } | null;
	motivoBaja: { id: number; nombre: string } | null;
}

@injectable()
export class PrismaGanadoDetalleQuery implements GanadoDetalleQuery {
	private readonly includeRelaciones = {
		raza: true,
		terreno: true,
		propietario: true,
		padre: { select: { id: true, identificador: true } },
		madre: { select: { id: true, identificador: true } },
		motivoBaja: { select: { id: true, nombre: true } },
	} as const;

	private formatRecord(
		record: PrismaGanadoDetalleRecord,
		retiro: RetiroVigenteInfo,
	): GanadoDetalleOutputDto {
		return {
			id: record.id,
			identificador: record.identificador,
			peso: record.peso,
			fechaNacimiento: record.fechaNacimiento.toISOString().split("T")[0] ?? "",
			sexo: record.sexo,
			imagenGanado: record.imagenGanado,
			raza: { id: record.raza.id, nombre: record.raza.nombre },
			terreno: {
				id: record.terreno.id,
				nombre: record.terreno.nombre,
				ubicacion: record.terreno.ubicacion,
			},
			propietario: {
				id: record.propietario.id,
				nombre: record.propietario.nombre,
			},
			padre: record.padre
				? { id: record.padre.id, identificador: record.padre.identificador }
				: null,
			madre: record.madre
				? { id: record.madre.id, identificador: record.madre.identificador }
				: null,
			fechaBaja: record.fechaBaja?.toISOString() ?? null,
			motivoBaja: record.motivoBaja
				? { id: record.motivoBaja.id, nombre: record.motivoBaja.nombre }
				: null,
			enPeriodoRetiro: retiro.vigente,
			retiroHasta: retiro.hasta
				? (retiro.hasta.toISOString().split("T")[0] ?? null)
				: null,
			retiroMotivo: retiro.motivo,
		};
	}

	public async obtenerRetiroVigente(
		ganadoId: number,
		fechaReferencia = new Date(),
	): Promise<RetiroVigenteInfo> {
		const [aplicaciones, tratamientos] = await Promise.all([
			prisma.aplicacionSanitaria.findMany({
				where: {
					ganadoId,
					sesion: {
						deletedAt: null,
						estado: "REALIZADA",
						insumo: { periodoRetiroDias: { gt: 0 } },
					},
				},
				include: {
					sesion: {
						select: {
							fecha: true,
							insumo: { select: { nombre: true, periodoRetiroDias: true } },
						},
					},
				},
			}),
			prisma.tratamientoMedico.findMany({
				where: {
					ganadoId,
					insumo: { periodoRetiroDias: { gt: 0 } },
				},
				include: {
					insumo: { select: { nombre: true, periodoRetiroDias: true } },
				},
			}),
		]);

		let maxHasta: Date | null = null;
		let motivo: string | null = null;

		for (const app of aplicaciones) {
			const dias = app.sesion.insumo.periodoRetiroDias;
			const fin = new Date(app.sesion.fecha);
			fin.setDate(fin.getDate() + dias);
			if (fin > fechaReferencia && (!maxHasta || fin > maxHasta)) {
				maxHasta = fin;
				motivo = `${app.sesion.insumo.nombre} (${dias} días de retiro)`;
			}
		}

		for (const trt of tratamientos) {
			const dias = trt.insumo.periodoRetiroDias;
			const base =
				trt.activo && fechaReferencia > trt.fechaFin
					? fechaReferencia
					: trt.fechaFin;
			const fin = new Date(base);
			fin.setDate(fin.getDate() + dias);
			if (fin > fechaReferencia && (!maxHasta || fin > maxHasta)) {
				maxHasta = fin;
				motivo = `${trt.insumo.nombre} (${dias} días de retiro)`;
			}
		}

		return {
			vigente: maxHasta !== null,
			hasta: maxHasta,
			motivo,
		};
	}

	public async obtenerFichaPorId(
		id: number,
		usuarioId?: number,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: {
				id,
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
			},
			include: this.includeRelaciones,
		});

		if (!record) return null;
		const retiro = await this.obtenerRetiroVigente(record.id);
		return this.formatRecord(
			record as unknown as PrismaGanadoDetalleRecord,
			retiro,
		);
	}

	public async obtenerFichaPorIdentificador(
		identificador: string,
		usuarioId?: number,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: {
				identificador,
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
			},
			include: this.includeRelaciones,
		});

		if (!record) return null;
		const retiro = await this.obtenerRetiroVigente(record.id);
		return this.formatRecord(
			record as unknown as PrismaGanadoDetalleRecord,
			retiro,
		);
	}
}

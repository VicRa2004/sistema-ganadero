import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { GanadoDetalleQuery } from "../../application/queries/GanadoDetalleQuery";
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
		};
	}

	public async obtenerFichaPorId(
		id: number,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: { id, deletedAt: null },
			include: this.includeRelaciones,
		});

		if (!record) return null;
		return this.formatRecord(record as unknown as PrismaGanadoDetalleRecord);
	}

	public async obtenerFichaPorIdentificador(
		identificador: string,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: { identificador, deletedAt: null },
			include: this.includeRelaciones,
		});

		if (!record) return null;
		return this.formatRecord(record as unknown as PrismaGanadoDetalleRecord);
	}
}

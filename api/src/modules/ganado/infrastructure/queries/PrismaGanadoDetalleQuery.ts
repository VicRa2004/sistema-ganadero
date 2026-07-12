import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { GanadoDetalleQuery } from "../../application/queries/GanadoDetalleQuery";
import type { GanadoDetalleOutputDto } from "../../application/dtos/GanadoDto";

interface PrismaGanadoDetalleRecord {
	id: number;
	identificador: string;
	peso: number;
	edadEnMeses: number;
	sexo: "MACHO" | "HEMBRA";
	raza: {
		id: number;
		nombre: string;
	};
	terreno: {
		id: number;
		nombre: string;
		ubicacion: string;
	};
	propietario: {
		id: number;
		nombre: string;
	};
}

@injectable()
export class PrismaGanadoDetalleQuery implements GanadoDetalleQuery {
	private formatRecord(
		record: PrismaGanadoDetalleRecord,
	): GanadoDetalleOutputDto {
		return {
			id: record.id,
			identificador: record.identificador,
			peso: record.peso,
			edadEnMeses: record.edadEnMeses,
			sexo: record.sexo,
			raza: {
				id: record.raza.id,
				nombre: record.raza.nombre,
			},
			terreno: {
				id: record.terreno.id,
				nombre: record.terreno.nombre,
				ubicacion: record.terreno.ubicacion,
			},
			propietario: {
				id: record.propietario.id,
				nombre: record.propietario.nombre,
			},
		};
	}

	public async obtenerFichaPorId(
		id: number,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: { id, deletedAt: null },
			include: {
				raza: true,
				terreno: true,
				propietario: true,
			},
		});

		if (!record) return null;
		return this.formatRecord(record);
	}

	public async obtenerFichaPorIdentificador(
		identificador: string,
	): Promise<GanadoDetalleOutputDto | null> {
		const record = await prisma.ganado.findFirst({
			where: { identificador, deletedAt: null },
			include: {
				raza: true,
				terreno: true,
				propietario: true,
			},
		});

		if (!record) return null;
		return this.formatRecord(record);
	}
}

import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { PropietarioDetalleOutputDto } from "../../application/dtos/PropietarioDto";
import type { PropietarioDetalleQuery } from "../../application/queries/PropietarioDetalleQuery";

@injectable()
export class PrismaPropietarioDetalleQuery implements PropietarioDetalleQuery {
	public async obtenerDetalle(
		id: number,
	): Promise<PropietarioDetalleOutputDto | null> {
		const record = await prisma.propietario.findFirst({
			where: { id, deletedAt: null },
			include: {
				ganados: {
					where: { deletedAt: null },
					include: {
						terreno: true,
					},
				},
			},
		});

		if (!record) return null;

		// Mapear los ganados
		const ganados = record.ganados.map((g) => ({
			id: g.id,
			identificador: g.identificador,
			peso: g.peso,
			sexo: g.sexo,
		}));

		// Obtener terrenos únicos asociados a través del ganado
		const terrenosMap = new Map<
			number,
			{ id: number; nombre: string; ubicacion: string }
		>();
		for (const g of record.ganados) {
			if (g.terreno && !g.terreno.deletedAt) {
				terrenosMap.set(g.terreno.id, {
					id: g.terreno.id,
					nombre: g.terreno.nombre,
					ubicacion: g.terreno.ubicacion,
				});
			}
		}
		const terrenos = Array.from(terrenosMap.values());

		return {
			id: record.id,
			nombre: record.nombre,
			telefono: record.telefono,
			correo: record.correo,
			imagenMarca: record.imagenMarca,
			cantidadGanado: ganados.length,
			cantidadTerrenos: terrenos.length,
			ganados,
			terrenos,
		};
	}
}

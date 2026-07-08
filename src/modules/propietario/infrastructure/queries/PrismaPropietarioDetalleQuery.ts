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
						rancho: true,
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

		// Obtener ranchos únicos asociados a través del ganado
		const ranchosMap = new Map<
			number,
			{ id: number; nombre: string; ubicacion: string }
		>();
		for (const g of record.ganados) {
			if (g.rancho && !g.rancho.deletedAt) {
				ranchosMap.set(g.rancho.id, {
					id: g.rancho.id,
					nombre: g.rancho.nombre,
					ubicacion: g.rancho.ubicacion,
				});
			}
		}
		const ranchos = Array.from(ranchosMap.values());

		return {
			id: record.id,
			nombre: record.nombre,
			telefono: record.telefono,
			correo: record.correo,
			cantidadGanado: ganados.length,
			cantidadRanchos: ranchos.length,
			ganados,
			ranchos,
		};
	}
}

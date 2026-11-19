import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { AutonomiaAlimentoDto } from "../../application/dtos/AlimentacionDto";
import type { AutonomiaAlimentoQuery } from "../../application/queries/AutonomiaAlimentoQuery";

@injectable()
export class PrismaAutonomiaAlimentoQuery implements AutonomiaAlimentoQuery {
	public async obtenerAutonomia(
		actor?: Actor,
	): Promise<AutonomiaAlimentoDto[]> {
		const usuarioId = actor ? usuarioIdDeFiltro(actor) : undefined;

		const raciones = await prisma.racionAlimentacion.findMany({
			where: {
				activo: true,
				insumo: { deletedAt: null, tipo: "ALIMENTO" },
				...(usuarioId !== undefined && { usuarioId }),
			},
			include: {
				insumo: {
					select: {
						id: true,
						nombre: true,
						unidadMedida: true,
						stock: true,
						usuarioId: true,
					},
				},
			},
		});

		const loteIds = [
			...new Set(
				raciones.map((r) => r.loteId).filter((v): v is number => v !== null),
			),
		];
		const terrenoIds = [
			...new Set(
				raciones
					.filter((r) => r.loteId === null && r.terrenoId !== null)
					.map((r) => r.terrenoId as number),
			),
		];

		const [loteCounts, terrenoCounts] = await Promise.all([
			loteIds.length > 0
				? prisma.loteGanado.groupBy({
						by: ["loteId"],
						where: {
							loteId: { in: loteIds },
							lote: { deletedAt: null },
							ganado: { deletedAt: null, fechaBaja: null },
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
			terrenoIds.length > 0
				? prisma.ganado.groupBy({
						by: ["terrenoId"],
						where: {
							terrenoId: { in: terrenoIds },
							fechaBaja: null,
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
		]);

		const animalesPorLote = new Map<number, number>(
			loteCounts.map((c) => [c.loteId, c._count._all]),
		);
		const animalesPorTerreno = new Map<number, number>(
			terrenoCounts.map((c) => [c.terrenoId, c._count._all]),
		);

		const mapa = new Map<
			number,
			{
				insumoId: number;
				insumoNombre: string;
				unidadMedida: string;
				stock: number;
				consumoDiarioEsperado: number;
				umbralAlertaDias: number;
				racionesActivas: number;
				usuarioId: number;
			}
		>();

		for (const r of raciones) {
			const animales = r.loteId
				? (animalesPorLote.get(r.loteId) ?? 0)
				: r.terrenoId
					? (animalesPorTerreno.get(r.terrenoId) ?? 0)
					: 0;

			const consumo = r.cantidadDiariaPorAnimal.toNumber() * animales;
			const actual = mapa.get(r.insumoId);
			if (!actual) {
				mapa.set(r.insumoId, {
					insumoId: r.insumo.id,
					insumoNombre: r.insumo.nombre,
					unidadMedida: r.insumo.unidadMedida,
					stock: r.insumo.stock.toNumber(),
					consumoDiarioEsperado: consumo,
					umbralAlertaDias: r.diasAlertaAutonomia,
					racionesActivas: 1,
					usuarioId: r.insumo.usuarioId,
				});
			} else {
				actual.consumoDiarioEsperado += consumo;
				actual.umbralAlertaDias = Math.max(
					actual.umbralAlertaDias,
					r.diasAlertaAutonomia,
				);
				actual.racionesActivas += 1;
			}
		}

		return Array.from(mapa.values()).map((item) => {
			const consumo = Number(item.consumoDiarioEsperado.toFixed(3));
			const diasAutonomia =
				consumo > 0 ? Number((item.stock / consumo).toFixed(1)) : null;
			return {
				insumoId: item.insumoId,
				insumoNombre: item.insumoNombre,
				unidadMedida: item.unidadMedida,
				stock: item.stock,
				consumoDiarioEsperado: consumo,
				diasAutonomia,
				umbralAlertaDias: item.umbralAlertaDias,
				enAlerta:
					diasAutonomia !== null && diasAutonomia <= item.umbralAlertaDias,
				racionesActivas: item.racionesActivas,
				usuarioId: item.usuarioId,
			};
		});
	}
}

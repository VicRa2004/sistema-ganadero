import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Prisma } from "@/generated/prisma/client";
import type {
	IndicadoresReproductivosOutputDto,
	ProximoPartoDto,
} from "../../application/dtos/ReproduccionDto";
import type {
	IndicadoresReproductivosFilters,
	IndicadoresReproductivosQuery,
} from "../../application/queries/IndicadoresReproductivosQuery";

const MS_POR_DIA = 86_400_000;

@injectable()
export class PrismaIndicadoresReproductivosQuery
	implements IndicadoresReproductivosQuery
{
	public async obtenerIndicadores(
		filters: IndicadoresReproductivosFilters,
	): Promise<IndicadoresReproductivosOutputDto> {
		const usuarioId = usuarioIdDeFiltro(filters.actor);
		const whereBase: Prisma.EventoReproductivoWhereInput = {
			...(usuarioId !== undefined && {
				hembra: { deletedAt: null, terreno: { deletedAt: null, usuarioId } },
			}),
			...((filters.desde !== undefined || filters.hasta !== undefined) && {
				fecha: {
					...(filters.desde !== undefined && { gte: filters.desde }),
					...(filters.hasta !== undefined && { lte: filters.hasta }),
				},
			}),
		};

		const eventosPeriodo = await prisma.eventoReproductivo.findMany({
			where: whereBase,
			select: {
				tipo: true,
				resultado: true,
			},
		});

		let montasEInseminaciones = 0;
		let diagnosticosPositivos = 0;
		let diagnosticosNegativos = 0;
		let partosEnPeriodo = 0;
		let abortosEnPeriodo = 0;

		for (const ev of eventosPeriodo) {
			if (ev.tipo === "MONTA" || ev.tipo === "INSEMINACION") {
				montasEInseminaciones++;
			} else if (ev.tipo === "DIAGNOSTICO_GESTACION") {
				if (ev.resultado === "POSITIVO") diagnosticosPositivos++;
				else if (ev.resultado === "NEGATIVO") diagnosticosNegativos++;
			} else if (ev.tipo === "PARTO") {
				partosEnPeriodo++;
			} else if (ev.tipo === "ABORTO") {
				abortosEnPeriodo++;
			}
		}

		const totalDiagnosticos = diagnosticosPositivos + diagnosticosNegativos;
		const tasaPrenez =
			totalDiagnosticos > 0
				? Number(((diagnosticosPositivos / totalDiagnosticos) * 100).toFixed(1))
				: null;

		const wherePropiedad: Prisma.EventoReproductivoWhereInput =
			usuarioId !== undefined
				? {
						hembra: {
							deletedAt: null,
							terreno: { deletedAt: null, usuarioId },
						},
					}
				: {};

		// Intervalo entre partos promedio (en días) calculado sobre todos los partos de cada hembra
		const todosPartos = await prisma.eventoReproductivo.findMany({
			where: {
				...wherePropiedad,
				tipo: "PARTO",
			},
			select: { hembraId: true, fecha: true },
			orderBy: [{ hembraId: "asc" }, { fecha: "asc" }],
		});

		const fechasPorHembra = new Map<number, Date[]>();
		for (const p of todosPartos) {
			const arr = fechasPorHembra.get(p.hembraId) ?? [];
			arr.push(p.fecha);
			fechasPorHembra.set(p.hembraId, arr);
		}

		const intervalos: number[] = [];
		for (const fechas of fechasPorHembra.values()) {
			for (let i = 1; i < fechas.length; i++) {
				const anterior = fechas[i - 1];
				const actual = fechas[i];
				if (anterior && actual) {
					intervalos.push((actual.getTime() - anterior.getTime()) / MS_POR_DIA);
				}
			}
		}

		const intervaloEntrePartosDias =
			intervalos.length > 0
				? Number(
						(
							intervalos.reduce((acc, v) => acc + v, 0) / intervalos.length
						).toFixed(1),
					)
				: null;

		// Próximos partos estimados: eventos activos con fechaProbableParto y sin parto/aborto posterior
		const ahora = new Date();
		const candidatos = await prisma.eventoReproductivo.findMany({
			where: {
				...wherePropiedad,
				fechaProbableParto: { not: null },
				OR: [
					{ tipo: { in: ["MONTA", "INSEMINACION"] } },
					{ tipo: "DIAGNOSTICO_GESTACION", resultado: "POSITIVO" },
				],
				hembra: {
					deletedAt: null,
					fechaBaja: null,
					...(usuarioId !== undefined && {
						terreno: { deletedAt: null, usuarioId },
					}),
				},
			},
			include: {
				hembra: { select: { identificador: true } },
				macho: { select: { identificador: true } },
			},
			orderBy: [{ fecha: "desc" }, { id: "desc" }],
		});

		const cierres = await prisma.eventoReproductivo.findMany({
			where: {
				...wherePropiedad,
				tipo: { in: ["PARTO", "ABORTO"] },
			},
			select: { hembraId: true, fecha: true },
		});
		const ultimoCierrePorHembra = new Map<number, Date>();
		for (const c of cierres) {
			const prev = ultimoCierrePorHembra.get(c.hembraId);
			if (!prev || c.fecha > prev) {
				ultimoCierrePorHembra.set(c.hembraId, c.fecha);
			}
		}

		const vistosHembra = new Set<number>();
		const proximosPartos: ProximoPartoDto[] = [];
		for (const ev of candidatos) {
			if (vistosHembra.has(ev.hembraId) || !ev.fechaProbableParto) continue;
			const cierre = ultimoCierrePorHembra.get(ev.hembraId);
			if (cierre && cierre >= ev.fecha) {
				vistosHembra.add(ev.hembraId);
				continue;
			}
			// Solo considerar gestaciones vigentes (hasta 30 días de atraso o futuras)
			const diasRestantes = Math.ceil(
				(ev.fechaProbableParto.getTime() - ahora.getTime()) / MS_POR_DIA,
			);
			if (diasRestantes < -30) continue;

			vistosHembra.add(ev.hembraId);
			proximosPartos.push({
				eventoId: ev.id,
				hembraId: ev.hembraId,
				hembraIdentificador: ev.hembra.identificador,
				machoId: ev.machoId,
				machoIdentificador: ev.macho?.identificador ?? null,
				fechaProbableParto:
					ev.fechaProbableParto.toISOString().split("T")[0] ?? "",
				diasRestantes,
			});
		}

		proximosPartos.sort((a, b) => a.diasRestantes - b.diasRestantes);

		return {
			totalEventos: eventosPeriodo.length,
			montasEInseminaciones,
			diagnosticosPositivos,
			diagnosticosNegativos,
			partosEnPeriodo,
			abortosEnPeriodo,
			tasaPrenez,
			intervaloEntrePartosDias,
			proximosPartos,
		};
	}
}

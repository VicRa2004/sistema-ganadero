import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { CalendarioEventoDto } from "../../application/dtos/CalendarioSanitarioDto";
import type {
	CalendarioSanitarioFilters,
	CalendarioSanitarioQuery,
} from "../../application/queries/CalendarioSanitarioQuery";

@injectable()
export class PrismaCalendarioSanitarioQuery
	implements CalendarioSanitarioQuery
{
	public async obtenerEventos(
		filters: CalendarioSanitarioFilters,
	): Promise<CalendarioEventoDto[]> {
		const { desde, hasta, actor, terrenoId, ganadoId } = filters;
		const usuarioId = usuarioIdDeFiltro(actor);

		const [sesiones, tratamientos, insumos] = await Promise.all([
			prisma.sesionSanitaria.findMany({
				where: {
					fecha: { gte: desde, lte: hasta },
					...(usuarioId !== undefined && { veterinario: { usuarioId } }),
					...((terrenoId !== undefined || ganadoId !== undefined) && {
						aplicaciones: {
							some: {
								deletedAt: null,
								...(ganadoId !== undefined && { ganadoId }),
								...(terrenoId !== undefined && { ganado: { terrenoId } }),
							},
						},
					}),
				},
				include: {
					veterinario: { select: { nombre: true } },
					insumo: { select: { nombre: true } },
					aplicaciones: {
						where: { deletedAt: null },
						select: { ganadoId: true },
					},
				},
				orderBy: { fecha: "asc" },
			}),
			prisma.tratamientoMedico.findMany({
				where: {
					fechaFin: { gte: desde },
					fechaInicio: { lte: hasta },
					...(ganadoId !== undefined && { ganadoId }),
					ganado: {
						deletedAt: null,
						...(terrenoId !== undefined && { terrenoId }),
						...(usuarioId !== undefined && { terreno: { usuarioId } }),
					},
				},
				include: {
					ganado: { select: { identificador: true, terrenoId: true } },
					insumo: { select: { nombre: true } },
				},
				orderBy: { fechaFin: "asc" },
			}),
			terrenoId === undefined && ganadoId === undefined
				? prisma.insumo.findMany({
						where: {
							fechaCaducidad: { gte: desde, lte: hasta },
							...(usuarioId !== undefined && { usuarioId }),
						},
						orderBy: { fechaCaducidad: "asc" },
					})
				: Promise.resolve([]),
		]);

		const eventos: CalendarioEventoDto[] = [];

		for (const s of sesiones) {
			eventos.push({
				id: `sesion-${s.id}`,
				tipo: "SESION_SANITARIA",
				fecha: s.fecha.toISOString(),
				titulo: s.descripcion,
				subtitulo: `${s.insumo.nombre} · ${s.veterinario.nombre} (${s.aplicaciones.length} animales)`,
				estado: s.estado,
				referenciaId: s.id,
			});
		}

		for (const t of tratamientos) {
			eventos.push({
				id: `tratamiento-${t.id}`,
				tipo: "TRATAMIENTO_MEDICO",
				fecha: t.fechaFin.toISOString(),
				titulo: `Fin tratamiento: ${t.diagnostico}`,
				subtitulo: `Arete ${t.ganado.identificador} · ${t.insumo.nombre}`,
				estado: t.activo ? "ACTIVO" : "CONCLUIDO",
				referenciaId: t.id,
				ganadoId: t.ganadoId,
				terrenoId: t.ganado.terrenoId,
			});
		}

		for (const ins of insumos) {
			eventos.push({
				id: `insumo-${ins.id}`,
				tipo: "CADUCIDAD_INSUMO",
				fecha: ins.fechaCaducidad.toISOString(),
				titulo: `Caducidad: ${ins.nombre}`,
				subtitulo: `Lote ${ins.lote} · Stock: ${ins.stock.toNumber()} ${ins.unidadMedida}`,
				estado: "POR_CADUCAR",
				referenciaId: ins.id,
			});
		}

		eventos.sort(
			(a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
		);
		return eventos;
	}
}

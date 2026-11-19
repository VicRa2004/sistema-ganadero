import { inject, injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import type { GenerarSesionesPlanesUseCase } from "@/modules/sesion-sanitaria/application/useCases/GenerarSesionesPlanesUseCase";
import type { AutonomiaAlimentoQuery } from "@/modules/alimentacion/application/queries/AutonomiaAlimentoQuery";

export interface EvaluacionAlertasResumenDto {
	eventosEmitidos: number;
	sesionesGeneradasPorPlanes: number;
	outboxReprocesados: number;
}

@injectable()
export class EvaluarAlertasSanitariasUseCase {
	constructor(
		@inject("OutboxEventPublisher")
		private readonly outbox: OutboxEventPublisher,
		@inject("GenerarSesionesPlanesUseCase")
		private readonly generarSesionesPlanesUseCase: GenerarSesionesPlanesUseCase,
		@inject("AutonomiaAlimentoQuery")
		private readonly autonomiaAlimentoQuery?: AutonomiaAlimentoQuery,
	) {}

	public async run(actor?: Actor): Promise<EvaluacionAlertasResumenDto> {
		const usuarioId = actor ? usuarioIdDeFiltro(actor) : undefined;
		const ahora = new Date();
		const hoyInicio = new Date(
			ahora.getFullYear(),
			ahora.getMonth(),
			ahora.getDate(),
		);
		let eventosEmitidos = 0;

		// 1. Generar sesiones programadas desde planes de vacunación activos
		const { sesionesGeneradas } = await this.generarSesionesPlanesUseCase.run(
			actor,
			7,
		);

		// 2. Insumos bajo stock mínimo o próximos a caducar (30 / 15 / 7 / 0 días)
		const limiteCaducidad = new Date(hoyInicio);
		limiteCaducidad.setDate(limiteCaducidad.getDate() + 30);

		const insumos = await prisma.insumo.findMany({
			where: usuarioId !== undefined ? { usuarioId } : {},
			select: {
				id: true,
				nombre: true,
				stock: true,
				stockMinimo: true,
				unidadMedida: true,
				lote: true,
				fechaCaducidad: true,
				usuarioId: true,
			},
		});

		for (const insumo of insumos) {
			const stock = insumo.stock.toNumber();
			const stockMin = insumo.stockMinimo.toNumber();

			if (stock <= stockMin) {
				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("insumo.bajo-stock", {
						usuarioId: insumo.usuarioId,
						tipo: "STOCK_BAJO",
						titulo: `Stock bajo: ${insumo.nombre}`,
						cuerpo: `El insumo "${insumo.nombre}" tiene ${stock} ${insumo.unidadMedida} disponibles (mínimo: ${stockMin} ${insumo.unidadMedida}).`,
						claveDeduplicacion: `stock-bajo:${insumo.id}`,
						referenciaTipo: "INSUMO",
						referenciaId: insumo.id,
					}),
				);
				eventosEmitidos++;
			}

			if (insumo.fechaCaducidad <= limiteCaducidad) {
				const diffMs = insumo.fechaCaducidad.getTime() - hoyInicio.getTime();
				const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
				const umbral =
					diasRestantes <= 0
						? 0
						: diasRestantes <= 7
							? 7
							: diasRestantes <= 15
								? 15
								: 30;
				const fechaKey = insumo.fechaCaducidad.toISOString().slice(0, 10);

				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("insumo.por-caducar", {
						usuarioId: insumo.usuarioId,
						tipo: "INSUMO_POR_CADUCAR",
						titulo:
							umbral === 0
								? `Insumo caducado: ${insumo.nombre}`
								: `Insumo por caducar (${umbral}d): ${insumo.nombre}`,
						cuerpo:
							umbral === 0
								? `El lote ${insumo.lote} de "${insumo.nombre}" caducó el ${fechaKey}.`
								: `El lote ${insumo.lote} de "${insumo.nombre}" caduca el ${fechaKey} (en ${diasRestantes} día(s)).`,
						claveDeduplicacion: `insumo-caduca:${insumo.id}:${umbral}d:${fechaKey}`,
						referenciaTipo: "INSUMO",
						referenciaId: insumo.id,
					}),
				);
				eventosEmitidos++;
			}
		}

		// 3. Tratamientos médicos activos por vencer (<= 2 días) o vencidos sin concluir
		const limiteTratamiento = new Date(hoyInicio);
		limiteTratamiento.setDate(limiteTratamiento.getDate() + 2);

		const tratamientos = await prisma.tratamientoMedico.findMany({
			where: {
				activo: true,
				fechaFin: { lte: limiteTratamiento },
				ganado: {
					deletedAt: null,
					...(usuarioId !== undefined && { terreno: { usuarioId } }),
				},
			},
			include: {
				ganado: {
					select: {
						id: true,
						identificador: true,
						terreno: { select: { usuarioId: true } },
					},
				},
				insumo: { select: { nombre: true } },
			},
		});

		for (const trt of tratamientos) {
			const ownerId = trt.ganado.terreno.usuarioId;
			const vencido = trt.fechaFin < hoyInicio;
			const fechaKey = trt.fechaFin.toISOString().slice(0, 10);

			await this.outbox.publish(
				new AlertaNotificacionDomainEvent("tratamiento.por-vencer", {
					usuarioId: ownerId,
					tipo: "TRATAMIENTO_POR_VENCER",
					titulo: vencido
						? `Tratamiento vencido: ${trt.ganado.identificador}`
						: `Tratamiento por terminar: ${trt.ganado.identificador}`,
					cuerpo: vencido
						? `El tratamiento "${trt.diagnostico}" (${trt.insumo.nombre}) del arete ${trt.ganado.identificador} venció el ${fechaKey} y sigue activo.`
						: `El tratamiento "${trt.diagnostico}" (${trt.insumo.nombre}) del arete ${trt.ganado.identificador} finaliza el ${fechaKey}.`,
					claveDeduplicacion: `tratamiento-${vencido ? "vencido" : "por-vencer"}:${trt.id}:${fechaKey}`,
					referenciaTipo: "TRATAMIENTO_MEDICO",
					referenciaId: trt.id,
				}),
			);
			eventosEmitidos++;
		}

		// 4. Sesiones sanitarias programadas próximas (próximos 3 días)
		const limiteSesiones = new Date(hoyInicio);
		limiteSesiones.setDate(limiteSesiones.getDate() + 3);
		const sesionesProximas = await prisma.sesionSanitaria.findMany({
			where: {
				estado: "PROGRAMADA",
				fecha: { gte: hoyInicio, lte: limiteSesiones },
				...(usuarioId !== undefined && { veterinario: { usuarioId } }),
			},
			include: {
				veterinario: { select: { usuarioId: true, nombre: true } },
				insumo: { select: { nombre: true } },
			},
		});

		for (const ses of sesionesProximas) {
			const fechaKey = ses.fecha.toISOString().slice(0, 10);
			await this.outbox.publish(
				new AlertaNotificacionDomainEvent("sesion.programada", {
					usuarioId: ses.veterinario.usuarioId,
					tipo: "SESION_PROGRAMADA",
					titulo: `Sesión sanitaria próxima: ${fechaKey}`,
					cuerpo: `${ses.descripcion} · Insumo: ${ses.insumo.nombre} (${ses.veterinario.nombre}).`,
					claveDeduplicacion: `sesion-programada:${ses.id}:${fechaKey}`,
					referenciaTipo: "SESION_SANITARIA",
					referenciaId: ses.id,
				}),
			);
			eventosEmitidos++;
		}

		// 5. Animales mayores a 3 meses sin vacuna realizada en los últimos 180 días
		const hace90Dias = new Date(hoyInicio);
		hace90Dias.setDate(hace90Dias.getDate() - 90);
		const hace180Dias = new Date(hoyInicio);
		hace180Dias.setDate(hace180Dias.getDate() - 180);

		const sinVacuna = await prisma.ganado.findMany({
			where: {
				fechaBaja: null,
				fechaNacimiento: { lte: hace90Dias },
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
				aplicacionesSanitarias: {
					none: {
						deletedAt: null,
						sesion: {
							deletedAt: null,
							estado: "REALIZADA",
							fecha: { gte: hace180Dias },
							insumo: { tipo: "VACUNA" },
						},
					},
				},
			},
			select: {
				identificador: true,
				terreno: { select: { usuarioId: true } },
			},
		});

		const porUsuario = new Map<number, string[]>();
		for (const animal of sinVacuna) {
			const list = porUsuario.get(animal.terreno.usuarioId) ?? [];
			list.push(animal.identificador);
			porUsuario.set(animal.terreno.usuarioId, list);
		}

		const mesKey = ahora.toISOString().slice(0, 7);
		for (const [ownerId, aretes] of porUsuario.entries()) {
			const muestra =
				aretes.length <= 5
					? aretes.join(", ")
					: `${aretes.slice(0, 5).join(", ")} y ${aretes.length - 5} más`;
			await this.outbox.publish(
				new AlertaNotificacionDomainEvent("ganado.vacuna-pendiente", {
					usuarioId: ownerId,
					tipo: "VACUNA_PENDIENTE",
					titulo: `${aretes.length} animal(es) sin vacuna vigente`,
					cuerpo: `Animales sin vacunación en los últimos 6 meses: ${muestra}.`,
					claveDeduplicacion: `vacuna-pendiente:${ownerId}:${mesKey}`,
					referenciaTipo: "CALENDARIO_SANITARIO",
					referenciaId: null,
				}),
			);
			eventosEmitidos++;
		}

		// 6. Partos próximos estimados (próximos 14 días) sin parto ni aborto posterior
		const limitePartos = new Date(hoyInicio);
		limitePartos.setDate(limitePartos.getDate() + 14);
		const eventosGestacion = await prisma.eventoReproductivo.findMany({
			where: {
				fechaProbableParto: { gte: hoyInicio, lte: limitePartos },
				OR: [
					{ tipo: { in: ["MONTA", "INSEMINACION"] } },
					{ tipo: "DIAGNOSTICO_GESTACION", resultado: "POSITIVO" },
				],
				hembra: {
					deletedAt: null,
					fechaBaja: null,
					...(usuarioId !== undefined && { terreno: { usuarioId } }),
				},
			},
			include: {
				hembra: {
					select: {
						identificador: true,
						terreno: { select: { usuarioId: true } },
					},
				},
			},
			orderBy: [{ fecha: "desc" }, { id: "desc" }],
		});

		const hembrasVistasParto = new Set<number>();
		for (const ev of eventosGestacion) {
			if (hembrasVistasParto.has(ev.hembraId) || !ev.fechaProbableParto) {
				continue;
			}
			hembrasVistasParto.add(ev.hembraId);
			const cierre = await prisma.eventoReproductivo.findFirst({
				where: {
					hembraId: ev.hembraId,
					tipo: { in: ["PARTO", "ABORTO"] },
					fecha: { gte: ev.fecha },
				},
				select: { id: true },
			});
			if (cierre) continue;

			const fechaPartoKey = ev.fechaProbableParto.toISOString().slice(0, 10);
			await this.outbox.publish(
				new AlertaNotificacionDomainEvent("reproduccion.parto-proximo", {
					usuarioId: ev.hembra.terreno.usuarioId,
					tipo: "PARTO_PROXIMO",
					titulo: `Parto próximo: ${ev.hembra.identificador}`,
					cuerpo: `La hembra ${ev.hembra.identificador} tiene fecha probable de parto el ${fechaPartoKey}.`,
					claveDeduplicacion: `parto-proximo:${ev.hembraId}:${fechaPartoKey}`,
					referenciaTipo: "GANADO",
					referenciaId: ev.hembraId,
				}),
			);
			eventosEmitidos++;
		}

		// 7. Autonomía baja de alimento (días restantes <= umbral configurado en raciones activas)
		if (this.autonomiaAlimentoQuery) {
			const autonomias =
				await this.autonomiaAlimentoQuery.obtenerAutonomia(actor);
			const hoyKey = hoyInicio.toISOString().slice(0, 10);
			for (const item of autonomias) {
				if (!item.enAlerta || item.diasAutonomia === null) continue;
				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("alimentacion.autonomia-baja", {
						usuarioId: item.usuarioId,
						tipo: "AUTONOMIA_ALIMENTO",
						titulo: `Autonomía baja de alimento: ${item.insumoNombre}`,
						cuerpo: `Quedan aprox. ${item.diasAutonomia} día(s) de "${item.insumoNombre}" (${item.stock} ${item.unidadMedida} / consumo ${item.consumoDiarioEsperado} ${item.unidadMedida}/día).`,
						claveDeduplicacion: `autonomia-alimento:${item.insumoId}:${hoyKey}`,
						referenciaTipo: "INSUMO",
						referenciaId: item.insumoId,
					}),
				);
				eventosEmitidos++;
			}
		}

		const outboxReprocesados = await this.outbox.reprocesarPendientes();

		return {
			eventosEmitidos,
			sesionesGeneradasPorPlanes: sesionesGeneradas,
			outboxReprocesados,
		};
	}
}

import { inject, injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import { SesionSanitaria } from "../../domain/SesionSanitaria";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";

@injectable()
export class GenerarSesionesPlanesUseCase {
	constructor(
		@inject("PlanSanitarioRepository")
		private readonly planRepository: PlanSanitarioRepository,
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
	) {}

	public async run(
		usuarioId?: number,
		diasAnticipacion = 7,
	): Promise<{ sesionesGeneradas: number }> {
		const ahora = new Date();
		const limite = new Date(ahora);
		limite.setDate(limite.getDate() + diasAnticipacion);

		const planes = await this.planRepository.findActivosPorEjecutar(
			limite,
			usuarioId,
		);

		let sesionesGeneradas = 0;

		for (const plan of planes) {
			const terrenoIdPlan = plan.getTerrenoId();
			const razaIdPlan = plan.getRazaId();
			const fechaLimiteNacimiento =
				plan.getEdadMinimaMeses() !== null
					? new Date(
							ahora.getFullYear(),
							ahora.getMonth() - (plan.getEdadMinimaMeses() ?? 0),
							ahora.getDate(),
						)
					: undefined;

			const ganados = await prisma.ganado.findMany({
				where: {
					fechaBaja: null,
					terreno: {
						usuarioId: plan.getUsuarioId(),
						...(terrenoIdPlan !== null && { id: terrenoIdPlan }),
					},
					...(razaIdPlan !== null && { razaId: razaIdPlan }),
					...(fechaLimiteNacimiento !== undefined && {
						fechaNacimiento: { lte: fechaLimiteNacimiento },
					}),
				},
				select: { id: true },
			});

			const aplicaciones = ganados.map((g) =>
				AplicacionSanitaria.create(
					g.id,
					plan.getDosisPorAnimal(),
					`Programada automáticamente por plan: ${plan.getNombre()}`,
				),
			);

			const fechaSesion = plan.getProximaEjecucion();
			const sesion = SesionSanitaria.create(
				fechaSesion,
				plan.getVeterinarioId(),
				`[Plan: ${plan.getNombre()}] ${plan.getDescripcion()}`,
				plan.getInsumoId(),
				aplicaciones,
				null,
				"PROGRAMADA",
				plan.getId(),
			);

			const sesionGuardada = await this.transactionRunner.run(async () => {
				const creada = await this.sesionRepository.save(sesion);
				plan.avanzarProximaEjecucion();
				await this.planRepository.save(plan);
				return creada;
			});

			sesionesGeneradas++;

			if (this.outbox) {
				const fechaKey = fechaSesion.toISOString().slice(0, 10);
				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("sesion.programada", {
						usuarioId: plan.getUsuarioId(),
						tipo: "SESION_PROGRAMADA",
						titulo: `Sesión programada: ${plan.getNombre()}`,
						cuerpo: `Se programó "${plan.getNombre()}" para el ${fechaKey} (${aplicaciones.length} animales elegibles).`,
						claveDeduplicacion: `plan-sesion:${plan.getId()}:${fechaKey}`,
						referenciaTipo: "SESION_SANITARIA",
						referenciaId: sesionGuardada.getId(),
					}),
				);
			}
		}

		return { sesionesGeneradas };
	}
}

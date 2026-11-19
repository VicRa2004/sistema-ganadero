import { inject, injectable } from "tsyringe";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { MovimientoInsumo } from "@/modules/inventario-insumos/domain/MovimientoInsumo";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { SesionSanitariaOutputDto } from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class RealizarSesionSanitariaUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository?: MovimientoInsumoRepository,
	) {}

	public async run(
		id: number,
		actor: Actor,
	): Promise<SesionSanitariaOutputDto> {
		const sesion = await this.accessService.obtenerSesion(id, actor);
		const aplicaciones = sesion.getAplicaciones();
		if (aplicaciones.length === 0) {
			throw new ValidationError(
				"La sesión no tiene animales asignados para realizarse",
			);
		}

		const totalDosis = sesion.calcularTotalDosisConsumida();
		const insumo = await this.accessService.obtenerInsumo(
			sesion.getInsumoId(),
			actor,
		);
		if (insumo.getStock() < totalDosis) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				totalDosis,
			);
		}

		sesion.marcarRealizada();

		let insumoBajoStock = false;
		let stockFinal = insumo.getStock();

		const guardada = await this.transactionRunner.run(async () => {
			if (totalDosis > 0) {
				const actualizado = await this.insumoRepository.descontarStock(
					insumo.getId(),
					totalDosis,
				);
				if (!actualizado) {
					const actual = await this.insumoRepository.findById(insumo.getId());
					throw new InsuficienteStockInsumoError(
						insumo.getId(),
						actual?.getStock() ?? 0,
						totalDosis,
					);
				}
				if (actualizado.esBajoStock()) {
					insumoBajoStock = true;
					stockFinal = actualizado.getStock();
				}
			}
			const savedSesion = await this.sesionRepository.save(sesion);

			if (this.movimientoRepository && totalDosis > 0) {
				const costoUnit =
					typeof insumo.getCostoUnitario === "function"
						? insumo.getCostoUnitario()
						: 0;
				const movs = aplicaciones
					.filter((app) => app.getDosisAplicada() > 0)
					.map((app) =>
						MovimientoInsumo.create({
							insumoId: insumo.getId(),
							tipo: "SALIDA",
							cantidad: app.getDosisAplicada(),
							costoUnitario: costoUnit,
							motivo: `Realización sesión sanitaria: ${sesion.getDescripcion()}`,
							referenciaTipo: "SESION_SANITARIA",
							referenciaId: savedSesion.getId(),
							ganadoId: app.getGanadoId(),
							usuarioId: actor.id,
						}),
					);
				await this.movimientoRepository.registrarMuchos(movs);
			}

			return savedSesion;
		});

		if (insumoBajoStock && this.outbox) {
			await this.outbox.publish(
				new AlertaNotificacionDomainEvent("insumo.bajo-stock", {
					usuarioId: insumo.getUsuarioId(),
					tipo: "STOCK_BAJO",
					titulo: `Stock bajo: ${insumo.getNombre()}`,
					cuerpo: `El insumo "${insumo.getNombre()}" tiene ${stockFinal} ${insumo.getUnidadMedida()} (mínimo: ${insumo.getStockMinimo()} ${insumo.getUnidadMedida()}).`,
					claveDeduplicacion: `stock-bajo:${insumo.getId()}`,
					referenciaTipo: "INSUMO",
					referenciaId: insumo.getId(),
				}),
			);
		}

		return this.mapper.toDto(guardada, {
			nombreInsumo: insumo.getNombre(),
			unidadMedidaInsumo: insumo.getUnidadMedida(),
		});
	}
}

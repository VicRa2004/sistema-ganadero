import { inject, injectable } from "tsyringe";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { InsumoStockInsuficienteError } from "@/modules/inventario-insumos/domain/error/InsumoStockInsuficienteError";
import { MovimientoInsumo } from "@/modules/inventario-insumos/domain/MovimientoInsumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import { SuministroRacion } from "../../domain/SuministroRacion";
import type {
	RegistrarSuministroInputDto,
	SuministroOutputDto,
} from "../dtos/AlimentacionDto";
import type { AlimentacionMapper } from "../mappers/AlimentacionMapper";
import type { AutonomiaAlimentoQuery } from "../queries/AutonomiaAlimentoQuery";
import type { AlimentacionAccessService } from "../services/AlimentacionAccessService";

@injectable()
export class RegistrarSuministroUseCase {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("AlimentacionAccessService")
		private readonly accessService: AlimentacionAccessService,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository: MovimientoInsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("AlimentacionMapper")
		private readonly mapper: AlimentacionMapper,
		@inject("AutonomiaAlimentoQuery")
		private readonly autonomiaQuery?: AutonomiaAlimentoQuery,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
	) {}

	public async run(
		racionId: number,
		dto: RegistrarSuministroInputDto,
		actor: Actor,
	): Promise<SuministroOutputDto> {
		const racion = await this.accessService.obtenerRacion(racionId, actor);
		if (!racion.esActivo()) {
			throw new ValidationError(
				"No se puede suministrar una ración desactivada",
			);
		}

		const insumo = await this.accessService.obtenerInsumoAlimento(
			racion.getInsumoId(),
			actor,
		);

		const cantidadAnimales =
			await this.alimentacionRepository.countAnimalesGrupo({
				loteId: racion.getLoteId(),
				terrenoId: racion.getTerrenoId(),
			});
		if (cantidadAnimales <= 0) {
			throw new ValidationError(
				"No hay animales activos en el terreno o lote asignado a la ración",
			);
		}

		const cantidadTotal =
			dto.cantidadTotalOverride ??
			Number(
				(racion.getCantidadDiariaPorAnimal() * cantidadAnimales).toFixed(3),
			);
		if (cantidadTotal <= 0) {
			throw new ValidationError("La cantidad a suministrar debe ser mayor a 0");
		}
		if (insumo.getStock() < cantidadTotal) {
			throw new InsumoStockInsuficienteError(
				`Stock insuficiente de "${insumo.getNombre()}": disponible ${insumo.getStock()} ${insumo.getUnidadMedida()}, requerido ${cantidadTotal}`,
			);
		}

		const fecha = dto.fecha ? new Date(dto.fecha) : new Date();
		const costoTotal = Number(
			(cantidadTotal * insumo.getCostoUnitario()).toFixed(2),
		);

		let stockFinal = insumo.getStock();
		let bajoStock = false;

		const savedSuministro = await this.transactionRunner.run(async () => {
			const actualizado = await this.insumoRepository.descontarStock(
				insumo.getId(),
				cantidadTotal,
			);
			if (!actualizado) {
				throw new InsumoStockInsuficienteError(
					`Stock insuficiente para suministrar ${cantidadTotal} ${insumo.getUnidadMedida()}`,
				);
			}
			stockFinal = actualizado.getStock();
			bajoStock = actualizado.esBajoStock();

			const suministro = SuministroRacion.create({
				racionId,
				insumoId: insumo.getId(),
				terrenoId: racion.getTerrenoId(),
				loteId: racion.getLoteId(),
				fecha,
				cantidadAnimales,
				cantidadTotal,
				costoTotal,
				observaciones: dto.observaciones,
				usuarioId: actor.id,
			});

			const created =
				await this.alimentacionRepository.registrarSuministro(suministro);

			await this.movimientoRepository.registrar(
				MovimientoInsumo.create({
					insumoId: insumo.getId(),
					tipo: "SALIDA",
					cantidad: cantidadTotal,
					costoUnitario: insumo.getCostoUnitario(),
					motivo: `Suministro ración "${racion.getNombre()}" (${cantidadAnimales} animales)`,
					referenciaTipo: "SUMINISTRO_RACION",
					referenciaId: created.getId(),
					terrenoId: racion.getTerrenoId(),
					loteId: racion.getLoteId(),
					usuarioId: actor.id,
					fecha,
				}),
			);

			return created;
		});

		if (bajoStock && this.outbox) {
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

		if (this.autonomiaQuery && this.outbox) {
			const autonomias = await this.autonomiaQuery.obtenerAutonomia(actor);
			const item = autonomias.find((a) => a.insumoId === insumo.getId());
			if (item?.enAlerta && item.diasAutonomia !== null) {
				const fechaKey = new Date().toISOString().slice(0, 10);
				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("alimentacion.autonomia-baja", {
						usuarioId: item.usuarioId,
						tipo: "AUTONOMIA_ALIMENTO",
						titulo: `Autonomía baja de alimento: ${item.insumoNombre}`,
						cuerpo: `Quedan aprox. ${item.diasAutonomia} día(s) de "${item.insumoNombre}" (${item.stock} ${item.unidadMedida} / consumo ${item.consumoDiarioEsperado} ${item.unidadMedida}/día).`,
						claveDeduplicacion: `autonomia-alimento:${item.insumoId}:${fechaKey}`,
						referenciaTipo: "INSUMO",
						referenciaId: item.insumoId,
					}),
				);
			}
		}

		return this.mapper.suministroToDto(savedSuministro);
	}
}

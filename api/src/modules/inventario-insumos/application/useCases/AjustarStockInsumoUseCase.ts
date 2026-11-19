import { inject, injectable } from "tsyringe";
import { logger } from "@/core/config/logger";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import { type Actor, assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import { InsumoStockInsuficienteError } from "../../domain/error/InsumoStockInsuficienteError";
import { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import type {
	AjustarStockInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class AjustarStockInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository: MovimientoInsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
	) {}

	public async run(
		id: number,
		dto: AjustarStockInsumoInputDto,
		actor: Actor,
	): Promise<InsumoOutputDto> {
		if (dto.cantidadDelta === 0) {
			throw new ValidationError("El ajuste de stock no puede ser cero");
		}
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}
		assertPuedeAcceder(
			actor,
			insumo.getUsuarioId(),
			"No tienes permiso para ajustar este insumo",
		);

		if (dto.cantidadDelta < 0 && insumo.getStock() + dto.cantidadDelta < 0) {
			throw new InsumoStockInsuficienteError(
				`Stock insuficiente para ajustar ${dto.cantidadDelta} ${insumo.getUnidadMedida()}. Stock disponible: ${insumo.getStock()}`,
			);
		}

		const saved = await this.transactionRunner.run(async () => {
			const updated = this.insumoRepository.ajustarStock
				? await this.insumoRepository.ajustarStock(id, dto.cantidadDelta)
				: dto.cantidadDelta < 0
					? await this.insumoRepository.descontarStock(
							id,
							Math.abs(dto.cantidadDelta),
						)
					: await this.insumoRepository.adicionarStock(id, dto.cantidadDelta);
			if (!updated) {
				throw new InsumoStockInsuficienteError(
					`Stock insuficiente para ajustar ${dto.cantidadDelta} ${insumo.getUnidadMedida()}`,
				);
			}

			await this.movimientoRepository.registrar(
				MovimientoInsumo.create({
					insumoId: id,
					tipo: "AJUSTE",
					cantidad: dto.cantidadDelta,
					costoUnitario: dto.costoUnitario ?? updated.getCostoUnitario(),
					motivo: dto.motivo,
					referenciaTipo: "AJUSTE",
					usuarioId: actor.id,
				}),
			);

			return updated;
		});

		if (saved.esBajoStock()) {
			logger.warn(
				`Alerta de inventario tras ajuste: "${saved.getNombre()}" (#${saved.getId()}) stock=${saved.getStock()}`,
			);
			if (this.outbox) {
				await this.outbox.publish(
					new AlertaNotificacionDomainEvent("insumo.bajo-stock", {
						usuarioId: saved.getUsuarioId(),
						tipo: "STOCK_BAJO",
						titulo: `Stock bajo: ${saved.getNombre()}`,
						cuerpo: `El insumo "${saved.getNombre()}" tiene ${saved.getStock()} ${saved.getUnidadMedida()} (mínimo: ${saved.getStockMinimo()} ${saved.getUnidadMedida()}).`,
						claveDeduplicacion: `stock-bajo:${saved.getId()}`,
						referenciaTipo: "INSUMO",
						referenciaId: saved.getId(),
					}),
				);
			}
		}

		return this.mapper.toDto(saved);
	}
}

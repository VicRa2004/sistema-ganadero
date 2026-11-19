import { inject, injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { logger } from "@/core/config/logger";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import {
	type Actor,
	assertPuedeAcceder,
	esAdmin,
} from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import { InsumoStockInsuficienteError } from "../../domain/error/InsumoStockInsuficienteError";
import { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import type {
	ConsumirInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ConsumirInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository?: MovimientoInsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner?: TransactionRunner,
	) {}

	private async validarReferencias(
		dto: ConsumirInsumoInputDto,
		actor: Actor,
	): Promise<void> {
		const usuarioFilter = esAdmin(actor) ? {} : { usuarioId: actor.id };
		if (dto.ganadoId !== undefined) {
			const ganado = await db().ganado.findFirst({
				where: {
					id: dto.ganadoId,
					...(!esAdmin(actor) && { terreno: { usuarioId: actor.id } }),
				},
				select: { id: true },
			});
			if (!ganado) {
				throw new BaseError(
					`Ganado con ID ${dto.ganadoId} no fue encontrado`,
					404,
				);
			}
		}
		if (dto.terrenoId !== undefined) {
			const terreno = await db().terreno.findFirst({
				where: { id: dto.terrenoId, ...usuarioFilter },
				select: { id: true },
			});
			if (!terreno) {
				throw new BaseError(
					`Terreno con ID ${dto.terrenoId} no fue encontrado`,
					404,
				);
			}
		}
		if (dto.loteId !== undefined) {
			const lote = await db().lote.findFirst({
				where: { id: dto.loteId, ...usuarioFilter },
				select: { id: true },
			});
			if (!lote) {
				throw new BaseError(`Lote con ID ${dto.loteId} no fue encontrado`, 404);
			}
		}
	}

	public async run(
		id: number,
		dto: ConsumirInsumoInputDto,
		usuarioId: number,
		rol: string,
	): Promise<InsumoOutputDto> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}

		const actor: Actor = { id: usuarioId, role: rol };
		assertPuedeAcceder(
			actor,
			insumo.getUsuarioId(),
			"No tienes permiso para consumir este insumo",
		);

		insumo.validarDescuento(dto.cantidad);
		if (
			dto.ganadoId !== undefined ||
			dto.terrenoId !== undefined ||
			dto.loteId !== undefined
		) {
			await this.validarReferencias(dto, actor);
		}

		const runTx = this.transactionRunner
			? this.transactionRunner.run.bind(this.transactionRunner)
			: <T>(fn: () => Promise<T>) => fn();

		const saved = await runTx(async () => {
			const updated = await this.insumoRepository.descontarStock(
				id,
				dto.cantidad,
			);
			if (!updated) {
				throw new InsumoStockInsuficienteError(
					`Stock insuficiente para descontar ${dto.cantidad} ${insumo.getUnidadMedida()}`,
				);
			}

			if (this.movimientoRepository) {
				await this.movimientoRepository.registrar(
					MovimientoInsumo.create({
						insumoId: id,
						tipo: "SALIDA",
						cantidad: dto.cantidad,
						costoUnitario: insumo.getCostoUnitario(),
						motivo: dto.motivo?.trim() || "Consumo manual de inventario",
						referenciaTipo: "CONSUMO_MANUAL",
						ganadoId: dto.ganadoId ?? null,
						terrenoId: dto.terrenoId ?? null,
						loteId: dto.loteId ?? null,
						usuarioId,
					}),
				);
			}

			return updated;
		});

		if (saved.esBajoStock()) {
			logger.warn(
				`Alerta de inventario: el insumo "${saved.getNombre()}" (ID: ${saved.getId()}) ha caído por debajo de su stock mínimo de seguridad. Stock actual: ${saved.getStock()} ${saved.getUnidadMedida()} (Mínimo: ${saved.getStockMinimo()}).`,
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

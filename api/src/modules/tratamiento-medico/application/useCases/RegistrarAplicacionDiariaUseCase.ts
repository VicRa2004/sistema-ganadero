import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import { MovimientoInsumo } from "@/modules/inventario-insumos/domain/MovimientoInsumo";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import type { TratamientoMedicoRepository } from "../../domain/repository/TratamientoMedicoRepository";
import type {
	RegistrarAplicacionDiariaInputDto,
	TratamientoMedicoOutputDto,
} from "../dtos/TratamientoMedicoDto";
import type { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import type { TratamientoAccessService } from "../services/TratamientoAccessService";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";

@injectable()
export class RegistrarAplicacionDiariaUseCase {
	constructor(
		@inject("TratamientoMedicoRepository")
		private readonly tratamientoRepository: TratamientoMedicoRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("TratamientoAccessService")
		private readonly accessService: TratamientoAccessService,
		@inject("TratamientoMedicoMapper")
		private readonly mapper: TratamientoMedicoMapper,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository?: MovimientoInsumoRepository,
	) {}

	public async run(
		dto: RegistrarAplicacionDiariaInputDto,
		actor: Actor,
	): Promise<TratamientoMedicoOutputDto> {
		const tratamiento = await this.accessService.obtenerTratamiento(
			dto.tratamientoId,
			actor,
		);

		if (!tratamiento.esActivo()) {
			throw new ValidationError(
				"No se puede aplicar dosis a un tratamiento finalizado",
			);
		}

		const dosisAplicada = dto.cantidadDosis ?? tratamiento.getDosisDiaria();
		if (dosisAplicada <= 0) {
			throw new ValidationError(
				"La cantidad de dosis a aplicar debe ser mayor a cero",
			);
		}

		const insumo = await this.accessService.obtenerInsumo(
			tratamiento.getInsumoId(),
			actor,
		);

		if (insumo.getStock() < dosisAplicada) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				dosisAplicada,
			);
		}

		let insumoBajoStock = false;
		let stockFinal = insumo.getStock();

		const guardado = await this.transactionRunner.run(async () => {
			const actualizado = await this.insumoRepository.descontarStock(
				insumo.getId(),
				dosisAplicada,
			);

			if (!actualizado) {
				const actual = await this.insumoRepository.findById(insumo.getId());
				throw new InsuficienteStockInsumoError(
					insumo.getId(),
					actual?.getStock() ?? 0,
					dosisAplicada,
				);
			}
			if (
				typeof actualizado.esBajoStock === "function" &&
				actualizado.esBajoStock()
			) {
				insumoBajoStock = true;
				stockFinal = actualizado.getStock();
			}

			const savedTrat = await this.tratamientoRepository.save(tratamiento);

			if (this.movimientoRepository) {
				const costoUnit =
					typeof insumo.getCostoUnitario === "function"
						? insumo.getCostoUnitario()
						: 0;
				await this.movimientoRepository.registrar(
					MovimientoInsumo.create({
						insumoId: insumo.getId(),
						tipo: "SALIDA",
						cantidad: dosisAplicada,
						costoUnitario: costoUnit,
						motivo: `Aplicación tratamiento médico: ${tratamiento.getDiagnostico()}`,
						referenciaTipo: "TRATAMIENTO_MEDICO",
						referenciaId: tratamiento.getId(),
						ganadoId: tratamiento.getGanadoId(),
						usuarioId: actor.id,
					}),
				);
			}

			return savedTrat;
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

		return this.mapper.toDto(guardado, {
			insumoNombre: insumo.getNombre(),
			insumoUnidad: insumo.getUnidadMedida(),
		});
	}
}

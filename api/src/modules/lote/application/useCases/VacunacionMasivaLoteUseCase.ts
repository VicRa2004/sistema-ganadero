import { inject, injectable } from "tsyringe";
import {
	AlertaNotificacionDomainEvent,
	type OutboxEventPublisher,
} from "@/core/notificacion/domain/events/SaludEvents";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { MovimientoInsumo } from "@/modules/inventario-insumos/domain/MovimientoInsumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import type { SesionAccessService } from "@/modules/sesion-sanitaria/application/services/SesionAccessService";
import { AplicacionSanitaria } from "@/modules/sesion-sanitaria/domain/AplicacionSanitaria";
import { InsuficienteStockInsumoError } from "@/modules/sesion-sanitaria/domain/error/InsuficienteStockInsumoError";
import type { SesionSanitariaRepository } from "@/modules/sesion-sanitaria/domain/repository/SesionSanitariaRepository";
import { SesionSanitaria } from "@/modules/sesion-sanitaria/domain/SesionSanitaria";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { VacunacionMasivaLoteInputDto } from "../dtos/LoteDto";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class VacunacionMasivaLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly loteAccess: LoteAccessService,
		@inject("SesionAccessService")
		private readonly sesionAccess: SesionAccessService,
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository: MovimientoInsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("OutboxEventPublisher")
		private readonly outbox?: OutboxEventPublisher,
	) {}

	public async run(
		loteId: number,
		dto: VacunacionMasivaLoteInputDto,
		actor: Actor,
	): Promise<{
		sesionId: number;
		animalesVacunados: number;
		dosisTotalConsumida: number;
	}> {
		const lote = await this.loteAccess.obtenerLote(loteId, actor);
		await this.sesionAccess.obtenerVeterinario(dto.veterinarioId, actor);
		const insumo = await this.sesionAccess.obtenerInsumo(dto.insumoId, actor);

		const memberIds = await this.loteRepository.findActiveMemberIds(loteId);
		if (memberIds.length === 0) {
			throw new ValidationError(
				"El lote no tiene animales activos para vacunar",
			);
		}

		const totalDosis = Number(
			(dto.dosisPorAnimal * memberIds.length).toFixed(3),
		);
		if (insumo.getStock() < totalDosis) {
			throw new InsuficienteStockInsumoError(
				insumo.getId(),
				insumo.getStock(),
				totalDosis,
			);
		}

		const aplicaciones = memberIds.map((ganadoId) =>
			AplicacionSanitaria.create(
				ganadoId,
				dto.dosisPorAnimal,
				`Vacunación masiva lote "${lote.getNombre()}"`,
			),
		);
		const sesion = SesionSanitaria.create(
			new Date(dto.fecha),
			dto.veterinarioId,
			dto.descripcion,
			dto.insumoId,
			aplicaciones,
			null,
			"REALIZADA",
		);

		let insumoBajoStock = false;
		let stockFinal = insumo.getStock();

		const savedSesion = await this.transactionRunner.run(async () => {
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

			const createdSesion = await this.sesionRepository.save(sesion);
			const costoUnit = insumo.getCostoUnitario();
			const movimientos = memberIds.map((ganadoId) =>
				MovimientoInsumo.create({
					insumoId: insumo.getId(),
					tipo: "SALIDA",
					cantidad: dto.dosisPorAnimal,
					costoUnitario: costoUnit,
					motivo: `Vacunación masiva lote "${lote.getNombre()}": ${dto.descripcion}`,
					referenciaTipo: "SESION_SANITARIA",
					referenciaId: createdSesion.getId(),
					ganadoId,
					loteId,
					usuarioId: actor.id,
				}),
			);
			await this.movimientoRepository.registrarMuchos(movimientos);

			return createdSesion;
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

		const sesionId = savedSesion.getId();
		if (sesionId === null) {
			throw new Error("La sesión creada no devolvió ID");
		}

		return {
			sesionId,
			animalesVacunados: memberIds.length,
			dosisTotalConsumida: totalDosis,
		};
	}
}

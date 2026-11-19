import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { PesajeMasivoLoteInputDto } from "../dtos/LoteDto";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class PesajeMasivoLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
	) {}

	public async run(
		loteId: number,
		dto: PesajeMasivoLoteInputDto,
		actor: Actor,
	): Promise<{ loteId: number; pesajesRegistrados: number }> {
		await this.accessService.obtenerLote(loteId, actor);
		if (!dto.items || dto.items.length === 0) {
			throw new ValidationError("Debe incluir al menos un animal a pesar");
		}

		const fecha = dto.fecha ? new Date(dto.fecha) : new Date();
		if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
			throw new ValidationError(
				"La fecha del pesaje debe ser válida y no futura",
			);
		}

		const activeMemberIds = new Set(
			await this.loteRepository.findActiveMemberIds(loteId),
		);
		const vistos = new Set<number>();

		for (const item of dto.items) {
			if (vistos.has(item.ganadoId)) {
				throw new ValidationError(
					`El animal #${item.ganadoId} está repetido en el pesaje masivo`,
				);
			}
			vistos.add(item.ganadoId);
			if (!activeMemberIds.has(item.ganadoId)) {
				throw new ValidationError(
					`El animal #${item.ganadoId} no es un miembro activo del lote`,
				);
			}
			if (item.peso <= 0 || item.peso > 3000) {
				throw new ValidationError(
					"El peso debe ser mayor a 0 y menor o igual a 3000 kg",
				);
			}
		}

		await this.transactionRunner.run(async () => {
			for (const item of dto.items) {
				await this.ganadoRepository.registrarPesaje(item.ganadoId, {
					peso: item.peso,
					fecha,
					observaciones: dto.observaciones?.trim() || "Pesaje masivo de lote",
				});
			}
		});

		return { loteId, pesajesRegistrados: dto.items.length };
	}
}

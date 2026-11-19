import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { DocumentStorageService } from "@/core/shared/domain/services/DocumentStorageService";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoDetalleQuery } from "@/modules/ganado/application/queries/GanadoDetalleQuery";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { Ganado } from "@/modules/ganado/domain/Ganado";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { MotivoBajaRepository } from "@/modules/ganado/domain/repository/MotivoBajaRepository";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import { Transaccion } from "../../domain/Transaccion";
import { TransaccionGanado } from "../../domain/TransaccionGanado";
import type {
	RegistrarVentaInputDto,
	TransaccionOutputDto,
} from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";

@injectable()
export class RegistrarVentaGanadoUseCase {
	constructor(
		@inject("TransaccionRepository")
		private readonly transaccionRepository: TransaccionRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("MotivoBajaRepository")
		private readonly motivoBajaRepository: MotivoBajaRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("GanadoDetalleQuery")
		private readonly ganadoDetalleQuery: GanadoDetalleQuery,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
		@inject("DocumentStorageService")
		private readonly documentStorage: DocumentStorageService,
	) {}

	public async run(
		dto: RegistrarVentaInputDto,
		actor: Actor,
	): Promise<TransaccionOutputDto> {
		if (!dto.items || dto.items.length === 0) {
			throw new ValidationError("La venta debe incluir al menos un animal");
		}

		const fechaVenta = new Date(dto.fecha);
		if (Number.isNaN(fechaVenta.getTime())) {
			throw new ValidationError("La fecha de venta no es válida");
		}

		const vistos = new Set<number>();
		for (const item of dto.items) {
			if (vistos.has(item.ganadoId)) {
				throw new ValidationError(
					`El animal #${item.ganadoId} está duplicado en la venta`,
				);
			}
			vistos.add(item.ganadoId);
		}

		const motivos = await this.motivoBajaRepository.findAll();
		const motivoVenta = motivos.find(
			(m) => m.getNombre().trim().toUpperCase() === "VENTA",
		);
		if (!motivoVenta) {
			throw new BaseError(
				"No existe el motivo de baja 'VENTA' configurado en el sistema",
				400,
			);
		}

		const animalesPreparados: Array<{
			ganado: Ganado;
			precio: number;
			pesoRegistro: number;
		}> = [];

		for (const item of dto.items) {
			const ganado = await this.ganadoAccess.obtenerGanado(
				item.ganadoId,
				actor,
			);
			if (!ganado.estaActivo()) {
				throw new ValidationError(
					`El animal ${ganado.getIdentificador()} ya se encuentra dado de baja`,
				);
			}

			const retiro = await this.ganadoDetalleQuery.obtenerRetiroVigente(
				item.ganadoId,
				fechaVenta,
			);
			if (retiro.vigente && retiro.hasta) {
				const hastaStr = retiro.hasta.toISOString().slice(0, 10);
				throw new ValidationError(
					`No se puede vender el animal ${ganado.getIdentificador()}: tiene período de retiro vigente hasta ${hastaStr} (${retiro.motivo ?? "medicamento"})`,
				);
			}

			animalesPreparados.push({
				ganado,
				precio: item.precio,
				pesoRegistro: item.pesoRegistro ?? ganado.getPeso(),
			});
		}

		let documentoAdjuntoPath: string | null = null;
		if (dto.documentoAdjunto instanceof File) {
			documentoAdjuntoPath = await this.documentStorage.upload(
				dto.documentoAdjunto,
				"comercial",
			);
		}

		try {
			const saved = await this.transactionRunner.run(async () => {
				const detalles: TransaccionGanado[] = [];
				for (const item of animalesPreparados) {
					item.ganado.darDeBaja(fechaVenta, motivoVenta.getId());
					await this.ganadoRepository.save(item.ganado);
					detalles.push(
						TransaccionGanado.create({
							ganadoId: item.ganado.getId(),
							precio: item.precio,
							pesoRegistro: item.pesoRegistro,
							ganadoIdentificador: item.ganado.getIdentificador(),
						}),
					);
				}

				const transaccion = Transaccion.create({
					tipo: "VENTA",
					fecha: fechaVenta,
					contraparte: dto.contraparte,
					moneda: dto.moneda,
					documento: dto.documento,
					documentoAdjunto: documentoAdjuntoPath,
					observaciones: dto.observaciones,
					usuarioId: actor.id,
					detalles,
				});

				return this.transaccionRepository.save(transaccion);
			});

			return this.mapper.transaccionToDto(saved);
		} catch (error) {
			if (documentoAdjuntoPath) {
				await this.documentStorage.delete(documentoAdjuntoPath);
			}
			throw error;
		}
	}
}

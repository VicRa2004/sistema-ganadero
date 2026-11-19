import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { DocumentStorageService } from "@/core/shared/domain/services/DocumentStorageService";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { GanadoDuplicateIdentificadorError } from "@/modules/ganado/domain/error/GanadoDuplicateIdentificadorError";
import { Ganado } from "@/modules/ganado/domain/Ganado";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";
import type { RazaRepository } from "@/modules/raza/domain/repository/RazaRepository";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import { Transaccion } from "../../domain/Transaccion";
import { TransaccionGanado } from "../../domain/TransaccionGanado";
import type {
	RegistrarCompraInputDto,
	TransaccionOutputDto,
} from "../dtos/ComercialDto";
import type { ComercialMapper } from "../mappers/ComercialMapper";

@injectable()
export class RegistrarCompraGanadoUseCase {
	constructor(
		@inject("TransaccionRepository")
		private readonly transaccionRepository: TransaccionRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("ComercialMapper")
		private readonly mapper: ComercialMapper,
		@inject("DocumentStorageService")
		private readonly documentStorage: DocumentStorageService,
	) {}

	public async run(
		dto: RegistrarCompraInputDto,
		actor: Actor,
	): Promise<TransaccionOutputDto> {
		if (!dto.items || dto.items.length === 0) {
			throw new ValidationError("La compra debe incluir al menos un animal");
		}

		const fechaCompra = new Date(dto.fecha);
		if (Number.isNaN(fechaCompra.getTime())) {
			throw new ValidationError("La fecha de compra no es válida");
		}

		const aretesVistos = new Set<string>();
		for (const item of dto.items) {
			const ident = item.identificador.trim();
			const norm = ident.toUpperCase();
			if (aretesVistos.has(norm)) {
				throw new ValidationError(
					`El identificador "${ident}" está repetido en la compra`,
				);
			}
			aretesVistos.add(norm);

			const existente = await this.ganadoRepository.findByIdentificador(ident);
			if (existente) {
				throw new GanadoDuplicateIdentificadorError(ident);
			}

			const raza = await this.razaRepository.findById(item.razaId);
			if (!raza) {
				throw new RazaNotFoundError(item.razaId);
			}

			await this.ganadoAccess.obtenerTerreno(item.terrenoId, actor);
			await this.ganadoAccess.obtenerPropietario(item.propietarioId, actor);
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
				for (const item of dto.items) {
					const procedencia =
						item.procedencia?.trim() || dto.contraparte.trim();
					const nuevoGanado = Ganado.create(
						item.identificador.trim(),
						item.peso,
						new Date(item.fechaNacimiento),
						item.sexo,
						null,
						item.razaId,
						item.terrenoId,
						item.propietarioId,
						null,
						null,
						procedencia,
					);
					const creado = await this.ganadoRepository.save(nuevoGanado);
					detalles.push(
						TransaccionGanado.create({
							ganadoId: creado.getId(),
							precio: item.precio,
							pesoRegistro: creado.getPeso(),
							procedencia,
							ganadoIdentificador: creado.getIdentificador(),
						}),
					);
				}

				const transaccion = Transaccion.create({
					tipo: "COMPRA",
					fecha: fechaCompra,
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

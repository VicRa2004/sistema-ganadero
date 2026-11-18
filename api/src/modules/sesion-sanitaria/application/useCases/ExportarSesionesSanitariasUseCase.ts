import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { buildCsv } from "@/core/shared/infrastructure/libs/CsvBuilder";
import { PdfBuilder } from "@/core/shared/infrastructure/libs/PdfBuilder";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { VeterinarioRepository } from "@/modules/veterinario/domain/repository/VeterinarioRepository";
import type { EstadoSesionSanitaria } from "../../domain/SesionSanitaria";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { SesionSanitariaOutputDto } from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { ObtenerHistorialSanitarioGanadoUseCase } from "./ObtenerHistorialSanitarioGanadoUseCase";

export interface ExportarSesionesFilters {
	veterinarioId?: number;
	insumoId?: number;
	estado?: EstadoSesionSanitaria;
	busqueda?: string;
	fechaInicio?: Date;
	fechaFin?: Date;
}

@injectable()
export class ExportarSesionesSanitariasUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("VeterinarioRepository")
		private readonly veterinarioRepository: VeterinarioRepository,
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
		@inject("GanadoAccessService")
		private readonly ganadoAccessService: GanadoAccessService,
		@inject("ObtenerHistorialSanitarioGanadoUseCase")
		private readonly historialGanadoUseCase: ObtenerHistorialSanitarioGanadoUseCase,
	) {}

	private async obtenerSesiones(
		filters: ExportarSesionesFilters,
		actor: Actor,
	): Promise<SesionSanitariaOutputDto[]> {
		const res = await this.sesionRepository.find({
			page: 1,
			limit: 5000,
			...filters,
			actor,
		});

		const vetCache = new Map<number, string>();
		const insCache = new Map<number, { nombre: string; unidad: string }>();

		const dtos: SesionSanitariaOutputDto[] = [];
		for (const sesion of res.data) {
			if (!vetCache.has(sesion.getVeterinarioId())) {
				const vet = await this.veterinarioRepository.findById(
					sesion.getVeterinarioId(),
				);
				if (vet) vetCache.set(sesion.getVeterinarioId(), vet.getNombre());
			}
			if (!insCache.has(sesion.getInsumoId())) {
				const ins = await this.insumoRepository.findById(sesion.getInsumoId());
				if (ins) {
					insCache.set(sesion.getInsumoId(), {
						nombre: ins.getNombre(),
						unidad: ins.getUnidadMedida(),
					});
				}
			}
			const insInfo = insCache.get(sesion.getInsumoId());
			dtos.push(
				this.mapper.toDto(sesion, {
					nombreVeterinario: vetCache.get(sesion.getVeterinarioId()),
					nombreInsumo: insInfo?.nombre,
					unidadMedidaInsumo: insInfo?.unidad,
				}),
			);
		}
		return dtos;
	}

	public async exportarCsv(
		filters: ExportarSesionesFilters,
		actor: Actor,
	): Promise<string> {
		const sesiones = await this.obtenerSesiones(filters, actor);
		return buildCsv(
			[
				"ID",
				"Fecha",
				"Estado",
				"Descripción",
				"Veterinario",
				"Insumo",
				"Total Dosis",
				"Animales",
			],
			sesiones.map((s) => [
				s.id,
				s.fecha.slice(0, 10),
				s.estado,
				s.descripcion,
				s.nombreVeterinario ?? `Vet #${s.veterinarioId}`,
				s.nombreInsumo ?? `Insumo #${s.insumoId}`,
				`${s.totalDosisAplicadas} ${s.unidadMedidaInsumo ?? ""}`.trim(),
				s.totalAnimales,
			]),
		);
	}

	public async exportarPdf(
		filters: ExportarSesionesFilters,
		actor: Actor,
	): Promise<Uint8Array> {
		const sesiones = await this.obtenerSesiones(filters, actor);
		const pdf = new PdfBuilder(
			"Historial de Sesiones Sanitarias",
			`Total de jornadas: ${sesiones.length}`,
		);

		pdf.addSectionTitle("Sesiones Registradas");
		pdf.addTable(
			[
				{ header: "Fecha", widthRatio: 1.2 },
				{ header: "Estado", widthRatio: 1.1 },
				{ header: "Descripción", widthRatio: 2.5 },
				{ header: "Veterinario", widthRatio: 1.6 },
				{ header: "Insumo", widthRatio: 1.6 },
				{ header: "Dosis / Anim.", widthRatio: 1.3 },
			],
			sesiones.map((s) => [
				s.fecha.slice(0, 10),
				s.estado,
				s.descripcion,
				s.nombreVeterinario ?? `#${s.veterinarioId}`,
				s.nombreInsumo ?? `#${s.insumoId}`,
				`${s.totalDosisAplicadas} ${s.unidadMedidaInsumo ?? ""} (${s.totalAnimales})`,
			]),
		);

		return pdf.build();
	}

	public async exportarHistorialGanadoPdf(
		ganadoId: number,
		actor: Actor,
	): Promise<Uint8Array> {
		const ganado = await this.ganadoAccessService.obtenerGanado(
			ganadoId,
			actor,
		);
		const historial = await this.historialGanadoUseCase.run(ganadoId, actor);

		const pdf = new PdfBuilder(
			"Historial Sanitario Individual",
			`Arete: ${ganado.getIdentificador()} · Sexo: ${ganado.getSexo()}`,
		);

		pdf.addSectionTitle("Aplicaciones Sanitarias Realizadas");
		pdf.addTable(
			[
				{ header: "Fecha", widthRatio: 1.2 },
				{ header: "Jornada", widthRatio: 2.2 },
				{ header: "Insumo", widthRatio: 1.6 },
				{ header: "Dosis", widthRatio: 1 },
				{ header: "Veterinario", widthRatio: 1.5 },
				{ header: "Observaciones", widthRatio: 2 },
			],
			historial.map((h) => [
				h.fechaSesion.slice(0, 10),
				h.descripcionSesion,
				h.nombreInsumo ?? "-",
				`${h.dosisAplicada} ${h.unidadMedidaInsumo ?? ""}`.trim(),
				h.nombreVeterinario ?? "-",
				h.observaciones ?? "-",
			]),
		);

		return pdf.build();
	}
}

import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { buildCsv } from "@/core/shared/infrastructure/libs/CsvBuilder";
import { PdfBuilder } from "@/core/shared/infrastructure/libs/PdfBuilder";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { InsumoOutputDto } from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

export interface ExportarInsumosFilters {
	nombre?: string;
	tipo?: string;
	actor: Actor;
}

@injectable()
export class ExportarInsumosUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	private async obtenerInsumos(
		filters: ExportarInsumosFilters,
	): Promise<InsumoOutputDto[]> {
		const res = await this.insumoRepository.findAll({
			page: 1,
			limit: 5000,
			nombre: filters.nombre,
			tipo: filters.tipo,
			actor: filters.actor,
		});
		return res.data.map((i) => this.mapper.toDto(i));
	}

	public async exportarCsv(filters: ExportarInsumosFilters): Promise<string> {
		const items = await this.obtenerInsumos(filters);
		return buildCsv(
			[
				"ID",
				"Nombre",
				"Tipo",
				"Stock",
				"Stock Mínimo",
				"Unidad",
				"Lote",
				"Caducidad",
				"Retiro (días)",
				"Estado Stock",
			],
			items.map((item) => [
				item.id,
				item.nombre,
				item.tipo,
				item.stock,
				item.stockMinimo,
				item.unidadMedida,
				item.lote,
				item.fechaCaducidad.slice(0, 10),
				item.periodoRetiroDias,
				item.esBajoStock ? "CRITICO" : "NORMAL",
			]),
		);
	}

	public async exportarPdf(
		filters: ExportarInsumosFilters,
	): Promise<Uint8Array> {
		const items = await this.obtenerInsumos(filters);
		const criticos = items.filter((i) => i.esBajoStock).length;

		const pdf = new PdfBuilder(
			"Inventario de Insumos",
			`Total de productos: ${items.length} · Stock crítico: ${criticos}`,
		);

		pdf.addSectionTitle("Listado de Insumos");
		pdf.addTable(
			[
				{ header: "Nombre", widthRatio: 2.5 },
				{ header: "Tipo", widthRatio: 1.4 },
				{ header: "Stock", widthRatio: 1.2 },
				{ header: "Mínimo", widthRatio: 1 },
				{ header: "Lote", widthRatio: 1.3 },
				{ header: "Caducidad", widthRatio: 1.3 },
				{ header: "Retiro", widthRatio: 0.9 },
			],
			items.map((i) => [
				i.nombre,
				i.tipo,
				`${i.stock} ${i.unidadMedida}`,
				`${i.stockMinimo} ${i.unidadMedida}`,
				i.lote,
				i.fechaCaducidad.slice(0, 10),
				i.periodoRetiroDias > 0 ? `${i.periodoRetiroDias} d` : "-",
			]),
		);

		return pdf.build();
	}
}

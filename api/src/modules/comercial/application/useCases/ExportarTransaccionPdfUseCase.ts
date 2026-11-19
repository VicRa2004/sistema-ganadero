import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { PdfBuilder } from "@/core/shared/infrastructure/libs/PdfBuilder";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class ExportarTransaccionPdfUseCase {
	constructor(
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<Uint8Array> {
		const tr = await this.accessService.obtenerTransaccion(id, actor);
		const pdf = new PdfBuilder(
			`Comprobante de ${tr.getTipo()} #${tr.getId()}`,
			`Contraparte: ${tr.getContraparte()} · Fecha: ${tr.getFecha().toISOString().slice(0, 10)}`,
		);

		pdf.addSectionTitle("Datos de la Operación");
		pdf.addInfoGrid([
			{ label: "Tipo", value: tr.getTipo() },
			{ label: "Fecha", value: tr.getFecha().toISOString().slice(0, 10) },
			{ label: "Contraparte", value: tr.getContraparte() },
			{
				label: "Total",
				value: `${tr.getTotal().toFixed(2)} ${tr.getMoneda()}`,
			},
			{ label: "Guía / Documento", value: tr.getDocumento() ?? "-" },
			{ label: "Cabezas", value: String(tr.getDetalles().length) },
		]);

		if (tr.getObservaciones()) {
			pdf.addParagraph(`Observaciones: ${tr.getObservaciones()}`);
		}

		pdf.addSectionTitle("Detalle de Animales");
		pdf.addTable(
			[
				{ header: "Arete", widthRatio: 2 },
				{ header: "Peso (kg)", widthRatio: 1.5 },
				{ header: "Procedencia", widthRatio: 2 },
				{ header: `Precio (${tr.getMoneda()})`, widthRatio: 1.5 },
			],
			tr
				.getDetalles()
				.map((d) => [
					d.getGanadoIdentificador() || `#${d.getGanadoId()}`,
					d.getPesoRegistro().toFixed(1),
					d.getProcedencia() ?? "-",
					d.getPrecio().toFixed(2),
				]),
		);

		return pdf.build();
	}
}

import { describe, expect, it } from "bun:test";
import { buildCsv } from "./CsvBuilder";
import { parseCsv } from "./CsvParser";
import { PdfBuilder } from "./PdfBuilder";

describe("CsvBuilder & CsvParser", () => {
	it("construye CSV con BOM UTF-8 y escapa comas, comillas y fórmulas", () => {
		const csv = buildCsv(
			["identificador", "nota", "peso"],
			[
				["AR-01", 'Con "comillas", y coma', 420.5],
				["=CMD()", "+SUM(A1)", -10],
			],
		);
		expect(csv.startsWith("\uFEFF")).toBe(true);
		const parsed = parseCsv(csv);
		expect(parsed.headers).toEqual(["identificador", "nota", "peso"]);
		expect(parsed.rows).toHaveLength(2);
		expect(parsed.rows[0]?.values.nota).toBe('Con "comillas", y coma');
		expect(parsed.rows[1]?.values.identificador).toBe("'=CMD()");
		expect(parsed.rows[1]?.values.peso).toBe("-10");
	});

	it("parsea líneas vacías y CRLF correctamente", () => {
		const parsed = parseCsv("a,b\r\n1,2\r\n\r\n3,4\r\n");
		expect(parsed.rows).toHaveLength(2);
		expect(parsed.rows[1]?.rowNumber).toBe(3);
		expect(parsed.rows[1]?.values).toEqual({ a: "3", b: "4" });
	});
});

describe("PdfBuilder", () => {
	it("genera un PDF 1.4 válido multipágina con acentos y tablas", () => {
		const pdf = new PdfBuilder("Ficha del Animal", "Arete AR-001");
		pdf.addCallout("En período de retiro hasta 2026-12-01", true);
		pdf.addInfoGrid([
			{ label: "Raza", value: "Angus" },
			{ label: "Terreno", value: "Potrero Norte" },
		]);
		pdf.addSectionTitle("Historial de Pesajes");
		const rows = Array.from({ length: 45 }, (_, i) => [
			`2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
			`${300 + i} kg`,
			`Observación número ${i + 1}`,
		]);
		pdf.addTable(
			[
				{ header: "Fecha", widthRatio: 2 },
				{ header: "Peso", widthRatio: 1 },
				{ header: "Observaciones", widthRatio: 3 },
			],
			rows,
		);
		const bytes = pdf.build();
		const text = Buffer.from(bytes).toString("latin1");
		expect(text.startsWith("%PDF-1.4")).toBe(true);
		expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
		expect(text).toContain("/Count 2");
		expect(text).toContain("Ficha del Animal");
	});
});

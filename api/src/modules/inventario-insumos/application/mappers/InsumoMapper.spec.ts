import { describe, expect, it } from "bun:test";
import { Insumo } from "../../domain/Insumo";
import { InsumoMapper } from "./InsumoMapper";

describe("InsumoMapper", () => {
	const mapper = new InsumoMapper();

	it("debe transformar una entidad Insumo a InsumoOutputDto", () => {
		const fecha = new Date("2027-06-15T00:00:00.000Z");
		const insumo = Insumo.reconstitute(
			10,
			"Desparasitante",
			"MEDICAMENTO",
			40,
			50,
			"ml",
			"LOT-ABC",
			fecha,
		);

		const dto = mapper.toDto(insumo);

		expect(dto).toEqual({
			id: 10,
			nombre: "Desparasitante",
			tipo: "MEDICAMENTO",
			stock: 40,
			stockMinimo: 50,
			unidadMedida: "ml",
			lote: "LOT-ABC",
			fechaCaducidad: fecha.toISOString(),
			esBajoStock: true,
		});
	});
});

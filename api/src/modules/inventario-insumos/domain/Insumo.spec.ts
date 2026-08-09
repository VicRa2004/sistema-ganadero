import { describe, expect, it } from "bun:test";
import { Insumo } from "./Insumo";
import { InsumoCantidadInvalidaError } from "./error/InsumoCantidadInvalidaError";
import { InsumoStockInsuficienteError } from "./error/InsumoStockInsuficienteError";

describe("Entidad de Dominio: Insumo", () => {
	const fechaCaducidad = new Date("2027-12-31");
	const usuarioId = 1;

	it("debe crear un nuevo insumo con datos válidos", () => {
		const insumo = Insumo.create(
			"Ivermectina 1%",
			"MEDICAMENTO",
			500,
			100,
			"ml",
			"LOT-001",
			fechaCaducidad,
			usuarioId,
		);

		expect(insumo.getNombre()).toBe("Ivermectina 1%");
		expect(insumo.getTipo()).toBe("MEDICAMENTO");
		expect(insumo.getStock()).toBe(500);
		expect(insumo.getStockMinimo()).toBe(100);
		expect(insumo.getUnidadMedida()).toBe("ml");
		expect(insumo.getLote()).toBe("LOT-001");
		expect(insumo.getFechaCaducidad()).toEqual(fechaCaducidad);
		expect(insumo.getUsuarioId()).toBe(usuarioId);
		expect(insumo.esNuevo()).toBeTrue();
		expect(insumo.esBajoStock()).toBeFalse();
	});

	it("debe lanzar un error si el nombre está vacío", () => {
		expect(() =>
			Insumo.create(
				"",
				"MEDICAMENTO",
				10,
				5,
				"ml",
				"LOT-001",
				fechaCaducidad,
				usuarioId,
			),
		).toThrow("El nombre del insumo no puede estar vacío");
	});

	it("debe lanzar un error si el stock inicial es negativo", () => {
		expect(() =>
			Insumo.create(
				"Antibiótico",
				"MEDICAMENTO",
				-5,
				5,
				"ml",
				"LOT-001",
				fechaCaducidad,
				usuarioId,
			),
		).toThrow("El stock inicial no puede ser negativo");
	});

	it("debe reconstituir un insumo existente desde la base de datos", () => {
		const insumo = Insumo.reconstitute(
			42,
			"Vacuna Triple",
			"VACUNA",
			20,
			50,
			"dosis",
			"LOT-002",
			fechaCaducidad,
			usuarioId,
		);

		expect(insumo.getId()).toBe(42);
		expect(insumo.getUsuarioId()).toBe(usuarioId);
		expect(insumo.esNuevo()).toBeFalse();
		expect(insumo.esBajoStock()).toBeTrue();
	});

	it("debe adicionar stock correctamente", () => {
		const insumo = Insumo.reconstitute(
			1,
			"Alimento",
			"ALIMENTO",
			100,
			200,
			"kg",
			"LOT-003",
			fechaCaducidad,
			usuarioId,
		);

		insumo.adicionarStock(150);

		expect(insumo.getStock()).toBe(250);
		expect(insumo.esBajoStock()).toBeFalse();
	});

	it("debe lanzar InsumoCantidadInvalidaError al adicionar cero o cantidad negativa", () => {
		const insumo = Insumo.create(
			"Alimento",
			"ALIMENTO",
			100,
			50,
			"kg",
			"LOT-003",
			fechaCaducidad,
			usuarioId,
		);

		expect(() => insumo.adicionarStock(0)).toThrow(InsumoCantidadInvalidaError);
		expect(() => insumo.adicionarStock(-10)).toThrow(
			InsumoCantidadInvalidaError,
		);
	});

	it("debe descontar stock correctamente", () => {
		const insumo = Insumo.reconstitute(
			1,
			"Alimento",
			"ALIMENTO",
			100,
			50,
			"kg",
			"LOT-003",
			fechaCaducidad,
			usuarioId,
		);

		insumo.descontarStock(40);

		expect(insumo.getStock()).toBe(60);
		expect(insumo.esBajoStock()).toBeFalse();
	});

	it("debe lanzar InsumoStockInsuficienteError si la cantidad a descontar supera el stock actual", () => {
		const insumo = Insumo.reconstitute(
			1,
			"Medicamento",
			"MEDICAMENTO",
			30,
			10,
			"ml",
			"LOT-004",
			fechaCaducidad,
			usuarioId,
		);

		expect(() => insumo.descontarStock(50)).toThrow(
			InsumoStockInsuficienteError,
		);
	});
});

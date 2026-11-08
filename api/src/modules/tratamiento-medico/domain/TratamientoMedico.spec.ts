import { describe, expect, it } from "bun:test";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { TratamientoMedico } from "./TratamientoMedico";

describe("TratamientoMedico Domain Entity", () => {
	const fechaInicio = new Date("2026-05-01T00:00:00.000Z");
	const fechaFin = new Date("2026-05-10T23:59:59.000Z");

	it("crea un tratamiento médico válido con valores por defecto", () => {
		const tratamiento = TratamientoMedico.create(
			10,
			"  Infección respiratoria bovina  ",
			fechaInicio,
			fechaFin,
			5,
			12.5,
		);

		expect(tratamiento.esNuevo()).toBe(true);
		expect(tratamiento.getGanadoId()).toBe(10);
		expect(tratamiento.getDiagnostico()).toBe("Infección respiratoria bovina");
		expect(tratamiento.getFechaInicio()).toEqual(fechaInicio);
		expect(tratamiento.getFechaFin()).toEqual(fechaFin);
		expect(tratamiento.esActivo()).toBe(true);
		expect(tratamiento.getInsumoId()).toBe(5);
		expect(tratamiento.getDosisDiaria()).toBe(12.5);
		expect(tratamiento.getVeterinarioId()).toBeNull();
	});

	it("reconstituye un tratamiento persistido con su ID y relaciones", () => {
		const createdAt = new Date("2026-05-01T10:00:00.000Z");
		const tratamiento = TratamientoMedico.reconstitute(
			42,
			10,
			"Mastitis aguda",
			fechaInicio,
			fechaFin,
			true,
			5,
			8,
			3,
			{
				ganadoIdentificador: "ARETE-010",
				insumoNombre: "Penicilina",
				insumoUnidad: "ml",
				veterinarioNombre: "Dra. Gómez",
				createdAt,
				updatedAt: null,
			},
		);

		expect(tratamiento.esNuevo()).toBe(false);
		expect(tratamiento.getId()).toBe(42);
		expect(tratamiento.getVeterinarioId()).toBe(3);
		expect(tratamiento.getRelaciones()?.ganadoIdentificador).toBe("ARETE-010");
		expect(tratamiento.getRelaciones()?.insumoNombre).toBe("Penicilina");
		expect(tratamiento.getRelaciones()?.veterinarioNombre).toBe("Dra. Gómez");
	});

	it("rechaza diagnósticos vacíos o solo con espacios", () => {
		expect(() =>
			TratamientoMedico.create(10, "   ", fechaInicio, fechaFin, 5, 10),
		).toThrow(ValidationError);
	});

	it("rechaza fechaFin anterior a fechaInicio", () => {
		const fechaFinInvalida = new Date("2026-04-30T00:00:00.000Z");
		expect(() =>
			TratamientoMedico.create(
				10,
				"Fiebre aftosa",
				fechaInicio,
				fechaFinInvalida,
				5,
				10,
			),
		).toThrow(ValidationError);
	});

	it("rechaza fechas inválidas", () => {
		expect(() =>
			TratamientoMedico.create(
				10,
				"Fiebre",
				new Date("invalid"),
				fechaFin,
				5,
				10,
			),
		).toThrow(ValidationError);
	});

	it("rechaza IDs no positivos o dosis diaria menor o igual a cero", () => {
		expect(() =>
			TratamientoMedico.create(0, "Diagnóstico", fechaInicio, fechaFin, 5, 10),
		).toThrow(ValidationError);

		expect(() =>
			TratamientoMedico.create(10, "Diagnóstico", fechaInicio, fechaFin, 0, 10),
		).toThrow(ValidationError);

		expect(() =>
			TratamientoMedico.create(10, "Diagnóstico", fechaInicio, fechaFin, 5, 0),
		).toThrow(ValidationError);

		expect(() =>
			TratamientoMedico.create(10, "Diagnóstico", fechaInicio, fechaFin, 5, -3),
		).toThrow(ValidationError);

		expect(() =>
			TratamientoMedico.create(
				10,
				"Diagnóstico",
				fechaInicio,
				fechaFin,
				5,
				10,
				0,
			),
		).toThrow(ValidationError);
	});

	it("finaliza un tratamiento activo y rechaza finalizar uno ya finalizado", () => {
		const tratamiento = TratamientoMedico.create(
			10,
			"Parasitosis",
			fechaInicio,
			fechaFin,
			5,
			10,
		);

		expect(tratamiento.esActivo()).toBe(true);
		tratamiento.finalizarTratamiento();
		expect(tratamiento.esActivo()).toBe(false);

		expect(() => tratamiento.finalizarTratamiento()).toThrow(ValidationError);
	});

	it("actualiza los datos del tratamiento validando las reglas de negocio", () => {
		const tratamiento = TratamientoMedico.reconstitute(
			1,
			10,
			"Diagnóstico inicial",
			fechaInicio,
			fechaFin,
			true,
			5,
			10,
			null,
		);

		const nuevaFechaFin = new Date("2026-05-15T23:59:59.000Z");
		tratamiento.actualizar(
			"  Diagnóstico actualizado  ",
			fechaInicio,
			nuevaFechaFin,
			7,
			15,
			4,
			false,
		);

		expect(tratamiento.getDiagnostico()).toBe("Diagnóstico actualizado");
		expect(tratamiento.getFechaFin()).toEqual(nuevaFechaFin);
		expect(tratamiento.getInsumoId()).toBe(7);
		expect(tratamiento.getDosisDiaria()).toBe(15);
		expect(tratamiento.getVeterinarioId()).toBe(4);
		expect(tratamiento.esActivo()).toBe(false);

		expect(() =>
			tratamiento.actualizar(
				"Diagnóstico válido",
				fechaInicio,
				nuevaFechaFin,
				7,
				0,
				4,
			),
		).toThrow(ValidationError);
	});
});

import { describe, expect, it } from "bun:test";
import { gananciaDiaria } from "./Pesaje";

const dia = (n: number) => new Date(Date.UTC(2026, 0, 1 + n));

describe("gananciaDiaria", () => {
	it("divide la diferencia de peso entre los días transcurridos", () => {
		expect(
			gananciaDiaria(
				{ peso: 300, fecha: dia(0) },
				{ peso: 320, fecha: dia(10) },
			),
		).toBeCloseTo(2);
	});

	it("es negativa cuando el animal pierde peso", () => {
		expect(
			gananciaDiaria(
				{ peso: 320, fecha: dia(0) },
				{ peso: 300, fecha: dia(5) },
			),
		).toBeCloseTo(-4);
	});

	it("devuelve null si ambos pesajes son del mismo instante", () => {
		expect(
			gananciaDiaria(
				{ peso: 300, fecha: dia(0) },
				{ peso: 310, fecha: dia(0) },
			),
		).toBeNull();
	});
});

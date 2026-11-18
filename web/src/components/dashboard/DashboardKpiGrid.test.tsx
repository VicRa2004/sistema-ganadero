import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardKpiGrid } from "./DashboardKpiGrid";

describe("DashboardKpiGrid", () => {
	it("muestra los KPIs principales del rancho incluyendo peso, GDP, alertas y retiro", () => {
		render(
			<DashboardKpiGrid
				totales={{
					cabezasActivas: 42,
					cabezasTotales: 45,
					capacidadTotal: 60,
					ocupacionPorcentaje: 70,
					terrenosCount: 3,
					insumosCriticosCount: 2,
					insumosPorCaducarCount: 1,
					tratamientosActivosCount: 3,
					sesionesProgramadasCount: 1,
					animalesEnRetiroCount: 2,
					pesoPromedioKg: 385.5,
					gdpPromedioKgDia: 0.725,
				}}
			/>,
		);

		expect(screen.getByText("42")).toBeInTheDocument();
		expect(screen.getByText("70%")).toBeInTheDocument();
		expect(screen.getByText("385.5 kg")).toBeInTheDocument();
		expect(screen.getByText("GDP promedio: 0.725 kg/día")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});
});

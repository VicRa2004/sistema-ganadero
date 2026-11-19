import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InsumoDto } from "@/modules/inventario-insumos/types";
import { AjustarStockDialog } from "./AjustarStockDialog";
import { ConsumirInsumoDialog } from "./ConsumirInsumoDialog";

const mockConsumir = vi.fn();
const mockAjustar = vi.fn();

vi.mock("@/modules/inventario-insumos/hooks/useConsumirInsumo", () => ({
	useConsumirInsumo: () => ({ mutate: mockConsumir, isPending: false }),
}));

vi.mock("@/modules/inventario-insumos/hooks/useAjustarStockInsumo", () => ({
	useAjustarStockInsumo: () => ({ mutate: mockAjustar, isPending: false }),
}));

const sampleInsumo: InsumoDto = {
	id: 5,
	nombre: "Ivermectina 1%",
	tipo: "MEDICAMENTO",
	stock: 25,
	stockMinimo: 5,
	unidadMedida: "ml",
	lote: "LOT-01",
	fechaCaducidad: "2027-01-01",
	periodoRetiroDias: 14,
	costoUnitario: 12.5,
	esBajoStock: false,
	usuarioId: 1,
};

describe("InsumoForms accessibility and validation", () => {
	beforeEach(() => {
		mockConsumir.mockReset();
		mockAjustar.mockReset();
	});

	it("ConsumirInsumoDialog inicia aria-invalid='false', anuncia error en inválido y envía cuando es válido", async () => {
		const onOpenChange = vi.fn();
		render(
			<ConsumirInsumoDialog
				open={true}
				onOpenChange={onOpenChange}
				insumo={sampleInsumo}
			/>,
		);

		const cantidadInput = screen.getByLabelText(/Cantidad a Consumir/i);
		expect(cantidadInput).toHaveAttribute("aria-invalid", "false");

		fireEvent.change(cantidadInput, { target: { value: "100" } });
		fireEvent.click(screen.getByRole("button", { name: /Confirmar Consumo/i }));

		await waitFor(() => {
			expect(cantidadInput).toHaveAttribute("aria-invalid", "true");
			expect(cantidadInput).toHaveAttribute(
				"aria-describedby",
				"cantidad-error",
			);
			expect(screen.getByRole("status").textContent).toMatch(/1 campo/i);
		});
		expect(mockConsumir).not.toHaveBeenCalled();

		fireEvent.change(cantidadInput, { target: { value: "5" } });
		fireEvent.click(screen.getByRole("button", { name: /Confirmar Consumo/i }));

		await waitFor(() => {
			expect(mockConsumir).toHaveBeenCalledWith(
				{ cantidad: 5 },
				expect.any(Object),
			);
		});
	});

	it("AjustarStockDialog bloquea variación 0/vacía y envía delta + motivo válidos", async () => {
		render(
			<AjustarStockDialog
				open={true}
				onOpenChange={vi.fn()}
				insumo={sampleInsumo}
			/>,
		);

		const deltaInput = screen.getByLabelText(/Variación/i);
		const motivoInput = screen.getByLabelText(/Motivo de ajuste/i);
		expect(deltaInput).toHaveAttribute("aria-invalid", "false");

		fireEvent.click(screen.getByRole("button", { name: /Aplicar ajuste/i }));

		await waitFor(() => {
			expect(deltaInput).toHaveAttribute("aria-invalid", "true");
			expect(motivoInput).toHaveAttribute("aria-invalid", "true");
		});
		expect(mockAjustar).not.toHaveBeenCalled();

		fireEvent.change(deltaInput, { target: { value: "-2" } });
		fireEvent.change(motivoInput, { target: { value: "Conteo mensual" } });
		fireEvent.click(screen.getByRole("button", { name: /Aplicar ajuste/i }));

		await waitFor(() => {
			expect(mockAjustar).toHaveBeenCalledWith(
				{ cantidadDelta: -2, motivo: "Conteo mensual" },
				expect.any(Object),
			);
		});
	});
});

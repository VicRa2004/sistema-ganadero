import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegistrarVentaDialog } from "./RegistrarVentaDialog";

const mockRegistrarVenta = vi.fn();

vi.mock("@/modules/comercial/hooks/useComercial", () => ({
	useRegistrarVenta: () => ({ mutate: mockRegistrarVenta, isPending: false }),
}));

vi.mock("@/components/ganado/GanadoSelectorModal", () => ({
	GanadoSelectorModal: ({
		open,
		onSelect,
	}: {
		open: boolean;
		onSelect: (g: { id: number; identificador: string; peso: number }) => void;
	}) =>
		open ? (
			<button
				type="button"
				onClick={() =>
					onSelect({ id: 9, identificador: "AR-VENTA-9", peso: 450 })
				}
			>
				Seleccionar AR-VENTA-9
			</button>
		) : null,
}));

describe("RegistrarVentaDialog", () => {
	beforeEach(() => {
		mockRegistrarVenta.mockReset();
	});

	it("valida campos requeridos y envía payload completo de venta", async () => {
		render(<RegistrarVentaDialog open={true} onOpenChange={vi.fn()} />);

		const contraparte = screen.getByLabelText(/Comprador \/ Contraparte/i);
		expect(contraparte).toHaveAttribute("aria-invalid", "false");

		fireEvent.click(screen.getByRole("button", { name: /Confirmar venta/i }));

		await waitFor(() => {
			expect(contraparte).toHaveAttribute("aria-invalid", "true");
		});
		expect(mockRegistrarVenta).not.toHaveBeenCalled();

		fireEvent.change(contraparte, { target: { value: "Rastro Central" } });
		fireEvent.click(screen.getByRole("button", { name: /Añadir animal/i }));
		fireEvent.click(
			screen.getByRole("button", {
				name: /Seleccionar AR-VENTA-9/i,
				hidden: true,
			}),
		);

		fireEvent.click(screen.getByRole("button", { name: /Confirmar venta/i }));

		await waitFor(() => {
			expect(mockRegistrarVenta).toHaveBeenCalledWith(
				expect.objectContaining({
					contraparte: "Rastro Central",
					items: [{ ganadoId: 9, precio: 15000, pesoRegistro: 450 }],
				}),
				expect.any(Object),
			);
		});
	});
});

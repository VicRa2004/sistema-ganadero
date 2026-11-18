import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenealogiaCard } from "./GenealogiaCard";
import { HistorialPesajesCard } from "./HistorialPesajesCard";

const mockUseObtenerGenealogia = vi.fn();
const mockUseListarPesajes = vi.fn();

vi.mock("@/modules/ganado/hooks/useObtenerGenealogia", () => ({
	useObtenerGenealogia: (id: number, gen: number) =>
		mockUseObtenerGenealogia(id, gen),
}));

vi.mock("@/modules/ganado/hooks/useListarPesajes", () => ({
	useListarPesajes: (id: number) => mockUseListarPesajes(id),
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		className,
	}: {
		children: ReactNode;
		to: string;
		params?: Record<string, string>;
		className?: string;
	}) => {
		const href = params?.id ? to.replace("$id", params.id) : to;
		return (
			<a href={href} className={className}>
				{children}
			</a>
		);
	},
}));

describe("GenealogiaCard", () => {
	beforeEach(() => {
		mockUseObtenerGenealogia.mockReset();
	});

	it("muestra el árbol genealógico de 3 generaciones y descendencia", () => {
		mockUseObtenerGenealogia.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				generaciones: 3,
				animal: {
					id: 10,
					identificador: "BEC-10",
					sexo: "MACHO",
					fechaNacimiento: "2025-01-01",
					peso: 210,
					razaNombre: "Angus",
					fechaBaja: null,
					padre: {
						id: 5,
						identificador: "TORO-5",
						sexo: "MACHO",
						fechaNacimiento: "2022-01-01",
						peso: 620,
						razaNombre: "Angus",
						fechaBaja: null,
						padre: null,
						madre: null,
					},
					madre: {
						id: 6,
						identificador: "VACA-6",
						sexo: "HEMBRA",
						fechaNacimiento: "2022-02-01",
						peso: 480,
						razaNombre: "Angus",
						fechaBaja: null,
						padre: null,
						madre: null,
					},
				},
				descendencia: [
					{
						id: 20,
						identificador: "CRIA-20",
						sexo: "HEMBRA",
						fechaNacimiento: "2026-02-01",
						peso: 45,
						razaNombre: "Angus",
						fechaBaja: null,
					},
				],
			},
		});

		render(<GenealogiaCard ganadoId={10} />);

		expect(screen.getByText("BEC-10")).toBeInTheDocument();
		expect(screen.getByText("TORO-5")).toBeInTheDocument();
		expect(screen.getByText("VACA-6")).toBeInTheDocument();
		expect(screen.getByText("Descendencia directa (1)")).toBeInTheDocument();
		expect(screen.getByText("CRIA-20")).toBeInTheDocument();
	});
});

describe("HistorialPesajesCard", () => {
	beforeEach(() => {
		mockUseListarPesajes.mockReset();
	});

	it("muestra la comparación contra el promedio de raza y edad", () => {
		mockUseListarPesajes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				pesajes: [
					{
						id: 1,
						peso: 320,
						fecha: "2026-10-01T00:00:00.000Z",
						observaciones: null,
						gananciaDiaria: null,
					},
				],
				gananciaDiariaAcumulada: null,
				perdidaDePeso: false,
				comparacionRazaEdad: {
					pesoActual: 320,
					razaNombre: "Angus",
					edadMeses: 18,
					promedioRazaEdad: 300,
					cantidadMuestra: 4,
					diferenciaKg: 20,
					porcentajeDiferencia: 6.7,
				},
			},
		});

		render(<HistorialPesajesCard ganadoId={10} />);

		expect(screen.getByText(/300 kg/)).toBeInTheDocument();
		expect(screen.getByText(/\+20 kg/)).toBeInTheDocument();
		expect(screen.getByText(/muestra: 4/)).toBeInTheDocument();
	});
});

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistorialSanitarioCard } from "./HistorialSanitarioCard";
import { HistorialTratamientosCard } from "./HistorialTratamientosCard";

const mockUseObtenerTratamientosGanado = vi.fn();
const mockUseObtenerHistorialSanitarioGanado = vi.fn();

vi.mock(
	"@/modules/tratamiento-medico/hooks/useObtenerTratamientosGanado",
	() => ({
		useObtenerTratamientosGanado: (ganadoId: number) =>
			mockUseObtenerTratamientosGanado(ganadoId),
	}),
);

vi.mock(
	"@/modules/sesion-sanitaria/hooks/useObtenerHistorialSanitarioGanado",
	() => ({
		useObtenerHistorialSanitarioGanado: (ganadoId: number | null) =>
			mockUseObtenerHistorialSanitarioGanado(ganadoId),
	}),
);

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

describe("HistorialTratamientosCard", () => {
	beforeEach(() => {
		mockUseObtenerTratamientosGanado.mockReset();
	});

	it("muestra estado de carga cuando los tratamientos se están consultando", () => {
		mockUseObtenerTratamientosGanado.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		});

		render(<HistorialTratamientosCard ganadoId={10} />);

		expect(screen.getByText("Tratamientos médicos")).toBeInTheDocument();
		expect(screen.getByText("Cargando…")).toBeInTheDocument();
	});

	it("muestra mensaje de error cuando falla la consulta de tratamientos", () => {
		mockUseObtenerTratamientosGanado.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		});

		render(<HistorialTratamientosCard ganadoId={10} />);

		expect(
			screen.getByText("No se pudo cargar los tratamientos médicos."),
		).toBeInTheDocument();
	});

	it("muestra mensaje vacío cuando el animal no tiene tratamientos registrados", () => {
		mockUseObtenerTratamientosGanado.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		render(<HistorialTratamientosCard ganadoId={10} />);

		expect(
			screen.getByText("Sin tratamientos médicos registrados."),
		).toBeInTheDocument();
	});

	it("renderiza la tabla de tratamientos médicos con diagnóstico, medicamento, estado y enlace al detalle", () => {
		mockUseObtenerTratamientosGanado.mockReturnValue({
			data: [
				{
					id: 42,
					ganadoId: 10,
					diagnostico: "Mastitis infecciosa",
					fechaInicio: "2026-10-01T00:00:00.000Z",
					fechaFin: "2026-10-07T00:00:00.000Z",
					activo: true,
					insumoId: 5,
					insumoNombre: "Penicilina G",
					insumoUnidad: "ml",
					dosisDiaria: 15,
					veterinarioId: 3,
					veterinarioNombre: "Dr. Carlos Ruiz",
				},
				{
					id: 43,
					ganadoId: 10,
					diagnostico: "Infección respiratoria",
					fechaInicio: "2026-09-01T00:00:00.000Z",
					fechaFin: "2026-09-05T00:00:00.000Z",
					activo: false,
					insumoId: 8,
					dosisDiaria: 10,
					veterinarioId: null,
				},
			],
			isLoading: false,
			isError: false,
		});

		render(<HistorialTratamientosCard ganadoId={10} />);

		expect(screen.getByText("Mastitis infecciosa")).toBeInTheDocument();
		expect(screen.getByText("Penicilina G")).toBeInTheDocument();
		expect(screen.getByText("15 ml")).toBeInTheDocument();
		expect(screen.getByText("Dr. Carlos Ruiz")).toBeInTheDocument();
		expect(screen.getByText("Activo")).toBeInTheDocument();

		expect(screen.getByText("Infección respiratoria")).toBeInTheDocument();
		expect(screen.getByText("Insumo #8")).toBeInTheDocument();
		expect(screen.getByText("10 unidades")).toBeInTheDocument();
		expect(screen.getByText("Concluido")).toBeInTheDocument();

		const detailLinks = screen.getAllByRole("link", { name: /Ver/i });
		expect(detailLinks[0]).toHaveAttribute(
			"href",
			"/dashboard/tratamientos-medicos/42",
		);
	});
});

describe("HistorialSanitarioCard", () => {
	beforeEach(() => {
		mockUseObtenerHistorialSanitarioGanado.mockReset();
	});

	it("muestra estado de carga cuando el historial sanitario se está consultando", () => {
		mockUseObtenerHistorialSanitarioGanado.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		});

		render(<HistorialSanitarioCard ganadoId={10} />);

		expect(screen.getByText("Historial sanitario")).toBeInTheDocument();
		expect(screen.getByText("Cargando…")).toBeInTheDocument();
	});

	it("muestra mensaje de error cuando falla la consulta del historial sanitario", () => {
		mockUseObtenerHistorialSanitarioGanado.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		});

		render(<HistorialSanitarioCard ganadoId={10} />);

		expect(
			screen.getByText("No se pudo cargar el historial sanitario."),
		).toBeInTheDocument();
	});

	it("muestra mensaje vacío cuando no hay aplicaciones sanitarias registradas", () => {
		mockUseObtenerHistorialSanitarioGanado.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		render(<HistorialSanitarioCard ganadoId={10} />);

		expect(
			screen.getByText("Sin aplicaciones sanitarias registradas."),
		).toBeInTheDocument();
	});

	it("renderiza las aplicaciones sanitarias con sesión, insumo, dosis, veterinario y observaciones", () => {
		mockUseObtenerHistorialSanitarioGanado.mockReturnValue({
			data: [
				{
					aplicacionId: 101,
					sesionId: 12,
					fechaSesion: "2026-10-10T12:00:00.000Z",
					descripcionSesion: "Vacunación anual contra brucelosis",
					nombreVeterinario: "Dra. Elena Gómez",
					nombreInsumo: "Vacuna RB51",
					unidadMedidaInsumo: "ml",
					dosisAplicada: 2,
					observaciones: "Sin reacción adversa",
				},
			],
			isLoading: false,
			isError: false,
		});

		render(<HistorialSanitarioCard ganadoId={10} />);

		expect(
			screen.getByText("Vacunación anual contra brucelosis"),
		).toBeInTheDocument();
		expect(screen.getByText("Vacuna RB51")).toBeInTheDocument();
		expect(screen.getByText("2 ml")).toBeInTheDocument();
		expect(screen.getByText("Dra. Elena Gómez")).toBeInTheDocument();
		expect(screen.getByText("Sin reacción adversa")).toBeInTheDocument();
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampoTexto } from "./CampoTexto";

describe("CampoTexto", () => {
	it("muestra los errores de Zod y marca el input como inválido", () => {
		render(
			<CampoTexto
				id="nombre"
				label="Nombre"
				errors={[{ message: "Requerido" }]}
			/>,
		);

		const input = screen.getByLabelText("Nombre");
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(screen.getByText("Requerido")).toBeInTheDocument();
	});

	it("no muestra errores si no los hay", () => {
		render(<CampoTexto id="nombre" label="Nombre" />);

		expect(screen.getByLabelText("Nombre")).toHaveAttribute(
			"aria-invalid",
			"false",
		);
	});
});

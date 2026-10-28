import { describe, expect, it } from "vitest";
import { formatApiError } from "./utils";

const apiError = (error: unknown) => ({ response: { data: { error } } });

describe("formatApiError", () => {
	it("usa el mensaje del formato { error: { message } }", () => {
		expect(formatApiError(apiError({ message: "Ya existe" }))).toBe(
			"Ya existe",
		);
	});

	it("une los detalles de validación por campo", () => {
		const error = apiError({
			message: "Validación",
			details: { email: ["inválido"], name: "requerido" },
		});
		expect(formatApiError(error)).toBe("email: inválido. name: requerido");
	});

	it("cae al mensaje del error de red", () => {
		expect(formatApiError(new Error("Network Error"))).toBe("Network Error");
	});
});

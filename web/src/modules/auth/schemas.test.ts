import { describe, expect, it } from "vitest";
import { passwordSchema } from "./schemas";

describe("passwordSchema", () => {
	it("acepta una contraseña que cumple la política", () => {
		expect(passwordSchema.safeParse("Abcdefgh1234!").success).toBe(true);
	});

	it.each([
		"Corta1!",
		"sinmayuscula123!",
		"SINMINUSCULA123!",
		"SinNumeros!!!!!",
		"SinEspecial1234",
	])("rechaza %s", (password) => {
		expect(passwordSchema.safeParse(password).success).toBe(false);
	});
});

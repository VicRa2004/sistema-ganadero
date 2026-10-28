import { z } from "zod";

// Misma política que la API (authSchemas.ts)
export const passwordSchema = z
	.string()
	.min(12, "Debe tener al menos 12 caracteres")
	.regex(/[A-Z]/, "Debe incluir una mayúscula")
	.regex(/[a-z]/, "Debe incluir una minúscula")
	.regex(/[0-9]/, "Debe incluir un número")
	.regex(/[^A-Za-z0-9]/, "Debe incluir un carácter especial");

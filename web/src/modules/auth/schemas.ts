import { z } from "zod";

// Misma política que la API (authSchemas.ts)
export const passwordSchema = z
	.string()
	.min(12, "Debe tener al menos 12 caracteres")
	.regex(/[A-Z]/, "Debe incluir una mayúscula")
	.regex(/[a-z]/, "Debe incluir una minúscula")
	.regex(/[0-9]/, "Debe incluir un número")
	.regex(/[^A-Za-z0-9]/, "Debe incluir un carácter especial");

export const loginSchema = z.object({
	email: z.email("Introduce un correo electrónico válido."),
	password: z.string().min(1, "La contraseña es requerida."),
});

export const registerSchema = z.object({
	name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
	email: z.email("Introduce un correo electrónico válido."),
	password: passwordSchema,
});

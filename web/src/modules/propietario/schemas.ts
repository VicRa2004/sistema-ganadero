import { z } from "zod";

export const propietarioFormSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres.")
		.max(150, "Máximo 150 caracteres."),
	telefono: z
		.string()
		.trim()
		.max(30, "Máximo 30 caracteres.")
		.refine(
			(v) => v === "" || v.length >= 7,
			"El teléfono debe tener al menos 7 dígitos.",
		),
	correo: z
		.string()
		.trim()
		.refine(
			(v) => v === "" || z.email().safeParse(v).success,
			"Introduce un correo electrónico válido.",
		),
});

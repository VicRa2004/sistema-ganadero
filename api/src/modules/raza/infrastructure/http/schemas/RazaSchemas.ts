import { z } from "zod";

export const createRazaSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre es requerido")
		.max(100, "El nombre no puede exceder los 100 caracteres"),
	descripcion: z
		.string()
		.max(500, "La descripción no puede exceder los 500 caracteres")
		.optional()
		.nullable(),
});

export const updateRazaSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre no puede estar vacío")
		.max(100, "El nombre no puede exceder los 100 caracteres")
		.optional(),
	descripcion: z
		.string()
		.max(500, "La descripción no puede exceder los 500 caracteres")
		.optional()
		.nullable(),
});

export const razaIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

import { z } from "zod";

export const createRanchoSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre es requerido")
		.max(150, "El nombre no puede exceder los 150 caracteres"),
	ubicacion: z
		.string()
		.min(1, "La ubicación es requerida")
		.max(255, "La ubicación no puede exceder los 255 caracteres"),
	extensionHectareas: z
		.number()
		.positive("La extensión debe ser un número positivo"),
	capacidadMaxima: z
		.number()
		.int("La capacidad máxima debe ser un número entero")
		.positive("La capacidad máxima debe ser un número positivo"),
});

export const updateRanchoSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre no puede estar vacío")
		.max(150, "El nombre no puede exceder los 150 caracteres")
		.optional(),
	ubicacion: z
		.string()
		.min(1, "La ubicación no puede estar vacía")
		.max(255, "La ubicación no puede exceder los 255 caracteres")
		.optional(),
	extensionHectareas: z
		.number()
		.positive("La extensión debe ser un número positivo")
		.optional(),
	capacidadMaxima: z
		.number()
		.int("La capacidad máxima debe ser un número entero")
		.positive("La capacidad máxima debe ser un número positivo")
		.optional(),
});

export const ranchoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarRanchosQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.default("1")
		.transform((v) => {
			const n = Number(v);
			return Number.isNaN(n) || n < 1 ? 1 : n;
		}),
	limit: z
		.string()
		.optional()
		.default("10")
		.transform((v) => {
			const n = Number(v);
			return Number.isNaN(n) || n < 1 ? 10 : n;
		}),
	nombre: z.string().optional(),
});

import { z } from "zod";

export const createTerrenoSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre es requerido")
		.max(150, "El nombre no puede exceder los 150 caracteres"),
	ubicacion: z
		.string()
		.min(1, "La ubicación es requerida")
		.max(255, "La ubicación no puede exceder los 255 caracteres"),
	extensionHectareas: z.preprocess(
		(val) => (val === "" || val === undefined ? undefined : Number(val)),
		z.number().positive("La extensión debe ser un número positivo"),
	),
	capacidadMaxima: z.preprocess(
		(val) => (val === "" || val === undefined ? undefined : Number(val)),
		z
			.number()
			.int("La capacidad máxima debe ser un número entero")
			.positive("La capacidad máxima debe ser un número positivo"),
	),
	imagenTerreno: z
		.custom<File>((val) => val instanceof File, "Debe ser un archivo válido")
		.optional()
		.nullable(),
});

export const updateTerrenoSchema = z.object({
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
		.preprocess(
			(val) => (val === "" || val === undefined ? undefined : Number(val)),
			z.number().positive("La extensión debe ser un número positivo"),
		)
		.optional(),
	capacidadMaxima: z
		.preprocess(
			(val) => (val === "" || val === undefined ? undefined : Number(val)),
			z
				.number()
				.int("La capacidad máxima debe ser un número entero")
				.positive("La capacidad máxima debe ser un número positivo"),
		)
		.optional(),
	imagenTerreno: z
		.union([
			z.custom<File>(
				(val) => val instanceof File,
				"Debe ser un archivo válido",
			),
			z.string(),
		])
		.optional()
		.nullable(),
});

export const terrenoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarTerrenosQuerySchema = z.object({
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

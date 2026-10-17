import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

export const createPropietarioSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre es requerido")
		.max(255, "El nombre no puede exceder los 255 caracteres"),
	telefono: z
		.string()
		.max(20, "El teléfono no puede exceder los 20 caracteres")
		.optional()
		.nullable(),
	correo: z
		.string()
		.email("El formato del correo electrónico es inválido")
		.max(128, "El correo no puede exceder los 128 caracteres")
		.optional()
		.nullable()
		.or(z.literal("")), // Permite strings vacíos
	imagenMarca: z
		.custom<File>((val) => val instanceof File, "Debe ser un archivo válido")
		.optional()
		.nullable(),
});

export const updatePropietarioSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre no puede estar vacío")
		.max(255, "El nombre no puede exceder los 255 caracteres")
		.optional(),
	telefono: z
		.string()
		.max(20, "El teléfono no puede exceder los 20 caracteres")
		.optional()
		.nullable(),
	correo: z
		.string()
		.email("El formato del correo electrónico es inválido")
		.max(128, "El correo no puede exceder los 128 caracteres")
		.optional()
		.nullable()
		.or(z.literal("")), // Permite strings vacíos
	imagenMarca: z
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

export const propietarioIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarPropietariosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	nombre: z.string().optional(),
});

import { z } from "zod";

export const registrarVeterinarioSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(255, "El nombre es demasiado largo"),
	telefono: z
		.string()
		.min(1, "El teléfono es obligatorio")
		.max(20, "El teléfono es demasiado largo"),
	cedulaProfesional: z
		.string()
		.min(1, "La cédula profesional es obligatoria")
		.max(50, "La cédula profesional es demasiado larga"),
	especialidad: z
		.string()
		.max(100, "La especialidad es demasiado larga")
		.nullable()
		.optional(),
});

export const actualizarVeterinarioSchema = z.object({
	nombre: z.string().min(1, "El nombre no puede estar vacío").max(255, "El nombre es demasiado largo").optional(),
	telefono: z.string().min(1, "El teléfono no puede estar vacío").max(20, "El teléfono es demasiado largo").optional(),
	cedulaProfesional: z.string().min(1, "La cédula profesional no puede estar vacía").max(50, "La cédula profesional es demasiado larga").optional(),
	especialidad: z
		.string()
		.max(100, "La especialidad es demasiado larga")
		.nullable()
		.optional(),
});

export const veterinarioIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarVeterinariosQuerySchema = z.object({
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
	especialidad: z.string().optional(),
});

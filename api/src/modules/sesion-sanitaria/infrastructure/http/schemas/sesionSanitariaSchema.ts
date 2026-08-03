import { z } from "zod";

export const aplicacionSanitariaSchema = z.object({
	ganadoId: z
		.number()
		.int()
		.positive("El ID del ganado debe ser un entero positivo"),
	dosisAplicada: z.number().positive("La dosis aplicada debe ser mayor a 0"),
	observaciones: z.string().optional().nullable(),
});

export const registrarSesionSanitariaSchema = z.object({
	fecha: z.string().min(1, "La fecha de la sesión es obligatoria"),
	veterinarioId: z
		.number()
		.int()
		.positive("El ID de veterinario es obligatorio"),
	descripcion: z
		.string()
		.min(3, "La descripción debe contener al menos 3 caracteres"),
	insumoId: z.number().int().positive("El ID de insumo es obligatorio"),
	aplicaciones: z
		.array(aplicacionSanitariaSchema)
		.min(
			1,
			"Debe incluir al menos un registro de animal en la sesión sanitaria",
		),
});

export const registrarResultadoAnimalSchema = z.object({
	sesionId: z
		.number()
		.int()
		.positive("El ID de la sesión debe ser un entero positivo"),
	ganadoId: z
		.number()
		.int()
		.positive("El ID del ganado debe ser un entero positivo"),
	dosisAplicada: z.number().positive("La dosis aplicada debe ser mayor a 0"),
	observaciones: z.string().optional().nullable(),
});

export const listarSesionesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	veterinarioId: z.coerce.number().int().positive().optional(),
	insumoId: z.coerce.number().int().positive().optional(),
	busqueda: z.string().optional(),
	fechaInicio: z.string().optional(),
	fechaFin: z.string().optional(),
});

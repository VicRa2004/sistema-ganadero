import { z } from "zod";

export const aplicacionSanitariaSchema = z.object({
	ganadoId: z
		.number()
		.int()
		.positive("El ID del ganado debe ser un entero positivo"),
	dosisAplicada: z.number().positive("La dosis aplicada debe ser mayor a 0"),
	observaciones: z.string().optional().nullable(),
});

export const registrarSesionSanitariaSchema = z
	.object({
		fecha: z.string().min(1, "La fecha de la sesión es obligatoria"),
		veterinarioId: z
			.number()
			.int()
			.positive("El ID de veterinario es obligatorio"),
		descripcion: z
			.string()
			.min(3, "La descripción debe contener al menos 3 caracteres"),
		insumoId: z.number().int().positive("El ID de insumo es obligatorio"),
		estado: z.enum(["PROGRAMADA", "REALIZADA"]).optional().default("REALIZADA"),
		aplicaciones: z.array(aplicacionSanitariaSchema).default([]),
	})
	.superRefine((val, ctx) => {
		if (val.estado === "REALIZADA" && val.aplicaciones.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["aplicaciones"],
				message:
					"Debe incluir al menos un registro de animal en una sesión sanitaria realizada",
			});
		}
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
	estado: z.enum(["PROGRAMADA", "REALIZADA", "CANCELADA"]).optional(),
	busqueda: z.string().optional(),
	fechaInicio: z.string().optional(),
	fechaFin: z.string().optional(),
});

export const calendarioQuerySchema = z.object({
	desde: z.string().optional(),
	hasta: z.string().optional(),
	terrenoId: z.coerce.number().int().positive().optional(),
	ganadoId: z.coerce.number().int().positive().optional(),
});

export const crearPlanSanitarioSchema = z.object({
	nombre: z
		.string()
		.min(3, "El nombre debe tener al menos 3 caracteres")
		.max(150),
	descripcion: z.string().min(3, "La descripción es obligatoria"),
	frecuenciaDias: z
		.number()
		.int()
		.min(1, "La frecuencia debe ser >= 1 día")
		.max(3650),
	dosisPorAnimal: z.number().positive("La dosis por animal debe ser mayor a 0"),
	veterinarioId: z.number().int().positive("El veterinario es obligatorio"),
	insumoId: z.number().int().positive("El insumo es obligatorio"),
	terrenoId: z.number().int().positive().nullable().optional(),
	razaId: z.number().int().positive().nullable().optional(),
	edadMinimaMeses: z.number().int().min(0).max(360).nullable().optional(),
	proximaEjecucion: z.string().min(1, "La próxima fecha es obligatoria"),
	activo: z.boolean().optional().default(true),
});

export const actualizarPlanSanitarioSchema = crearPlanSanitarioSchema.partial();

export const exportarSesionesQuerySchema = z.object({
	veterinarioId: z.coerce.number().int().positive().optional(),
	insumoId: z.coerce.number().int().positive().optional(),
	estado: z.enum(["PROGRAMADA", "REALIZADA", "CANCELADA"]).optional(),
	busqueda: z.string().optional(),
	fechaInicio: z.string().optional(),
	fechaFin: z.string().optional(),
});

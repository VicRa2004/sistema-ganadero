import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

const positiveIntOptionalQuery = z.preprocess((val) => {
	if (val === undefined || val === "") return undefined;
	return Number(val);
}, z.number().int().positive().optional());

export const recetarTratamientoSchema = z.object({
	ganadoId: z
		.number()
		.int()
		.positive("El ID del ganado debe ser un entero positivo"),
	diagnostico: z
		.string()
		.trim()
		.min(3, "El diagnóstico debe contener al menos 3 caracteres")
		.max(255, "El diagnóstico no puede exceder 255 caracteres"),
	fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
	fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
	insumoId: z
		.number()
		.int()
		.positive("El ID del insumo debe ser un entero positivo"),
	dosisDiaria: z.number().positive("La dosis diaria debe ser mayor a 0"),
	veterinarioId: z
		.number()
		.int()
		.positive("El ID del veterinario debe ser un entero positivo")
		.nullable()
		.optional(),
});

export const actualizarTratamientoSchema = z.object({
	diagnostico: z
		.string()
		.trim()
		.min(3, "El diagnóstico debe contener al menos 3 caracteres")
		.max(255, "El diagnóstico no puede exceder 255 caracteres")
		.optional(),
	fechaInicio: z
		.string()
		.min(1, "La fecha de inicio es obligatoria")
		.optional(),
	fechaFin: z.string().min(1, "La fecha de fin es obligatoria").optional(),
	insumoId: z
		.number()
		.int()
		.positive("El ID del insumo debe ser un entero positivo")
		.optional(),
	dosisDiaria: z
		.number()
		.positive("La dosis diaria debe ser mayor a 0")
		.optional(),
	veterinarioId: z
		.number()
		.int()
		.positive("El ID del veterinario debe ser un entero positivo")
		.nullable()
		.optional(),
	activo: z.boolean().optional(),
});

export const registrarAplicacionDiariaSchema = z.object({
	tratamientoId: z
		.number()
		.int()
		.positive("El ID del tratamiento debe ser un entero positivo"),
	cantidadDosis: z
		.number()
		.positive("La dosis aplicada debe ser mayor a 0")
		.optional(),
	observaciones: z.string().optional().nullable(),
	fechaAplicacion: z.string().optional(),
});

export const listarTratamientosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	ganadoId: positiveIntOptionalQuery,
	activo: z.preprocess((val) => {
		if (val === "true" || val === true) return true;
		if (val === "false" || val === false) return false;
		return undefined;
	}, z.boolean().optional()),
	insumoId: positiveIntOptionalQuery,
	veterinarioId: positiveIntOptionalQuery,
	search: z.string().optional(),
});

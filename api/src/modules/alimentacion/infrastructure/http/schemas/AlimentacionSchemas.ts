import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

export const racionIdParamSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID de la ración debe ser numérico")
		.transform(Number),
});

export const crearRacionSchema = z
	.object({
		nombre: z.string().trim().min(1, "El nombre es requerido").max(150),
		insumoId: z.number().int().positive("El insumo de alimento es requerido"),
		terrenoId: z.number().int().positive().nullable().optional(),
		loteId: z.number().int().positive().nullable().optional(),
		cantidadDiariaPorAnimal: z
			.number()
			.positive("La cantidad diaria por animal debe ser mayor a 0"),
		diasAlertaAutonomia: z.number().int().min(1).max(365).optional().default(7),
		activo: z.boolean().optional().default(true),
		observaciones: z.string().trim().max(1000).nullable().optional(),
	})
	.refine((d) => Boolean(d.terrenoId) || Boolean(d.loteId), {
		message: "Debes indicar un terreno o un lote",
	});

export const actualizarRacionSchema = z.object({
	nombre: z.string().trim().min(1).max(150).optional(),
	insumoId: z.number().int().positive().optional(),
	terrenoId: z.number().int().positive().nullable().optional(),
	loteId: z.number().int().positive().nullable().optional(),
	cantidadDiariaPorAnimal: z.number().positive().optional(),
	diasAlertaAutonomia: z.number().int().min(1).max(365).optional(),
	activo: z.boolean().optional(),
	observaciones: z.string().trim().max(1000).nullable().optional(),
});

export const listarRacionesQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	activo: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => (v === undefined ? undefined : v === "true")),
	terrenoId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	loteId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
});

export const registrarSuministroSchema = z.object({
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
		.optional(),
	cantidadTotalOverride: z.number().positive().optional(),
	observaciones: z.string().trim().max(1000).nullable().optional(),
});

export const listarSuministrosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	racionId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	desde: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'desde' inválida")
		.optional(),
	hasta: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'hasta' inválida")
		.optional(),
});

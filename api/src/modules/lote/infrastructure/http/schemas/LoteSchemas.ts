import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";
import { PROPOSITOS_LOTE } from "../../../domain/PropositoLote";

export const loteIdParamSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID del lote debe ser numérico")
		.transform(Number),
});

export const loteMiembroParamsSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID del lote debe ser numérico")
		.transform(Number),
	ganadoId: z
		.string()
		.regex(/^\d+$/, "El ID del animal debe ser numérico")
		.transform(Number),
});

export const crearLoteSchema = z.object({
	nombre: z.string().trim().min(1, "El nombre es requerido").max(150),
	proposito: z.enum(PROPOSITOS_LOTE),
	descripcion: z.string().trim().max(1000).nullable().optional(),
	terrenoId: z.number().int().positive().nullable().optional(),
	activo: z.boolean().optional().default(true),
	ganadoIds: z.array(z.number().int().positive()).optional(),
});

export const actualizarLoteSchema = z.object({
	nombre: z.string().trim().min(1).max(150).optional(),
	proposito: z.enum(PROPOSITOS_LOTE).optional(),
	descripcion: z.string().trim().max(1000).nullable().optional(),
	terrenoId: z.number().int().positive().nullable().optional(),
	activo: z.boolean().optional(),
});

export const listarLotesQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	nombre: z.string().optional(),
	proposito: z.enum(PROPOSITOS_LOTE).optional(),
	activo: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => (v === undefined ? undefined : v === "true")),
});

export const agregarMiembrosLoteSchema = z.object({
	ganadoIds: z
		.array(z.number().int().positive())
		.min(1, "Debes seleccionar al menos un animal"),
});

export const pesajeMasivoLoteSchema = z.object({
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
		.optional(),
	observaciones: z.string().trim().max(500).nullable().optional(),
	items: z
		.array(
			z.object({
				ganadoId: z.number().int().positive(),
				peso: z.number().positive("El peso debe ser mayor a 0").max(3000),
			}),
		)
		.min(1, "Debes incluir al menos un animal"),
});

export const trasladoMasivoLoteSchema = z.object({
	terrenoDestinoId: z
		.number()
		.int()
		.positive("El terreno destino es requerido"),
});

export const vacunacionMasivaLoteSchema = z.object({
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "La fecha no es válida"),
	veterinarioId: z.number().int().positive("El veterinario es requerido"),
	insumoId: z.number().int().positive("El insumo es requerido"),
	dosisPorAnimal: z
		.number()
		.positive("La dosis por animal debe ser mayor a cero"),
	descripcion: z
		.string()
		.trim()
		.min(1, "La descripción es requerida")
		.max(1000),
});

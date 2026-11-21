import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";
import { TIPOS_PAPELERA } from "../../../domain/TipoPapelera";

export const tipoPapeleraSchema = z.object({ tipo: z.enum(TIPOS_PAPELERA) });

export const elementoPapeleraSchema = tipoPapeleraSchema.extend({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarPapeleraQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(50),
});

import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

export const listarAuditoriaQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(100),
	usuarioId: z
		.string()
		.regex(/^\d+$/, "El usuario debe ser un número")
		.transform(Number)
		.optional(),
	metodo: z.enum(["POST", "PUT", "PATCH", "DELETE"]).optional(),
	ruta: z.string().trim().max(255).optional(),
	desde: z.coerce.date().optional(),
	hasta: z.coerce.date().optional(),
});

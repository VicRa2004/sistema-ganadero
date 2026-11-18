import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";
import { TIPOS_NOTIFICACION } from "../../../domain/TipoNotificacion";

export const listarNotificacionesQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(20),
	soloNoLeidas: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => v === "true"),
	tipo: z.enum(TIPOS_NOTIFICACION).optional(),
});

export const notificacionIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const actualizarPreferenciasSchema = z.object({
	preferencias: z
		.array(
			z.object({
				tipo: z.enum(TIPOS_NOTIFICACION),
				inApp: z.boolean(),
				email: z.boolean().optional(),
			}),
		)
		.min(1, "Debe enviar al menos una preferencia"),
});

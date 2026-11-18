import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

export const TIPOS_EVENTO_REPRODUCTIVO = [
	"MONTA",
	"INSEMINACION",
	"DIAGNOSTICO_GESTACION",
	"PARTO",
	"DESTETE",
	"ABORTO",
] as const;

export const RESULTADOS_DIAGNOSTICO = ["POSITIVO", "NEGATIVO"] as const;

const criaPartoSchema = z.object({
	identificador: z
		.string()
		.min(1, "El identificador (arete) de la cría es requerido")
		.max(50, "El identificador no puede exceder los 50 caracteres"),
	sexo: z.enum(["MACHO", "HEMBRA"], {
		message: "El sexo de la cría debe ser MACHO o HEMBRA",
	}),
	peso: z.number().positive("El peso de la cría debe ser mayor a cero"),
	razaId: z.number().int().positive().optional(),
	terrenoId: z.number().int().positive().optional(),
	propietarioId: z.number().int().positive().optional(),
});

export const registrarEventoReproductivoSchema = z
	.object({
		hembraId: z.number().int().positive("La hembra es requerida"),
		machoId: z.number().int().positive().nullable().optional(),
		tipo: z.enum(TIPOS_EVENTO_REPRODUCTIVO, {
			message: "Tipo de evento reproductivo no válido",
		}),
		fecha: z
			.string()
			.min(1, "La fecha es requerida")
			.refine((v) => !Number.isNaN(Date.parse(v)), {
				message: "La fecha no es válida",
			})
			.refine((v) => new Date(v) <= new Date(), {
				message: "La fecha del evento no puede ser futura",
			}),
		resultado: z.enum(RESULTADOS_DIAGNOSTICO).nullable().optional(),
		fechaProbableParto: z
			.string()
			.refine((v) => !Number.isNaN(Date.parse(v)), {
				message: "La fecha probable de parto no es válida",
			})
			.nullable()
			.optional(),
		observaciones: z.string().max(1000).nullable().optional(),
		crias: z.array(criaPartoSchema).max(5).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.tipo === "DIAGNOSTICO_GESTACION" && !data.resultado) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["resultado"],
				message:
					"El diagnóstico de gestación requiere resultado POSITIVO o NEGATIVO",
			});
		}
		if (data.tipo !== "DIAGNOSTICO_GESTACION" && data.resultado) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["resultado"],
				message: "El resultado solo aplica a diagnósticos de gestación",
			});
		}
	});

export const listarEventosReproductivosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	hembraId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	ganadoId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	tipo: z.enum(TIPOS_EVENTO_REPRODUCTIVO).optional(),
	desde: z
		.string()
		.optional()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), {
			message: "Fecha inicial inválida",
		}),
	hasta: z
		.string()
		.optional()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), {
			message: "Fecha final inválida",
		}),
});

export const indicadoresReproductivosQuerySchema = z.object({
	desde: z
		.string()
		.optional()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), {
			message: "Fecha inicial inválida",
		}),
	hasta: z
		.string()
		.optional()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), {
			message: "Fecha final inválida",
		}),
});

export const eventoReproductivoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

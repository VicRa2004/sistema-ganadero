import { z } from "zod";
import {
	enteroNoNegativoSchema,
	idSelectSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";

export const racionFormSchema = z
	.object({
		nombre: z
			.string()
			.trim()
			.min(2, "El nombre de la ración es requerido.")
			.max(150, "Máximo 150 caracteres."),
		insumoId: idSelectSchema("Debes seleccionar un insumo de tipo ALIMENTO."),
		terrenoId: z.string(),
		loteId: z.string(),
		cantidadDiariaPorAnimal: numeroPositivoSchema(
			"La cantidad diaria por animal",
		),
		diasAlertaAutonomia: enteroNoNegativoSchema("Los días de alerta").refine(
			(v) => Number(v) >= 1 && Number(v) <= 365,
			"Debe estar entre 1 y 365 días.",
		),
		observaciones: z.string().trim().max(1000, "Máximo 1000 caracteres."),
		activo: z.boolean(),
	})
	.refine((v) => v.terrenoId !== "" || v.loteId !== "", {
		path: ["loteId"],
		message: "Debes asignar la ración a un lote o a un terreno.",
	});

export const registrarSuministroSchema = z.object({
	fecha: z.string().trim(),
	cantidadTotalOverride: z
		.string()
		.trim()
		.refine(
			(v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) > 0),
			"Si indicas una cantidad manual debe ser mayor a 0.",
		),
	observaciones: z.string().trim().max(1000, "Máximo 1000 caracteres."),
});

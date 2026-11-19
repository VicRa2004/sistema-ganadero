import { z } from "zod";
import {
	fechaRequeridaSchema,
	idSelectSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";

export const programarTratamientoSchema = z
	.object({
		ganadoId: idSelectSchema("Debe seleccionar un animal paciente."),
		diagnostico: z
			.string()
			.trim()
			.min(3, "El diagnóstico debe tener al menos 3 caracteres."),
		insumoId: idSelectSchema("Debe seleccionar un medicamento."),
		dosisDiaria: numeroPositivoSchema("Dosis diaria"),
		fechaInicio: fechaRequeridaSchema("Fecha de inicio"),
		fechaFin: fechaRequeridaSchema("Fecha de fin"),
		veterinarioId: z.string(),
	})
	.refine((v) => !v.fechaInicio || !v.fechaFin || v.fechaFin >= v.fechaInicio, {
		path: ["fechaFin"],
		message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
	});

export const aplicarDosisDiariaSchema = z.object({
	cantidadDosis: numeroPositivoSchema("Cantidad aplicada"),
	observaciones: z.string().trim(),
});

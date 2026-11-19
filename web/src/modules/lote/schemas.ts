import { z } from "zod";
import {
	fechaRequeridaSchema,
	idSelectSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";
import { PROPOSITOS_LOTE } from "./types";

export const loteFormSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre del lote es requerido (mín. 2 caracteres).")
		.max(150, "Máximo 150 caracteres."),
	proposito: z
		.string()
		.refine(
			(v: string): boolean =>
				(PROPOSITOS_LOTE as readonly string[]).includes(v),
			"Selecciona un propósito válido.",
		),
	terrenoId: z.string(),
	descripcion: z.string().trim().max(1000, "Máximo 1000 caracteres."),
	activo: z.boolean(),
});

export const trasladoMasivoSchema = z.object({
	terrenoDestinoId: idSelectSchema("Debes seleccionar un terreno destino."),
});

export const vacunacionMasivaSchema = z.object({
	fecha: fechaRequeridaSchema("La fecha"),
	veterinarioId: idSelectSchema("Debes seleccionar un veterinario."),
	insumoId: idSelectSchema("Debes seleccionar un medicamento o vacuna."),
	dosisPorAnimal: numeroPositivoSchema("La dosis por animal"),
	descripcion: z
		.string()
		.trim()
		.min(3, "La descripción es requerida (mín. 3 caracteres).")
		.max(1000, "Máximo 1000 caracteres."),
});

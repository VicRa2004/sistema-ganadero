import { z } from "zod";
import {
	fechaRequeridaSchema,
	idSelectSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";

export const planSanitarioSchema = z.object({
	nombre: z.string().trim().min(2, "El nombre es requerido."),
	descripcion: z.string().trim().min(3, "La descripción es requerida."),
	frecuenciaDias: numeroPositivoSchema("Frecuencia en días").refine(
		(v) => Number.isInteger(Number(v)),
		"Debe ser un número entero de días.",
	),
	dosisPorAnimal: numeroPositivoSchema("Dosis por animal"),
	veterinarioId: idSelectSchema("Debe seleccionar un veterinario."),
	insumoId: idSelectSchema("Debe seleccionar una vacuna o medicamento."),
	proximaEjecucion: fechaRequeridaSchema("Próxima ejecución"),
	terrenoId: z.string(),
	razaId: z.string(),
	edadMinimaMeses: z
		.string()
		.trim()
		.refine(
			(v) =>
				v === "" ||
				(!Number.isNaN(Number(v)) &&
					Number.isInteger(Number(v)) &&
					Number(v) >= 0),
			"Edad mínima inválida.",
		),
});

export const registrarSesionSanitariaSchema = z.object({
	fecha: fechaRequeridaSchema("Fecha de jornada"),
	veterinarioId: idSelectSchema("Debe seleccionar un veterinario."),
	insumoId: idSelectSchema("Debe seleccionar una vacuna o medicamento."),
	descripcion: z.string().trim().min(3, "La descripción es requerida."),
	estado: z.enum(["REALIZADA", "PROGRAMADA"]),
});

export const resultadoAnimalSchema = z.object({
	ganadoId: idSelectSchema("Debe seleccionar un animal."),
	dosisAplicada: numeroPositivoSchema("Dosis aplicada"),
	observaciones: z.string().trim(),
});

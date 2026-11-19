import { z } from "zod";
import { numeroPositivoSchema } from "@/lib/zodHelpers";

export const terrenoFormSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres.")
		.max(150, "Máximo 150 caracteres."),
	ubicacion: z
		.string()
		.trim()
		.min(2, "La ubicación debe tener al menos 2 caracteres.")
		.max(255, "Máximo 255 caracteres."),
	extensionHectareas: numeroPositivoSchema("La extensión (ha)"),
	capacidadMaxima: numeroPositivoSchema("La capacidad máxima").refine(
		(v) => Number.isInteger(Number(v)),
		"La capacidad máxima debe ser un número entero.",
	),
});

import { z } from "zod";
import {
	fechaRequeridaSchema,
	idSelectSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";

export const ganadoFormSchema = z.object({
	identificador: z
		.string()
		.trim()
		.min(2, "El arete debe tener al menos 2 caracteres.")
		.max(50, "El arete no puede exceder 50 caracteres."),
	sexo: z
		.string()
		.refine(
			(v: string): boolean => v === "MACHO" || v === "HEMBRA",
			"El sexo es requerido.",
		),
	peso: numeroPositivoSchema("El peso", 3000),
	fechaNacimiento: fechaRequeridaSchema("La fecha de nacimiento", true),
	razaId: idSelectSchema("La raza es requerida."),
	terrenoId: idSelectSchema("El terreno es requerido."),
	propietarioId: idSelectSchema("El propietario es requerido."),
	procedencia: z.string().trim().max(200, "Máximo 200 caracteres."),
	padreId: z.string(),
	madreId: z.string(),
	fechaBaja: z.string(),
	motivoBajaId: z.string(),
});

export const ganadoBajaSchema = z.object({
	fechaBaja: fechaRequeridaSchema("La fecha de baja", true),
	motivoBajaId: idSelectSchema("El motivo de baja es requerido."),
});

export const ganadoPesajeSchema = z.object({
	peso: numeroPositivoSchema("El peso", 3000),
});

export const ganadoTrasladoSchema = z.object({
	terrenoId: idSelectSchema("El terreno destino es requerido."),
});

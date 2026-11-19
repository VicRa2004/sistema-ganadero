import { z } from "zod";
import { fechaRequeridaSchema, idSelectSchema } from "@/lib/zodHelpers";

export const eventoReproductivoSchema = z.object({
	tipo: z.enum([
		"MONTA",
		"INSEMINACION",
		"DIAGNOSTICO_GESTACION",
		"PARTO",
		"DESTETE",
		"ABORTO",
	]),
	hembraId: idSelectSchema("Debe seleccionar la hembra."),
	machoId: z.string(),
	fecha: fechaRequeridaSchema("Fecha del evento", true),
	resultado: z.enum(["POSITIVO", "NEGATIVO"]),
	observaciones: z.string().trim(),
});

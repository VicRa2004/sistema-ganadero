import { z } from "zod";
import { fechaRequeridaSchema, numeroPositivoSchema } from "@/lib/zodHelpers";
import { CATEGORIAS_GASTO } from "./types";

const transaccionHeaderFields = {
	fecha: fechaRequeridaSchema("La fecha"),
	contraparte: z
		.string()
		.trim()
		.min(2, "La contraparte / cliente es requerida.")
		.max(200, "Máximo 200 caracteres."),
	moneda: z.string().trim().min(1, "La moneda es requerida.").max(10),
	documento: z.string().trim().max(150, "Máximo 150 caracteres."),
	observaciones: z.string().trim().max(1000, "Máximo 1000 caracteres."),
};

export const ventaHeaderSchema = z.object(transaccionHeaderFields);
export const compraHeaderSchema = z.object(transaccionHeaderFields);

export const gastoFormSchema = z.object({
	categoria: z
		.string()
		.refine(
			(v: string): boolean =>
				(CATEGORIAS_GASTO as readonly string[]).includes(v),
			"Selecciona una categoría válida.",
		),
	concepto: z
		.string()
		.trim()
		.min(2, "El concepto es requerido.")
		.max(200, "Máximo 200 caracteres."),
	monto: numeroPositivoSchema("El monto"),
	fecha: fechaRequeridaSchema("La fecha"),
	terrenoId: z.string(),
	ganadoId: z.string(),
	loteId: z.string(),
	observaciones: z.string().trim().max(1000, "Máximo 1000 caracteres."),
});

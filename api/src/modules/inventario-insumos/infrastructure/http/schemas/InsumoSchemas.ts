import { z } from "zod";

export const registrarInsumoSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre del insumo es requerido")
		.max(150, "El nombre no puede exceder los 150 caracteres"),
	tipo: z.enum(["MEDICAMENTO", "VACUNA", "ALIMENTO"], {
		message: "El tipo de insumo debe ser MEDICAMENTO, VACUNA o ALIMENTO",
	}),
	stockInicial: z.number().min(0, "El stock inicial no puede ser negativo"),
	stockMinimo: z.number().min(0, "El stock mínimo no puede ser negativo"),
	unidadMedida: z
		.string()
		.min(1, "La unidad de medida es requerida")
		.max(20, "La unidad de medida no puede exceder los 20 caracteres"),
	lote: z
		.string()
		.min(1, "El lote de producción es requerido")
		.max(50, "El lote no puede exceder los 50 caracteres"),
	fechaCaducidad: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
		message: "La fecha de caducidad debe ser una fecha válida",
	}),
});

export const abastecerInsumoSchema = z.object({
	cantidad: z.number().gt(0, "La cantidad a abastecer debe ser mayor a cero"),
});

export const consumirInsumoSchema = z.object({
	cantidad: z.number().gt(0, "La cantidad a consumir debe ser mayor a cero"),
});

export const insumoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarInsumosQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.default("1")
		.transform((v) => {
			const n = Number(v);
			return Number.isNaN(n) || n < 1 ? 1 : n;
		}),
	limit: z
		.string()
		.optional()
		.default("10")
		.transform((v) => {
			const n = Number(v);
			return Number.isNaN(n) || n < 1 ? 10 : n;
		}),
	nombre: z.string().optional(),
	tipo: z.string().optional(),
});

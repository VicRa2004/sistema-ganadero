import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";

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
	periodoRetiroDias: z
		.number()
		.int("El período de retiro debe ser un entero")
		.min(0, "El período de retiro no puede ser negativo")
		.max(365, "El período de retiro no puede exceder 365 días")
		.optional()
		.default(0),
	costoUnitario: z
		.number()
		.min(0, "El costo unitario no puede ser negativo")
		.optional()
		.default(0),
});

export const abastecerInsumoSchema = z.object({
	cantidad: z.number().gt(0, "La cantidad a abastecer debe ser mayor a cero"),
	costoUnitario: z
		.number()
		.min(0, "El costo unitario no puede ser negativo")
		.optional(),
	motivo: z.string().trim().max(255).optional(),
});

export const consumirInsumoSchema = z.object({
	cantidad: z.number().gt(0, "La cantidad a consumir debe ser mayor a cero"),
	motivo: z.string().trim().max(255).optional(),
	ganadoId: z.number().int().positive().optional(),
	terrenoId: z.number().int().positive().optional(),
	loteId: z.number().int().positive().optional(),
});

export const ajustarStockInsumoSchema = z.object({
	cantidadDelta: z
		.number()
		.refine((v) => v !== 0, "El ajuste de stock no puede ser cero"),
	motivo: z
		.string()
		.trim()
		.min(1, "El motivo del ajuste es requerido")
		.max(255, "El motivo no puede exceder los 255 caracteres"),
	costoUnitario: z
		.number()
		.min(0, "El costo unitario no puede ser negativo")
		.optional(),
});

export const actualizarInsumoSchema = z.object({
	nombre: z
		.string()
		.min(1, "El nombre del insumo es requerido")
		.max(150, "El nombre no puede exceder los 150 caracteres")
		.optional(),
	tipo: z
		.enum(["MEDICAMENTO", "VACUNA", "ALIMENTO"], {
			message: "El tipo de insumo debe ser MEDICAMENTO, VACUNA o ALIMENTO",
		})
		.optional(),
	stockMinimo: z
		.number()
		.min(0, "El stock mínimo no puede ser negativo")
		.optional(),
	unidadMedida: z
		.string()
		.min(1, "La unidad de medida es requerida")
		.max(20, "La unidad de medida no puede exceder los 20 caracteres")
		.optional(),
	lote: z
		.string()
		.min(1, "El lote de producción es requerido")
		.max(50, "El lote no puede exceder los 50 caracteres")
		.optional(),
	fechaCaducidad: z
		.string()
		.refine((val) => !Number.isNaN(Date.parse(val)), {
			message: "La fecha de caducidad debe ser una fecha válida",
		})
		.optional(),
	periodoRetiroDias: z
		.number()
		.int("El período de retiro debe ser un entero")
		.min(0, "El período de retiro no puede ser negativo")
		.max(365, "El período de retiro no puede exceder 365 días")
		.optional(),
	costoUnitario: z
		.number()
		.min(0, "El costo unitario no puede ser negativo")
		.optional(),
});

export const insumoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const listarInsumosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	nombre: z.string().optional(),
	tipo: z.string().optional(),
});

export const exportarInsumosQuerySchema = z.object({
	nombre: z.string().optional(),
	tipo: z.string().optional(),
});

export const listarKardexQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(20),
	tipo: z.enum(["ENTRADA", "SALIDA", "AJUSTE"]).optional(),
	desde: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'desde' inválida")
		.optional(),
	hasta: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'hasta' inválida")
		.optional(),
});

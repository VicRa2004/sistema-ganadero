import { z } from "zod";
import {
	enteroNoNegativoSchema,
	fechaRequeridaSchema,
	numeroNoNegativoSchema,
	numeroOpcionalNoNegativoSchema,
	numeroPositivoSchema,
} from "@/lib/zodHelpers";

const baseInsumoFields = {
	nombre: z
		.string()
		.trim()
		.min(1, "El nombre es requerido.")
		.max(255, "El nombre no debe exceder 255 caracteres."),
	tipo: z
		.string()
		.refine(
			(v: string): boolean =>
				v === "MEDICAMENTO" || v === "VACUNA" || v === "ALIMENTO",
			"El tipo de insumo es requerido.",
		),
	stockMinimo: numeroNoNegativoSchema("El stock mínimo"),
	unidadMedida: z
		.string()
		.trim()
		.min(1, "La unidad de medida es requerida.")
		.max(50, "La unidad de medida no debe exceder 50 caracteres."),
	lote: z
		.string()
		.trim()
		.min(1, "El lote es requerido.")
		.max(100, "El lote no debe exceder 100 caracteres."),
	fechaCaducidad: fechaRequeridaSchema("La fecha de caducidad"),
	periodoRetiroDias: enteroNoNegativoSchema("El período de retiro"),
	costoUnitario: numeroOpcionalNoNegativoSchema("El costo unitario"),
};

export const crearInsumoSchema = z.object({
	...baseInsumoFields,
	stockInicial: numeroNoNegativoSchema("El stock inicial"),
});

export const actualizarInsumoSchema = z.object({
	...baseInsumoFields,
	stockInicial: z.string(),
});

export const abastecerInsumoSchema = z.object({
	cantidad: numeroPositivoSchema("La cantidad a ingresar"),
	costoUnitario: numeroOpcionalNoNegativoSchema("El costo unitario"),
	motivo: z.string().trim().max(255, "Máximo 255 caracteres."),
});

export const consumirInsumoSchema = (stockDisponible: number) =>
	z.object({
		cantidad: numeroPositivoSchema("La cantidad a consumir", stockDisponible),
		motivo: z.string().trim().max(255, "Máximo 255 caracteres."),
	});

export const ajustarStockSchema = z.object({
	cantidadDelta: z
		.string()
		.trim()
		.min(1, "La variación de stock es requerida.")
		.refine(
			(v) => !Number.isNaN(Number(v)) && Number(v) !== 0,
			"La variación debe ser un número distinto de 0 (positivo o negativo).",
		),
	motivo: z
		.string()
		.trim()
		.min(3, "Indica el motivo del ajuste (mín. 3 caracteres).")
		.max(255, "Máximo 255 caracteres."),
	costoUnitario: numeroOpcionalNoNegativoSchema("El costo unitario"),
});

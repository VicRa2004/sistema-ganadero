import { z } from "zod";
import {
	limitQuerySchema,
	pageQuerySchema,
} from "@/core/shared/infrastructure/libs/paginationSchemas";
import {
	CATEGORIAS_GASTO,
	TIPOS_TRANSACCION,
} from "../../../domain/CategoriaGasto";

export const comercialIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, "ID inválido").transform(Number),
});

export const registrarVentaSchema = z.object({
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
	contraparte: z.string().trim().min(1, "La contraparte es requerida").max(200),
	moneda: z.string().trim().min(1).max(10).optional().default("MXN"),
	documento: z.string().trim().max(150).nullable().optional(),
	observaciones: z.string().trim().max(1000).nullable().optional(),
	items: z
		.array(
			z.object({
				ganadoId: z.number().int().positive(),
				precio: z.number().min(0, "El precio no puede ser negativo"),
				pesoRegistro: z.number().positive().optional(),
			}),
		)
		.min(1, "Debes incluir al menos un animal en la venta"),
});

export const registrarCompraSchema = z.object({
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
	contraparte: z.string().trim().min(1, "La contraparte es requerida").max(200),
	moneda: z.string().trim().min(1).max(10).optional().default("MXN"),
	documento: z.string().trim().max(150).nullable().optional(),
	observaciones: z.string().trim().max(1000).nullable().optional(),
	items: z
		.array(
			z.object({
				identificador: z.string().trim().min(1).max(50),
				peso: z.number().positive(),
				fechaNacimiento: z
					.string()
					.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
					.refine(
						(v) => new Date(v) <= new Date(),
						"La fecha de nacimiento no puede ser futura",
					),
				sexo: z.enum(["MACHO", "HEMBRA"]),
				razaId: z.number().int().positive(),
				terrenoId: z.number().int().positive(),
				propietarioId: z.number().int().positive(),
				precio: z.number().min(0, "El precio no puede ser negativo"),
				procedencia: z.string().trim().max(200).nullable().optional(),
			}),
		)
		.min(1, "Debes incluir al menos un animal en la compra"),
});

export const listarTransaccionesQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	tipo: z.enum(TIPOS_TRANSACCION).optional(),
	desde: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'desde' inválida")
		.optional(),
	hasta: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'hasta' inválida")
		.optional(),
});

export const registrarGastoSchema = z.object({
	categoria: z.enum(CATEGORIAS_GASTO),
	concepto: z.string().trim().min(1, "El concepto es requerido").max(200),
	monto: z.number().positive("El monto debe ser mayor a cero"),
	fecha: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
	terrenoId: z.number().int().positive().nullable().optional(),
	ganadoId: z.number().int().positive().nullable().optional(),
	loteId: z.number().int().positive().nullable().optional(),
	observaciones: z.string().trim().max(1000).nullable().optional(),
});

export const actualizarGastoSchema = registrarGastoSchema.partial();

export const listarGastosQuerySchema = z.object({
	page: pageQuerySchema,
	limit: limitQuerySchema(),
	categoria: z.enum(CATEGORIAS_GASTO).optional(),
	terrenoId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	ganadoId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	loteId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	desde: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'desde' inválida")
		.optional(),
	hasta: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'hasta' inválida")
		.optional(),
});

export const rentabilidadQuerySchema = z.object({
	desde: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'desde' inválida")
		.optional(),
	hasta: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), "Fecha 'hasta' inválida")
		.optional(),
});

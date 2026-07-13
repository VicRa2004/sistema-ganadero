import { z } from "zod";

export const registrarGanadoSchema = z.object({
	identificador: z
		.string()
		.min(1, "El identificador (arete) es requerido")
		.max(50, "El identificador no puede exceder los 50 caracteres"),
	peso: z.number().positive("El peso debe ser un número positivo"),
	fechaNacimiento: z
		.string()
		.min(1, "La fecha de nacimiento es requerida")
		.refine((val) => !Number.isNaN(Date.parse(val)), {
			message: "La fecha de nacimiento no es válida",
		})
		.refine((val) => new Date(val) <= new Date(), {
			message: "La fecha de nacimiento no puede ser futura",
		}),
	sexo: z.enum(["MACHO", "HEMBRA"], {
		message: "El sexo debe ser MACHO o HEMBRA",
	}),
	razaId: z.number().int().positive("La raza es requerida"),
	terrenoId: z.number().int().positive("El terreno es requerido"),
	propietarioId: z.number().int().positive("El propietario es requerido"),
	padreId: z.number().int().positive().nullable().optional(),
	madreId: z.number().int().positive().nullable().optional(),
});

export const actualizarGanadoSchema = z.object({
	identificador: z.string().min(1).max(50).optional(),
	peso: z.number().positive().optional(),
	fechaNacimiento: z
		.string()
		.refine((val) => !Number.isNaN(Date.parse(val)), {
			message: "La fecha de nacimiento no es válida",
		})
		.refine((val) => new Date(val) <= new Date(), {
			message: "La fecha de nacimiento no puede ser futura",
		})
		.optional(),
	sexo: z.enum(["MACHO", "HEMBRA"]).optional(),
	razaId: z.number().int().positive().optional(),
	terrenoId: z.number().int().positive().optional(),
	propietarioId: z.number().int().positive().optional(),
	padreId: z.number().int().positive().nullable().optional(),
	madreId: z.number().int().positive().nullable().optional(),
});

export const darDeBajaSchema = z.object({
	fechaBaja: z
		.string()
		.min(1, "La fecha de baja es requerida")
		.refine((val) => !Number.isNaN(Date.parse(val)), {
			message: "La fecha de baja no es válida",
		}),
	motivoBajaId: z.number().int().positive("El motivo de baja es requerido"),
});

export const registrarPesajeSchema = z.object({
	peso: z.number().positive("El peso debe ser un número positivo"),
});

export const trasladarGanadoSchema = z.object({
	terrenoId: z.number().int().positive("El terreno destino es requerido"),
});

export const ganadoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const ganadoIdOrIdentificadorSchema = z.object({
	idOrIdentificador: z.string().min(1, "El ID o identificador es requerido"),
});

export const listarGanadoQuerySchema = z.object({
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
	identificador: z.string().optional(),
	terrenoId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	razaId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	propietarioId: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined)),
	soloActivos: z
		.string()
		.optional()
		.transform((v) => v !== "false"),
});

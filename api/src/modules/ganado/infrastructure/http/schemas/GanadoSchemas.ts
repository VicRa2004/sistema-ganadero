import { z } from "zod";

export const registrarGanadoSchema = z.object({
	identificador: z
		.string()
		.min(1, "El identificador (arete) es requerido")
		.max(50, "El identificador no puede exceder los 50 caracteres"),
	peso: z.number().positive("El peso debe ser un número positivo"),
	edadEnMeses: z
		.number()
		.int("La edad en meses debe ser un número entero")
		.nonnegative("La edad en meses no puede ser negativa"),
	sexo: z.enum(["MACHO", "HEMBRA"], {
		message: "El sexo debe ser MACHO o HEMBRA",
	}),
	razaId: z.number().int().positive("La raza es requerida"),
	ranchoId: z.number().int().positive("El rancho es requerido"),
	propietarioId: z.number().int().positive("El propietario es requerido"),
});

export const actualizarGanadoSchema = registrarGanadoSchema.partial();

export const registrarPesajeSchema = z.object({
	peso: z.number().positive("El peso debe ser un número positivo"),
});

export const trasladarGanadoSchema = z.object({
	ranchoId: z.number().int().positive("El rancho destino es requerido"),
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
	ranchoId: z
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
});

import { z } from "zod";

const EnvSchema = z.object({
	PORT: z.coerce.number("El puerto debe ser un numero").default(3000),
	NODE_ENV: z.enum(["dev", "prod", "production", "test"]).default("dev"),
	DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL valida"),
	JWT_SECRET: z.string().min(1, "JWT_SECRET es obligatorio"),
	// Orígenes permitidos para CORS, separados por comas. Vacío = solo mismo origen.
	CORS_ORIGINS: z
		.string()
		.default("")
		.transform((value) =>
			value
				.split(",")
				.map((origin) => origin.trim())
				.filter(Boolean),
		),
	// Tamaño máximo (en bytes) por imagen subida. Por defecto 5 MB.
	UPLOAD_MAX_SIZE: z.coerce
		.number("UPLOAD_MAX_SIZE debe ser un numero")
		.int()
		.positive()
		.default(5 * 1024 * 1024),
	// Leer la IP real desde X-Forwarded-For (activar solo detrás de un proxy de confianza)
	TRUST_PROXY: z
		.enum(["true", "false"])
		.default("false")
		.transform((value) => value === "true"),
});

const envPrev = {
	PORT: process.env.PORT,
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	CORS_ORIGINS: process.env.CORS_ORIGINS,
	UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
	TRUST_PROXY: process.env.TRUST_PROXY,
};

export const env = EnvSchema.parse(envPrev);

import { z } from "zod";

const JWT_SECRET_MIN_LENGTH = 32;

/** Valores de ejemplo de los `.env.example`; nunca deben usarse en producción. */
const JWT_SECRET_PLACEHOLDER = /supersecret|cambiar|change[_-]?me|dev_local/i;

export const EnvSchema = z
	.object({
		PORT: z.coerce.number("El puerto debe ser un numero").default(3000),
		// Interfaz donde escucha el servidor. 0.0.0.0 para contenedores; 127.0.0.1 para solo local.
		HOST: z.string().min(1).default("0.0.0.0"),
		// "production" es un alias de "prod": se normaliza para tener un único valor
		NODE_ENV: z
			.enum(["dev", "prod", "production", "test"])
			.default("dev")
			.transform((value) => (value === "production" ? "prod" : value)),
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
		// Tamaño máximo (en bytes) de las peticiones que no son multipart (JSON). Por defecto 100 KB.
		BODY_MAX_SIZE: z.coerce
			.number("BODY_MAX_SIZE debe ser un numero")
			.int()
			.positive()
			.default(100 * 1024),
		// Nivel mínimo de logs. Por defecto "debug" fuera de producción y "info" en producción.
		LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
		// Exponer Swagger (/api-docs). Por defecto solo fuera de producción.
		ENABLE_API_DOCS: z
			.enum(["true", "false"])
			.optional()
			.transform((value) =>
				value === undefined ? undefined : value === "true",
			),
		// Registro público (POST /api/auth/register). Por defecto cerrado: los usuarios los crea un admin.
		ALLOW_PUBLIC_REGISTER: z
			.enum(["true", "false"])
			.default("false")
			.transform((value) => value === "true"),
		// Leer la IP real desde X-Forwarded-For (activar solo detrás de un proxy de confianza)
		TRUST_PROXY: z
			.enum(["true", "false"])
			.default("false")
			.transform((value) => value === "true"),
	})
	.superRefine((value, ctx) => {
		// En tests se permiten secretos cortos para no ensuciar los fixtures
		if (value.NODE_ENV === "test") return;

		if (value.JWT_SECRET.length < JWT_SECRET_MIN_LENGTH) {
			ctx.addIssue({
				code: "custom",
				path: ["JWT_SECRET"],
				message: `JWT_SECRET debe tener al menos ${JWT_SECRET_MIN_LENGTH} caracteres (genera uno con: openssl rand -base64 48)`,
			});
		}

		if (
			value.NODE_ENV === "prod" &&
			JWT_SECRET_PLACEHOLDER.test(value.JWT_SECRET)
		) {
			ctx.addIssue({
				code: "custom",
				path: ["JWT_SECRET"],
				message:
					"JWT_SECRET usa un valor de ejemplo; define un secreto aleatorio propio en producción",
			});
		}
	})
	.transform((value) => ({
		...value,
		isProd: value.NODE_ENV === "prod",
		LOG_LEVEL:
			value.LOG_LEVEL ?? (value.NODE_ENV === "prod" ? "info" : "debug"),
	}));

const envPrev = {
	PORT: process.env.PORT,
	HOST: process.env.HOST,
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	CORS_ORIGINS: process.env.CORS_ORIGINS,
	UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
	TRUST_PROXY: process.env.TRUST_PROXY,
	BODY_MAX_SIZE: process.env.BODY_MAX_SIZE,
	ENABLE_API_DOCS: process.env.ENABLE_API_DOCS,
	ALLOW_PUBLIC_REGISTER: process.env.ALLOW_PUBLIC_REGISTER,
	LOG_LEVEL: process.env.LOG_LEVEL,
};

export const env = EnvSchema.parse(envPrev);

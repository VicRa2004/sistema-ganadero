import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Prisma } from "@/generated/prisma/client";
import { logger } from "@/core/config/logger";

const CODIGOS: Record<number, string> = {
	400: "BAD_REQUEST",
	401: "UNAUTHORIZED",
	403: "FORBIDDEN",
	404: "NOT_FOUND",
	409: "CONFLICT",
	413: "PAYLOAD_TOO_LARGE",
	429: "TOO_MANY_REQUESTS",
	500: "INTERNAL_ERROR",
};

/**
 * Formato único de error de la API: `{ error: { code, message, details?, requestId } }`.
 * `code` es un identificador estable derivado del estado HTTP.
 */
export function errorResponse(
	c: Context,
	status: ContentfulStatusCode,
	message: string,
	details?: unknown,
): Response {
	return c.json(
		{
			error: {
				code: CODIGOS[status] ?? `HTTP_${status}`,
				message,
				...(details === undefined ? {} : { details }),
				requestId: c.get("requestId") as string | undefined,
			},
		},
		status,
	);
}

interface MappedError {
	status: 404 | 409;
	message: string;
}

/**
 * Traduce errores conocidos de Prisma a respuestas HTTP seguras, sin exponer
 * detalles del esquema ni de la base de datos. Devuelve null si no hay mapeo.
 */
export function mapPrismaError(error: unknown): MappedError | null {
	if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

	switch (error.code) {
		case "P2002":
			return { status: 409, message: "Ya existe un registro con esos datos" };
		case "P2003":
			return {
				status: 409,
				message: "La operación entra en conflicto con datos relacionados",
			};
		case "P2025":
			return { status: 404, message: "El registro solicitado no existe" };
		default:
			return null;
	}
}

/**
 * Responde un error inesperado (5xx) sin filtrar su detalle: el mensaje real se
 * registra en el servidor junto al requestId, que se devuelve al cliente para
 * poder correlacionar el incidente.
 */
export function internalErrorResponse(c: Context, error: unknown): Response {
	const requestId = c.get("requestId") as string | undefined;
	logger.error(
		`${c.req.method} ${c.req.path} requestId=${requestId ?? "-"}`,
		error,
	);

	return errorResponse(c, 500, "Error interno del servidor");
}

export const BODY_TOO_LARGE_MESSAGE =
	"El cuerpo de la petición excede el tamaño máximo";

/**
 * `bodyLimit` de Hono lanza un BodyLimitError (no exportado) al leer un cuerpo que
 * excede el máximo cuando la petición no trae Content-Length.
 */
export function isBodyLimitError(error: unknown): boolean {
	return error instanceof Error && error.name === "BodyLimitError";
}

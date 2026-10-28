import type { Context } from "hono";
import { toStatusCode } from "./context";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
// Asumiendo que z.treeifyError es una utilidad custom que tienes en tu proyecto.
// Si no, Zod nativo usa error.flatten() o error.format()
import z from "zod";
import type { Actor } from "../../domain/Actor";
import { BaseError } from "../../domain/error/BaseError";
import {
	BODY_TOO_LARGE_MESSAGE,
	errorResponse,
	internalErrorResponse,
	isBodyLimitError,
	mapPrismaError,
} from "./errorResponses";

/**
 * Controlador base para Hono.
 * Proporciona métodos de utilidad para estandarizar las respuestas de éxito y error.
 */
export abstract class BaseController {
	/**
	 * Maneja y formatea los errores capturados en la aplicación.
	 * @param {unknown} error - El error capturado (puede ser ZodError, BaseError o genérico).
	 * @param {Context} c - Contexto de Hono.
	 * @returns {Response} Objeto Response estándar listo para ser retornado por Hono.
	 */
	protected handleError(error: unknown, c: Context): Response {
		if (error instanceof ZodError) {
			return errorResponse(c, 400, "Validation error", z.treeifyError(error));
		}

		if (error instanceof BaseError) {
			return errorResponse(c, toStatusCode(error.code), error.message);
		}

		// Errores HTTP de Hono (p. ej. bodyLimit al leer un cuerpo sin Content-Length) traen su respuesta
		if (error instanceof HTTPException) {
			return error.getResponse();
		}

		if (isBodyLimitError(error)) {
			return errorResponse(c, 413, BODY_TOO_LARGE_MESSAGE);
		}

		// JSON malformado en el cuerpo de la petición
		if (error instanceof SyntaxError) {
			return errorResponse(
				c,
				400,
				"El cuerpo de la petición no es un JSON válido",
			);
		}

		const prismaError = mapPrismaError(error);
		if (prismaError) {
			return errorResponse(c, prismaError.status, prismaError.message);
		}

		// Cualquier otro error es inesperado: se registra y no se expone su mensaje
		return internalErrorResponse(c, error);
	}

	/**
	 * Obtiene el usuario autenticado (cargado por `authMiddleware`) como Actor.
	 * @throws {BaseError} 401 si la petición no está autenticada.
	 */
	protected getActor(c: Context): Actor {
		const user = c.get("user");
		if (!user?.id) {
			throw new BaseError("Usuario no autenticado", 401);
		}
		return { id: user.id, role: user.role };
	}

	/**
	 * Retorna una respuesta de éxito HTTP 200.
	 */
	protected ok(c: Context, data: unknown): Response {
		return c.json(data, 200);
	}

	/**
	 * Retorna una respuesta de creación exitosa HTTP 201.
	 */
	protected created(c: Context, data: unknown): Response {
		return c.json(data, 201);
	}

	/**
	 * Ejecuta un bloque de código asíncrono de forma segura, capturando cualquier error
	 * y delegándolo a `handleError`.
	 * @param {Context} c - Contexto de Hono.
	 * @param {() => Promise<Response>} handler - Función que contiene la lógica del controlador.
	 * @returns {Promise<Response>} La respuesta exitosa o el error formateado.
	 */
	protected async executeSafely(
		c: Context,
		handler: () => Promise<Response>,
	): Promise<Response> {
		try {
			return await handler();
		} catch (error) {
			return this.handleError(error, c);
		}
	}
}

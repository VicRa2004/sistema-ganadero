import { z } from "zod";

/** Tamaño máximo de página permitido en los listados. */
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Página de un listado (query string). Los valores no numéricos o menores a 1
 * se sustituyen por la primera página.
 */
export const pageQuerySchema = z
	.string()
	.optional()
	.default("1")
	.transform((value) => {
		const page = Number(value);
		return Number.isInteger(page) && page >= 1 ? page : 1;
	});

/**
 * Tamaño de página (query string) acotado a `max`. Los valores no numéricos o
 * menores a 1 usan el tamaño por defecto; los mayores a `max` se reducen a `max`.
 */
export const limitQuerySchema = (max: number = MAX_PAGE_SIZE) =>
	z
		.string()
		.optional()
		.default(String(DEFAULT_PAGE_SIZE))
		.transform((value) => {
			const limit = Number(value);
			if (!Number.isFinite(limit) || limit < 1) return DEFAULT_PAGE_SIZE;
			return Math.min(Math.floor(limit), max);
		});

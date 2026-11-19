import type { Context } from "hono";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

/**
 * Extrae el payload JSON y un posible archivo `documentoAdjunto` tanto para
 * `application/json` como para `multipart/form-data` (con campo `payload`).
 */
export async function parseComercialPayload(c: Context): Promise<{
	raw: unknown;
	documentoAdjunto: File | null;
}> {
	const contentType = c.req.header("content-type") ?? "";
	if (contentType.includes("multipart/form-data")) {
		const body = await c.req.parseBody();
		const documentoAdjunto =
			body.documentoAdjunto instanceof File ? body.documentoAdjunto : null;
		if (typeof body.payload === "string") {
			try {
				return { raw: JSON.parse(body.payload), documentoAdjunto };
			} catch {
				throw new ValidationError("El campo 'payload' debe ser un JSON válido");
			}
		}
		return { raw: body, documentoAdjunto };
	}

	const raw = await c.req.json();
	return { raw, documentoAdjunto: null };
}

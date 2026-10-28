import { env } from "@/core/config/env";
import { BaseError } from "../../domain/error/BaseError";
import { type ImageType, detectImageType } from "./detectImageType";

/**
 * Valida tamaño y contenido real de una imagen subida (compartido por todos los drivers de
 * almacenamiento). El tipo se deduce de los magic bytes: nombre y MIME del cliente no son fiables.
 */
export async function validarImagen(
	file: File,
): Promise<{ buffer: ArrayBuffer; type: ImageType }> {
	if (file.size === 0) {
		throw new BaseError("El archivo de imagen está vacío", 400);
	}

	if (file.size > env.UPLOAD_MAX_SIZE) {
		throw new BaseError(
			`La imagen excede el tamaño máximo de ${Math.floor(env.UPLOAD_MAX_SIZE / (1024 * 1024))} MB`,
			413,
		);
	}

	const buffer = await file.arrayBuffer();
	const type = detectImageType(new Uint8Array(buffer));
	if (!type) {
		throw new BaseError(
			"Formato de imagen no permitido. Usa JPEG, PNG o WebP",
			400,
		);
	}

	return { buffer, type };
}

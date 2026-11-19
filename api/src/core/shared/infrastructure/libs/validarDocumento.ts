import { env } from "@/core/config/env";
import { BaseError } from "../../domain/error/BaseError";
import { detectImageType } from "./detectImageType";
import { procesarImagenWebP } from "./procesarImagenWebP";

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

export interface DocumentoProcesado {
	buffer: Buffer;
	extension: ".pdf" | ".webp";
	mime: "application/pdf" | "image/webp";
}

/**
 * Valida tamaño y contenido real de un documento (PDF o imagen JPEG/PNG/WebP).
 * Los PDFs se conservan intactos; las imágenes se normalizan y optimizan a WebP.
 */
export async function validarYProcesarDocumento(
	file: File,
): Promise<DocumentoProcesado> {
	if (file.size === 0) {
		throw new BaseError("El archivo adjunto está vacío", 400);
	}

	if (file.size > env.UPLOAD_MAX_SIZE) {
		throw new BaseError(
			`El archivo adjunto excede el tamaño máximo de ${Math.floor(env.UPLOAD_MAX_SIZE / (1024 * 1024))} MB`,
			413,
		);
	}

	const arrayBuffer = await file.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const esPdf = PDF_SIGNATURE.every((b, idx) => bytes[idx] === b);
	if (esPdf) {
		return {
			buffer: Buffer.from(arrayBuffer),
			extension: ".pdf",
			mime: "application/pdf",
		};
	}

	if (detectImageType(bytes)) {
		return procesarImagenWebP(file);
	}

	throw new BaseError(
		"Formato de documento no permitido. Usa PDF, JPEG, PNG o WebP",
		400,
	);
}

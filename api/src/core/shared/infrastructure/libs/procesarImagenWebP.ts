import sharp from "sharp";
import { BaseError } from "../../domain/error/BaseError";
import { validarImagen } from "./validarImagen";

const MAX_DIMENSION_PX = 1600;
const CALIDAD_WEBP = 82;

export interface ImagenProcesada {
	buffer: Buffer;
	extension: ".webp";
	mime: "image/webp";
}

/**
 * Valida la imagen por tamaño y magic bytes, corrige orientación EXIF,
 * limita sus dimensiones a 1600px (sin agrandar pequeñas) y la convierte a WebP.
 */
export async function procesarImagenWebP(file: File): Promise<ImagenProcesada> {
	const { buffer } = await validarImagen(file);

	try {
		const webpBuffer = await sharp(Buffer.from(buffer))
			.rotate()
			.resize({
				width: MAX_DIMENSION_PX,
				height: MAX_DIMENSION_PX,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: CALIDAD_WEBP })
			.toBuffer();

		return {
			buffer: webpBuffer,
			extension: ".webp",
			mime: "image/webp",
		};
	} catch {
		throw new BaseError(
			"No se pudo procesar la imagen. Verifica que el archivo no esté dañado",
			400,
		);
	}
}

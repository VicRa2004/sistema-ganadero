export type ImageType = { mime: string; extension: string };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
	signature.every((byte, index) => bytes[offset + index] === byte);

/**
 * Detecta el tipo real de una imagen a partir de sus magic bytes.
 * Solo reconoce JPEG, PNG y WebP; cualquier otro contenido devuelve null.
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
		return { mime: "image/jpeg", extension: ".jpg" };
	}

	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return { mime: "image/png", extension: ".png" };
	}

	// WebP: "RIFF" <tamaño> "WEBP"
	if (
		startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
		startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
	) {
		return { mime: "image/webp", extension: ".webp" };
	}

	return null;
}

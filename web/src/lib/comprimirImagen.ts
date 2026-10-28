const LADO_MAX = 1600;
const CALIDAD = 0.8;
const UMBRAL_BYTES = 300 * 1024;

/** Reduce una foto a JPEG de hasta 1600 px antes de subirla (útil con datos móviles en campo). */
export async function comprimirImagen(file: File): Promise<File> {
	if (file.size <= UMBRAL_BYTES) return file;
	try {
		const bitmap = await createImageBitmap(file);
		const escala = Math.min(
			1,
			LADO_MAX / Math.max(bitmap.width, bitmap.height),
		);
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(bitmap.width * escala);
		canvas.height = Math.round(bitmap.height * escala);
		canvas
			.getContext("2d")
			?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/jpeg", CALIDAD),
		);
		if (!blob || blob.size >= file.size) return file;
		return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
			type: "image/jpeg",
		});
	} catch {
		// Formato no decodificable en el navegador: se sube el original y la API decide
		return file;
	}
}

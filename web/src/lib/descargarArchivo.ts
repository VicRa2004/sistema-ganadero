import { api } from "@/config/axios";

/**
 * Descarga un archivo binario autenticado desde la API y dispara la descarga en el navegador.
 */
export async function descargarArchivoApi(
	url: string,
	nombreArchivo: string,
	params?: Record<string, string | number | boolean | undefined>,
): Promise<void> {
	const response = await api.get<Blob>(url, {
		params,
		responseType: "blob",
	});
	const blobUrl = URL.createObjectURL(response.data);
	const anchor = document.createElement("a");
	anchor.href = blobUrl;
	anchor.download = nombreArchivo;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(blobUrl);
}

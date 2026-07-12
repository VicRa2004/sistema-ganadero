export interface ImageStorageService {
	/**
	 * Sube una imagen al sistema de almacenamiento.
	 * @param file El archivo que se desea guardar.
	 * @param folder La carpeta o directorio dentro del almacenamiento (ej: "propietarios").
	 * @returns La ruta pública/URL relativa para acceder a la imagen.
	 */
	upload(file: File, folder: string): Promise<string>;

	/**
	 * Elimina una imagen del sistema de almacenamiento.
	 * @param path La ruta pública/URL relativa de la imagen.
	 */
	delete(path: string): Promise<void>;
}

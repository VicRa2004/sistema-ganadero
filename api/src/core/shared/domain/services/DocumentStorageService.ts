export interface DocumentStorageService {
	/**
	 * Sube un documento adjunto (PDF o imagen) al sistema de almacenamiento.
	 */
	upload(file: File, folder: string): Promise<string>;

	/**
	 * Elimina un documento del sistema de almacenamiento.
	 */
	delete(path: string): Promise<void>;
}

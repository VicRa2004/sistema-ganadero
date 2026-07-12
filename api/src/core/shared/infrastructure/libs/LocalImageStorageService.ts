import { injectable } from "tsyringe";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ImageStorageService } from "../../domain/services/ImageStorageService";

@injectable()
export class LocalImageStorageService implements ImageStorageService {
	private readonly uploadDir = path.join(process.cwd(), "uploads");

	public async upload(file: File, folder: string): Promise<string> {
		// Crear el directorio de destino si no existe
		const targetDir = path.join(this.uploadDir, folder);
		await fs.mkdir(targetDir, { recursive: true });

		// Generar un nombre único para evitar colisiones de nombres de archivos
		const extension = path.extname(file.name) || ".png";
		const uniqueName = `${crypto.randomUUID()}${extension}`;
		const filePath = path.join(targetDir, uniqueName);

		// Escribir el archivo usando Bun.write (método nativo rápido)
		const arrayBuffer = await file.arrayBuffer();
		await Bun.write(filePath, arrayBuffer);

		// Retornar la ruta relativa de acceso público
		return `/uploads/${folder}/${uniqueName}`;
	}

	public async delete(filePath: string): Promise<void> {
		if (!filePath) return;

		// Reemplazar el prefijo del endpoint estático para obtener la ruta relativa física
		const relativePath = filePath.replace(/^\/uploads\//, "");
		const fullPath = path.join(this.uploadDir, relativePath);

		try {
			// Verificar si existe antes de intentar borrar
			await fs.access(fullPath);
			await fs.unlink(fullPath);
		} catch (error) {
			const err = error as { code?: string };
			if (err.code === "ENOENT") {
				console.warn(`El archivo ya no existía en disco: ${fullPath}`);
			} else {
				console.error(
					`Error al intentar borrar el archivo físico ${fullPath}:`,
					error,
				);
			}
		}
	}
}

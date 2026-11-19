import * as fs from "node:fs/promises";
import * as path from "node:path";
import { injectable } from "tsyringe";
import { logger } from "@/core/config/logger";
import type { DocumentStorageService } from "../../domain/services/DocumentStorageService";
import { validarYProcesarDocumento } from "./validarDocumento";

@injectable()
export class LocalDocumentStorageService implements DocumentStorageService {
	private readonly uploadDir = path.join(process.cwd(), "uploads");

	public async upload(file: File, folder: string): Promise<string> {
		const { buffer, extension } = await validarYProcesarDocumento(file);
		const targetDir = path.join(this.uploadDir, folder);
		await fs.mkdir(targetDir, { recursive: true });

		const uniqueName = `${crypto.randomUUID()}${extension}`;
		const filePath = path.join(targetDir, uniqueName);
		await Bun.write(filePath, buffer);

		return `/uploads/${folder}/${uniqueName}`;
	}

	public async delete(filePath: string): Promise<void> {
		if (!filePath) return;

		const relativePath = filePath.replace(/^\/uploads\//, "");
		const fullPath = path.resolve(this.uploadDir, relativePath);
		if (!fullPath.startsWith(this.uploadDir + path.sep)) {
			logger.warn(
				`Ruta de documento fuera del directorio de subidas: ${filePath}`,
			);
			return;
		}

		try {
			await fs.access(fullPath);
			await fs.unlink(fullPath);
		} catch (error) {
			const err = error as { code?: string };
			if (err.code !== "ENOENT") {
				logger.error(
					`Error al intentar borrar documento físico ${fullPath}`,
					error,
				);
			}
		}
	}
}

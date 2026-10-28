import { injectable } from "tsyringe";
import { S3Client } from "bun";
import { env } from "@/core/config/env";
import { logger } from "@/core/config/logger";
import type { ImageStorageService } from "../../domain/services/ImageStorageService";
import { validarImagen } from "./validarImagen";

const PREFIJO = "/uploads/";
/** Vigencia de las URL firmadas con las que se sirve un bucket privado. */
const URL_FIRMADA_SEGUNDOS = 3600;

/**
 * Almacenamiento en S3 / R2 / MinIO (STORAGE_DRIVER=s3). En la BD se guarda la misma ruta
 * `/uploads/<carpeta>/<archivo>` que con el driver local; `/uploads/*` redirige a la URL
 * pública (S3_PUBLIC_URL, p. ej. un CDN) o a una URL firmada si el bucket es privado.
 */
@injectable()
export class S3ImageStorageService implements ImageStorageService {
	private readonly client = new S3Client({
		bucket: env.S3_BUCKET,
		endpoint: env.S3_ENDPOINT,
		region: env.S3_REGION,
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	});

	public async upload(file: File, folder: string): Promise<string> {
		const { buffer, type } = await validarImagen(file);
		const key = `${folder}/${crypto.randomUUID()}${type.extension}`;
		await this.client.write(key, buffer, { type: type.mime });
		return `${PREFIJO}${key}`;
	}

	public async delete(path: string): Promise<void> {
		const key = this.keyDe(path);
		if (!key) return;
		try {
			await this.client.delete(key);
		} catch (error) {
			logger.error(`Error al borrar ${key} del bucket`, error);
		}
	}

	/** URL a la que redirige `/uploads/*` para la ruta guardada en la BD, o null si no es válida. */
	public urlDe(path: string): string | null {
		const key = this.keyDe(path);
		if (!key) return null;
		if (env.S3_PUBLIC_URL) {
			return `${env.S3_PUBLIC_URL.replace(/\/+$/, "")}/${key}`;
		}
		return this.client.presign(key, { expiresIn: URL_FIRMADA_SEGUNDOS });
	}

	// Rechaza rutas fuera de /uploads/ y secuencias de path traversal
	private keyDe(path: string): string | null {
		if (!path?.startsWith(PREFIJO)) return null;
		const key = path.slice(PREFIJO.length);
		return key && !key.split("/").includes("..") ? key : null;
	}
}

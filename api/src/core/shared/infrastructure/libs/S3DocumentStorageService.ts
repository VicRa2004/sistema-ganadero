import { S3Client } from "bun";
import { injectable } from "tsyringe";
import { env } from "@/core/config/env";
import { logger } from "@/core/config/logger";
import type { DocumentStorageService } from "../../domain/services/DocumentStorageService";
import { validarYProcesarDocumento } from "./validarDocumento";

const PREFIJO = "/uploads/";

@injectable()
export class S3DocumentStorageService implements DocumentStorageService {
	private readonly client = new S3Client({
		bucket: env.S3_BUCKET,
		endpoint: env.S3_ENDPOINT,
		region: env.S3_REGION,
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	});

	public async upload(file: File, folder: string): Promise<string> {
		const { buffer, extension, mime } = await validarYProcesarDocumento(file);
		const key = `${folder}/${crypto.randomUUID()}${extension}`;
		await this.client.write(key, buffer, { type: mime });
		return `${PREFIJO}${key}`;
	}

	public async delete(path: string): Promise<void> {
		if (!path?.startsWith(PREFIJO)) return;
		const key = path.slice(PREFIJO.length);
		if (!key || key.split("/").includes("..")) return;
		try {
			await this.client.delete(key);
		} catch (error) {
			logger.error(`Error al borrar documento ${key} del bucket`, error);
		}
	}
}

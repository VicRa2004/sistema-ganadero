import { afterEach, describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { BaseError } from "../../domain/error/BaseError";
import { LocalImageStorageService } from "./LocalImageStorageService";

const FOLDER = "test-uploads";
const service = new LocalImageStorageService();

async function crearPng(width: number, height: number): Promise<Uint8Array> {
	const buf = await sharp({
		create: {
			width,
			height,
			channels: 3,
			background: { r: 34, g: 139, b: 34 },
		},
	})
		.png()
		.toBuffer();
	return new Uint8Array(buf);
}

afterEach(async () => {
	await rm(path.join(process.cwd(), "uploads", FOLDER), {
		recursive: true,
		force: true,
	});
});

describe("LocalImageStorageService", () => {
	it("valida el contenido real, convierte a WebP y guarda el archivo", async () => {
		const png = await crearPng(20, 20);
		const file = new File([png], "foto.html", { type: "text/html" });
		const url = await service.upload(file, FOLDER);

		expect(url).toMatch(new RegExp(`^/uploads/${FOLDER}/[0-9a-f-]+\\.webp$`));

		const guardado = await Bun.file(path.join(process.cwd(), url)).bytes();
		const meta = await sharp(guardado).metadata();
		expect(meta.format).toBe("webp");
		expect(meta.width).toBe(20);

		await service.delete(url);
		expect(await Bun.file(path.join(process.cwd(), url)).exists()).toBe(false);
	});

	it("redimensiona imágenes mayores a 1600px manteniendo proporción", async () => {
		const pngGrande = await crearPng(2400, 1200);
		const file = new File([pngGrande], "grande.png", { type: "image/png" });
		const url = await service.upload(file, FOLDER);

		const guardado = await Bun.file(path.join(process.cwd(), url)).bytes();
		const meta = await sharp(guardado).metadata();
		expect(meta.format).toBe("webp");
		expect(meta.width).toBe(1600);
		expect(meta.height).toBe(800);
	});

	it("rechaza HTML y SVG aunque se renombren como imagen", async () => {
		const html = new File(["<html><script>alert(1)</script>"], "a.png", {
			type: "image/png",
		});
		const svg = new File(
			['<svg xmlns="http://www.w3.org/2000/svg"/>'],
			"a.svg",
			{
				type: "image/svg+xml",
			},
		);

		await expect(service.upload(html, FOLDER)).rejects.toThrow(BaseError);
		await expect(service.upload(svg, FOLDER)).rejects.toMatchObject({
			code: 400,
		});
	});

	it("rechaza archivos vacíos y que superan el tamaño máximo", async () => {
		await expect(
			service.upload(new File([], "a.png"), FOLDER),
		).rejects.toMatchObject({ code: 400 });

		const grande = new File([new Uint8Array(6 * 1024 * 1024)], "a.png");
		await expect(service.upload(grande, FOLDER)).rejects.toMatchObject({
			code: 413,
		});
	});

	it("no borra archivos fuera del directorio de subidas", async () => {
		const marker = path.join(process.cwd(), "package.json");
		await service.delete("/uploads/../package.json");
		expect(await Bun.file(marker).exists()).toBe(true);
	});
});

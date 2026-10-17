import { afterEach, describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import { BaseError } from "../../domain/error/BaseError";
import { LocalImageStorageService } from "./LocalImageStorageService";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
const FOLDER = "test-uploads";
const service = new LocalImageStorageService();

afterEach(async () => {
	await rm(path.join(process.cwd(), "uploads", FOLDER), {
		recursive: true,
		force: true,
	});
});

describe("LocalImageStorageService", () => {
	it("guarda una imagen válida con extensión derivada del contenido", async () => {
		const file = new File([PNG], "foto.html", { type: "text/html" });
		const url = await service.upload(file, FOLDER);

		expect(url).toMatch(new RegExp(`^/uploads/${FOLDER}/[0-9a-f-]+\\.png$`));
		await service.delete(url);
		expect(await Bun.file(path.join(process.cwd(), url)).exists()).toBe(false);
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

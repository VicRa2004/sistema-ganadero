import { describe, expect, it } from "bun:test";
import { detectImageType } from "./detectImageType";

const bytes = (...values: number[]) => new Uint8Array(values);

describe("detectImageType", () => {
	it("detecta JPEG", () => {
		expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe(
			"image/jpeg",
		);
	});

	it("detecta PNG", () => {
		expect(
			detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
				?.extension,
		).toBe(".png");
	});

	it("detecta WebP", () => {
		const webp = bytes(
			0x52,
			0x49,
			0x46,
			0x46,
			0,
			0,
			0,
			0,
			0x57,
			0x45,
			0x42,
			0x50,
		);
		expect(detectImageType(webp)?.mime).toBe("image/webp");
	});

	it("rechaza HTML, SVG y archivos vacíos", () => {
		const encoder = new TextEncoder();
		expect(detectImageType(encoder.encode("<html><script>"))).toBeNull();
		expect(detectImageType(encoder.encode("<svg xmlns="))).toBeNull();
		expect(detectImageType(new Uint8Array())).toBeNull();
	});
});

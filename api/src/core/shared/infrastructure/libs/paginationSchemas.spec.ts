import { describe, expect, it } from "bun:test";
import type { z } from "zod";
import { listarGanadoQuerySchema } from "@/modules/ganado/infrastructure/http/schemas/GanadoSchemas";
import { listarInsumosQuerySchema } from "@/modules/inventario-insumos/infrastructure/http/schemas/InsumoSchemas";
import { listarPropietariosQuerySchema } from "@/modules/propietario/infrastructure/http/schemas/PropietarioSchemas";
import { listarTerrenosQuerySchema } from "@/modules/terreno/infrastructure/http/schemas/TerrenoSchemas";
import { listarVeterinariosQuerySchema } from "@/modules/veterinario/infrastructure/http/schemas/VeterinarioSchemas";
import { getAllUsersSchema } from "@/core/user/infrastructure/http/schemas/userSchemas";
import { limitQuerySchema, pageQuerySchema } from "./paginationSchemas";

describe("pageQuerySchema", () => {
	const parse = (v?: string) => pageQuerySchema.parse(v);

	it("usa 1 por defecto y ante valores inválidos", () => {
		for (const v of [undefined, "", "abc", "0", "-3", "1.5"]) {
			expect(parse(v)).toBe(1);
		}
	});

	it("acepta enteros positivos", () => {
		expect(parse("7")).toBe(7);
	});
});

describe("limitQuerySchema", () => {
	it("usa 10 por defecto y ante valores inválidos", () => {
		const schema = limitQuerySchema();
		for (const v of [undefined, "", "abc", "0", "-5"]) {
			expect(schema.parse(v)).toBe(10);
		}
	});

	it("respeta el valor válido y acota al máximo", () => {
		const schema = limitQuerySchema();
		expect(schema.parse("25")).toBe(25);
		expect(schema.parse("100")).toBe(100);
		expect(schema.parse("101")).toBe(100);
		expect(schema.parse("99999999")).toBe(100);
		expect(limitQuerySchema(5).parse("50")).toBe(5);
	});
});

describe("schemas de listados", () => {
	const listados: [string, z.ZodType<{ limit: number; page: number }>][] = [
		["usuarios", getAllUsersSchema as never],
		["insumos", listarInsumosQuerySchema as never],
		["propietarios", listarPropietariosQuerySchema as never],
		["terrenos", listarTerrenosQuerySchema as never],
		["veterinarios", listarVeterinariosQuerySchema as never],
	];

	for (const [nombre, schema] of listados) {
		it(`${nombre}: acota limit a 100`, () => {
			expect(schema.parse({ limit: "100000" }).limit).toBe(100);
			expect(schema.parse({}).limit).toBe(10);
			expect(schema.parse({ page: "2" }).page).toBe(2);
		});
	}

	it("ganado: conserva hasta 1000 para los selectores del web y acota por encima", () => {
		expect(listarGanadoQuerySchema.parse({ limit: "1000" }).limit).toBe(1000);
		expect(listarGanadoQuerySchema.parse({ limit: "5000" }).limit).toBe(1000);
	});
});

import { describe, expect, it } from "bun:test";
import { EnvSchema } from "./env";

const base = {
	DATABASE_URL: "postgresql://u:p@localhost:5432/db",
};
const SECRETO_VALIDO = "k9Zr2vQe7LpXw4TnB8cYd1HsFg6JmUa3";

describe("EnvSchema · JWT_SECRET", () => {
	it("acepta un secreto aleatorio de 32 o más caracteres", () => {
		const result = EnvSchema.safeParse({
			...base,
			NODE_ENV: "prod",
			JWT_SECRET: SECRETO_VALIDO,
		});
		expect(result.success).toBe(true);
	});

	it("rechaza secretos de menos de 32 caracteres en dev y prod", () => {
		for (const NODE_ENV of ["dev", "prod", "production"]) {
			const result = EnvSchema.safeParse({
				...base,
				NODE_ENV,
				JWT_SECRET: "corto",
			});
			expect(result.success).toBe(false);
		}
	});

	it("rechaza en producción los valores de ejemplo de .env.example", () => {
		const ejemplos = [
			"supersecret_production_key_change_me",
			"CAMBIAR_genera_un_secreto_aleatorio_con_openssl_rand_base64_48",
			"dev_local_secret_solo_para_desarrollo_cambialo_01",
		];
		for (const JWT_SECRET of ejemplos) {
			for (const NODE_ENV of ["prod", "production"]) {
				expect(
					EnvSchema.safeParse({ ...base, NODE_ENV, JWT_SECRET }).success,
				).toBe(false);
			}
		}
	});

	it("permite el valor de ejemplo en desarrollo", () => {
		const result = EnvSchema.safeParse({
			...base,
			NODE_ENV: "dev",
			JWT_SECRET: "dev_local_secret_solo_para_desarrollo_cambialo_01",
		});
		expect(result.success).toBe(true);
	});

	it("permite secretos cortos en tests", () => {
		const result = EnvSchema.safeParse({
			...base,
			NODE_ENV: "test",
			JWT_SECRET: "x",
		});
		expect(result.success).toBe(true);
	});
});

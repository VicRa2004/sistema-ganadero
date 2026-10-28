import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "bun ./prisma/seed.ts",
	},
	datasource: {
		// `prisma generate` (postinstall, build de Docker, CI) no conecta a la BD y corre sin DATABASE_URL;
		// migrate/seed sí la exigen y fallan con el error de conexión de Prisma.
		url: process.env.DATABASE_URL ?? "",
	},
});

import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { container } from "@/core/shared/infrastructure/di/container";
import type { RefreshTokenRepository } from "@/modules/auth/domain/repository/RefreshTokenRepository";
import { env } from "./core/config/env";

const server = Bun.serve({
	hostname: "0.0.0.0",
	port: env.PORT,
	fetch: app.fetch,
});

console.log("-----------------------------------------");
console.log(`🚀 Server ready at: ${server.url}`);
console.log(`📡 Environment: ${env.NODE_ENV}`);
console.log("-----------------------------------------");

// Limpieza periódica de refresh tokens expirados (los revocados se conservan hasta expirar)
const LIMPIEZA_TOKENS_MS = 6 * 60 * 60 * 1000;
const limpiarTokensExpirados = () =>
	container
		.resolve<RefreshTokenRepository>("RefreshTokenRepository")
		.deleteExpired()
		.catch((error) => console.error("Error al limpiar refresh tokens", error));

limpiarTokensExpirados();
setInterval(limpiarTokensExpirados, LIMPIEZA_TOKENS_MS).unref();

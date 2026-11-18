import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { container } from "@/core/shared/infrastructure/di/container";
import type { RefreshTokenRepository } from "@/modules/auth/domain/repository/RefreshTokenRepository";
import type { EvaluarAlertasSanitariasUseCase } from "@/modules/salud/application/useCases/EvaluarAlertasSanitariasUseCase";
import { env } from "./core/config/env";
import { logger } from "./core/config/logger";

const server = Bun.serve({
	hostname: env.HOST,
	port: env.PORT,
	fetch: app.fetch,
});

logger.info(`Servidor listo en ${server.url} (entorno: ${env.NODE_ENV})`);

// Limpieza periódica de refresh tokens expirados (los revocados se conservan hasta expirar)
const LIMPIEZA_TOKENS_MS = 6 * 60 * 60 * 1000;
const limpiarTokensExpirados = () =>
	container
		.resolve<RefreshTokenRepository>("RefreshTokenRepository")
		.deleteExpired()
		.catch((error) => logger.error("Error al limpiar refresh tokens", error));

limpiarTokensExpirados();
setInterval(limpiarTokensExpirados, LIMPIEZA_TOKENS_MS).unref();

// Evaluación diaria de salud y recordatorios (stock bajo, caducidades, tratamientos, planes)
const EVALUACION_SALUD_MS = 24 * 60 * 60 * 1000;
const ejecutarEvaluacionSalud = () =>
	container
		.resolve<EvaluarAlertasSanitariasUseCase>("EvaluarAlertasSanitariasUseCase")
		.run()
		.then((res) =>
			logger.info(
				`Evaluación sanitaria completada: ${res.eventosEmitidos} evento(s), ${res.sesionesGeneradasPorPlanes} sesión(es) generada(s)`,
			),
		)
		.catch((error) =>
			logger.error("Error en evaluación diaria de salud", error),
		);

if (env.NODE_ENV !== "test") {
	setTimeout(ejecutarEvaluacionSalud, 10_000).unref();
	setInterval(ejecutarEvaluacionSalud, EVALUACION_SALUD_MS).unref();
}

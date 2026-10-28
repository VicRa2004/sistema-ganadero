import { env } from "@/core/config/env";

type Level = "debug" | "info" | "warn" | "error";

const write = (level: Level, message: string, meta?: unknown) => {
	const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
	console[level](...(meta === undefined ? [line] : [line, meta]));
};

/** Logger mínimo sobre `console`; punto único para cambiarlo por pino/winston si hace falta. */
export const logger = {
	// shortcut: sin niveles configurables ni JSON, pasar a pino si se necesitan logs estructurados
	debug: (message: string, meta?: unknown) => {
		if (!env.isProd) write("debug", message, meta);
	},
	info: (message: string, meta?: unknown) => write("info", message, meta),
	warn: (message: string, meta?: unknown) => write("warn", message, meta),
	error: (message: string, meta?: unknown) => write("error", message, meta),
};

import { env } from "@/core/config/env";

/**
 * Atributos de la cookie del refresh token. Se usan los mismos al crearla
 * (login, registro, refresh) y al borrarla (logout); si difieren, el
 * navegador no la elimina.
 */
export const REFRESH_COOKIE_NAME = "refreshToken";

export const refreshCookieOptions = {
	httpOnly: true,
	secure: env.isProd,
	sameSite: "Lax",
	path: "/api/auth",
} as const;

export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 días en segundos

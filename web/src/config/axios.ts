import axios from "axios";
import { useAuthStore } from "@/modules/auth/store/authStore";

const API_URL =
	(import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true, // Habilita el envío automático de cookies HTTPOnly
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para inyectar el token de autenticación en cada petición
api.interceptors.request.use(
	(config) => {
		// Obtener el accessToken directamente del estado en memoria de Zustand
		const token = useAuthStore.getState().accessToken;
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

interface FailedRequest {
	resolve: (token: string | null) => void;
	reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
	for (const promise of failedQueue) {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve(token);
		}
	}
	failedQueue = [];
};

// Interceptor para manejar respuestas y errores globales (renovación automática de tokens)
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Si falla con 401 y no se ha reintentado aún, y no es login/registro/refresh
		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry &&
			originalRequest.url &&
			!originalRequest.url.includes("/auth/login") &&
			!originalRequest.url.includes("/auth/register") &&
			!originalRequest.url.includes("/auth/refresh")
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Intentar renovar el token llamando al endpoint de refresh
				const { data } = await api.post<{ accessToken: string }>(
					"/auth/refresh",
				);
				const { accessToken } = data;

				// Actualizar el token en el store de Zustand
				useAuthStore.getState().setAccessToken(accessToken);

				// Actualizar la cabecera por defecto y la petición actual
				api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
				originalRequest.headers.Authorization = `Bearer ${accessToken}`;

				processQueue(null, accessToken);
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				// Si la renovación falla, cerrar sesión en el frontend y redirigir
				useAuthStore.getState().logout();
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

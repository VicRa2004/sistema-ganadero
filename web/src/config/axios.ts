import axios from "axios";

const API_URL =
	(import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para inyectar el token de autenticación en cada petición
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Interceptor para manejar respuestas y errores globales (ej: desautenticación)
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Manejar redirección al login o limpiar tokens expirados
			localStorage.removeItem("auth_token");
		}
		return Promise.reject(error);
	},
);

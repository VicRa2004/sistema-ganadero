import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formatea y extrae mensajes legibles de errores devueltos por la API,
 * incluyendo errores de validación estructurados (ZodError / treeifyError).
 */
// biome-ignore lint/suspicious/noExplicitAny: error is explicitly cast to any to read custom server response
export function formatApiError(error: any): string {
	const data = error?.response?.data;
	if (!data) return error?.message || "Ha ocurrido un error inesperado.";

	// Si hay detalles de validación específicos (como los devueltos por z.treeifyError)
	if (data.details) {
		if (typeof data.details === "string") {
			return data.details;
		}

		if (Array.isArray(data.details)) {
			return data.details.join(", ");
		}

		if (typeof data.details === "object") {
			const messages: string[] = [];
			for (const key of Object.keys(data.details)) {
				const value = data.details[key];
				if (typeof value === "string") {
					messages.push(`${key}: ${value}`);
				} else if (Array.isArray(value)) {
					messages.push(`${key}: ${value.join(", ")}`);
				} else if (value && typeof value === "object") {
					messages.push(`${key}: ${JSON.stringify(value)}`);
				}
			}
			if (messages.length > 0) {
				return messages.join(". ");
			}
		}
	}

	// Si el API retorna un error plano
	if (data.error) {
		return data.error;
	}

	return "Ha ocurrido un error inesperado.";
}

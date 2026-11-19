import { z } from "zod";

export const veterinarioFormSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres.")
		.max(255, "Máximo 255 caracteres."),
	telefono: z
		.string()
		.trim()
		.min(7, "El teléfono debe tener al menos 7 dígitos.")
		.max(20, "Máximo 20 caracteres."),
	cedulaProfesional: z
		.string()
		.trim()
		.min(3, "La cédula profesional es requerida.")
		.max(50, "Máximo 50 caracteres."),
	especialidad: z.string().trim().max(100, "Máximo 100 caracteres."),
});

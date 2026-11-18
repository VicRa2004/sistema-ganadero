export const EDAD_MINIMA_REPRODUCTIVA_MESES = 12;
export const DIAS_GESTACION_BOVINOS = 283;

/** Calcula la edad en meses calendario cumplidos entre `fechaNacimiento` y `referencia`. */
export function calcularEdadMeses(
	fechaNacimiento: Date,
	referencia: Date,
): number {
	const years = referencia.getUTCFullYear() - fechaNacimiento.getUTCFullYear();
	const months = referencia.getUTCMonth() - fechaNacimiento.getUTCMonth();
	let total = years * 12 + months;
	if (referencia.getUTCDate() < fechaNacimiento.getUTCDate()) {
		total -= 1;
	}
	return total;
}

/** Calcula la fecha probable de parto sumando 283 días a la fecha de monta o inseminación. */
export function calcularFechaProbableParto(fechaServicio: Date): Date {
	const probable = new Date(fechaServicio.getTime());
	probable.setUTCDate(probable.getUTCDate() + DIAS_GESTACION_BOVINOS);
	return probable;
}

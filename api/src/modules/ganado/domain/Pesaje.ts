export interface Pesaje {
	id: number;
	ganadoId: number;
	peso: number;
	fecha: Date;
	observaciones: string | null;
}

export interface NuevoPesaje {
	peso: number;
	fecha: Date;
	observaciones: string | null;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Ganancia diaria de peso (GDP) entre dos pesajes, en las unidades de peso por día.
 * Devuelve null si no hay tiempo transcurrido entre ambos.
 */
export function gananciaDiaria(
	anterior: Pick<Pesaje, "peso" | "fecha">,
	actual: Pick<Pesaje, "peso" | "fecha">,
): number | null {
	const dias = (actual.fecha.getTime() - anterior.fecha.getTime()) / MS_POR_DIA;
	if (dias <= 0) return null;
	return (actual.peso - anterior.peso) / dias;
}

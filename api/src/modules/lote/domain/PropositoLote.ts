export const PROPOSITOS_LOTE = [
	"ENGORDA",
	"DESTETE",
	"VIENTRES",
	"RECRIA",
	"LECHE",
	"OTRO",
] as const;

export type PropositoLote = (typeof PROPOSITOS_LOTE)[number];

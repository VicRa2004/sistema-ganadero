export const TIPOS_TRANSACCION = ["COMPRA", "VENTA"] as const;
export type TipoTransaccion = (typeof TIPOS_TRANSACCION)[number];

export const CATEGORIAS_GASTO = [
	"ALIMENTO",
	"MEDICINA",
	"VETERINARIO",
	"MANO_OBRA",
	"MANTENIMIENTO",
	"OTRO",
] as const;
export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

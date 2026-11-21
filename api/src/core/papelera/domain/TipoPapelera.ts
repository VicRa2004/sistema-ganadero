import type { Recurso } from "@/modules/authorization/domain/Recursos";

/** Entidades con borrado lógico que se pueden restaurar o borrar desde la papelera. */
export const TIPOS_PAPELERA = [
	"ganado",
	"lote",
	"insumo",
	"veterinario",
	"propietario",
	"terreno",
] as const;
// El orden importa en la purga: primero lo que depende de los demás (ganado → terreno)

export type TipoPapelera = (typeof TIPOS_PAPELERA)[number];

/** Permiso que se exige para cada tipo (el mismo que en su módulo). */
export const RECURSO_PAPELERA: Record<TipoPapelera, Recurso> = {
	ganado: "ganado",
	lote: "lotes",
	insumo: "inventario-insumos",
	veterinario: "veterinarios",
	propietario: "propietario",
	terreno: "terreno",
};

/** Días que un elemento permanece en la papelera antes de la purga automática. */
export const DIAS_EN_PAPELERA = 30;

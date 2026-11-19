import { z } from "zod";

export const idSelectSchema = (mensaje: string) =>
	z
		.string()
		.refine(
			(val: string): boolean =>
				val !== "" && Number.isInteger(Number(val)) && Number(val) > 0,
			mensaje,
		);

export const numeroPositivoSchema = (campo: string, max?: number) => {
	const base = z
		.string()
		.trim()
		.min(1, `${campo} es requerido.`)
		.refine(
			(v) => !Number.isNaN(Number(v)),
			"Debe introducir un número válido.",
		)
		.refine((v) => Number(v) > 0, `${campo} debe ser mayor a 0.`);
	return max !== undefined
		? base.refine((v) => Number(v) <= max, `${campo} no puede exceder ${max}.`)
		: base;
};

export const numeroNoNegativoSchema = (campo: string) =>
	z
		.string()
		.trim()
		.min(1, `${campo} es requerido.`)
		.refine(
			(v) => !Number.isNaN(Number(v)),
			"Debe introducir un número válido.",
		)
		.refine((v) => Number(v) >= 0, `${campo} no puede ser negativo.`);

export const numeroOpcionalNoNegativoSchema = (campo: string) =>
	z
		.string()
		.trim()
		.refine(
			(v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
			`${campo} debe ser un número mayor o igual a 0.`,
		);

export const enteroNoNegativoSchema = (campo: string) =>
	z
		.string()
		.trim()
		.min(1, `${campo} es requerido.`)
		.refine(
			(v) =>
				!Number.isNaN(Number(v)) &&
				Number.isInteger(Number(v)) &&
				Number(v) >= 0,
			`${campo} debe ser un entero mayor o igual a 0.`,
		);

export const fechaRequeridaSchema = (campo: string, noFutura = false) => {
	const base = z
		.string()
		.trim()
		.min(1, `${campo} es requerida.`)
		.refine((v) => !Number.isNaN(Date.parse(v)), `${campo} no es válida.`);
	return noFutura
		? base.refine(
				(v) => new Date(v) <= new Date(),
				`${campo} no puede ser futura.`,
			)
		: base;
};

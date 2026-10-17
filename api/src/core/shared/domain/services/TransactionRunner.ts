/**
 * Puerto para ejecutar varias operaciones de repositorio como una unidad atómica:
 * si alguna falla, se revierten todas.
 */
export interface TransactionRunner {
	run<T>(work: () => Promise<T>): Promise<T>;
}

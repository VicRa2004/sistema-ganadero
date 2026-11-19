import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Insumo } from "../Insumo";
import type { InsumoFilters } from "./InsumoFilters";

export interface InsumoRepository {
	findById(id: number): Promise<Insumo | null>;
	findAll(filters: InsumoFilters): Promise<Pagination<Insumo>>;
	findCriticos(actor: Actor): Promise<Insumo[]>;
	/**
	 * Persiste el insumo. Al actualizar uno existente NO se escribe el stock, para no
	 * pisar movimientos concurrentes: usa `descontarStock`, `adicionarStock` o `ajustarStock`.
	 */
	save(insumo: Insumo): Promise<Insumo>;
	/**
	 * Descuenta stock de forma atómica (`stock = stock - cantidad` solo si alcanza).
	 * @returns el insumo actualizado, o null si no existe o el stock es insuficiente.
	 */
	descontarStock(id: number, cantidad: number): Promise<Insumo | null>;
	/**
	 * Suma stock de forma atómica (`stock = stock + cantidad`).
	 * @returns el insumo actualizado, o null si no existe.
	 */
	adicionarStock(id: number, cantidad: number): Promise<Insumo | null>;
	/**
	 * Ajusta stock con un delta positivo o negativo de forma atómica, sin dejar stock < 0.
	 */
	ajustarStock?(id: number, delta: number): Promise<Insumo | null>;
	/**
	 * Actualiza únicamente el costo unitario del insumo (para cálculo de promedio ponderado).
	 */
	actualizarCostoUnitario?(
		id: number,
		costoUnitario: number,
	): Promise<Insumo | null>;
	delete(id: number): Promise<void>;
}

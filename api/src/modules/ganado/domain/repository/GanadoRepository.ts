import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Ganado } from "../Ganado";
import type { NuevoPesaje, Pesaje } from "../Pesaje";
import type { GanadoFilters } from "./GanadoFilters";

export interface GanadoRepository {
	findById(id: number): Promise<Ganado | null>;
	findByIdentificador(identificador: string): Promise<Ganado | null>;
	findAll(filters: GanadoFilters): Promise<Pagination<Ganado>>;
	save(ganado: Ganado): Promise<Ganado>;
	/**
	 * Inserta el pesaje y deja `Ganado.peso` igual al pesaje más reciente,
	 * todo en una transacción.
	 */
	registrarPesaje(ganadoId: number, pesaje: NuevoPesaje): Promise<Ganado>;
	/** Pesajes del animal ordenados del más antiguo al más reciente. */
	findPesajes(ganadoId: number): Promise<Pesaje[]>;
	delete(id: number): Promise<void>;
}

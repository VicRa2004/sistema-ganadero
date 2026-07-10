import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Ganado } from "../Ganado";
import type { GanadoFilters } from "./GanadoFilters";

export interface GanadoRepository {
	findById(id: number): Promise<Ganado | null>;
	findByIdentificador(identificador: string): Promise<Ganado | null>;
	findAll(filters: GanadoFilters): Promise<Pagination<Ganado>>;
	save(ganado: Ganado): Promise<Ganado>;
	delete(id: number): Promise<void>;
}

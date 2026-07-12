import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Veterinario } from "../Veterinario";
import type { VeterinarioFilters } from "./VeterinarioFilters";

export interface VeterinarioRepository {
	findById(id: number): Promise<Veterinario | null>;
	findByCedula(cedula: string): Promise<Veterinario | null>;
	findAll(filters: VeterinarioFilters): Promise<Pagination<Veterinario>>;
	save(veterinario: Veterinario): Promise<Veterinario>;
	delete(id: number): Promise<void>;
}

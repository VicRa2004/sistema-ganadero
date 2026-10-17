import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Propietario } from "../Propietario";
import type { PropietarioFilters } from "./PropietarioFilters";

export interface PropietarioRepository {
	findById(id: number): Promise<Propietario | null>;
	/** El correo es único por usuario, no globalmente. */
	findByEmail(correo: string, usuarioId: number): Promise<Propietario | null>;
	findAll(filters: PropietarioFilters): Promise<Pagination<Propietario>>;
	save(propietario: Propietario): Promise<Propietario>;
	delete(id: number): Promise<void>;
}

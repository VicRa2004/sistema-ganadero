import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Rancho } from "../Rancho";
import type { RanchoFilters } from "./RanchoFilters";

export interface RanchoRepository {
	findById(id: number): Promise<Rancho | null>;
	findAll(filters: RanchoFilters): Promise<Pagination<Rancho>>;
	save(rancho: Rancho): Promise<Rancho>;
	delete(id: number): Promise<void>;
	countGanadoByRanchoId(ranchoId: number): Promise<number>;
}

import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Terreno } from "../Terreno";
import type { TerrenoFilters } from "./TerrenoFilters";

export interface TerrenoRepository {
	findById(id: number): Promise<Terreno | null>;
	findAll(filters: TerrenoFilters): Promise<Pagination<Terreno>>;
	save(terreno: Terreno): Promise<Terreno>;
	delete(id: number): Promise<void>;
	countGanadoByRanchoId(terrenoId: number): Promise<number>;
}

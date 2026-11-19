import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Transaccion } from "../Transaccion";
import type { TransaccionFilters } from "./ComercialFilters";

export interface TransaccionRepository {
	save(transaccion: Transaccion): Promise<Transaccion>;
	findById(id: number): Promise<Transaccion | null>;
	findAll(filters: TransaccionFilters): Promise<Pagination<Transaccion>>;
	delete(id: number): Promise<void>;
}

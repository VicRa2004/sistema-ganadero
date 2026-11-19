import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Lote } from "../Lote";
import type { LoteFilters } from "./LoteFilters";

export interface LoteMiembroInfo {
	ganadoId: number;
	identificador: string;
	peso: number;
	sexo: "MACHO" | "HEMBRA";
	razaNombre: string;
	terrenoId: number;
	terrenoNombre: string;
	fechaBaja: string | null;
	fechaIngreso: string;
}

export interface LoteDetailRecord {
	lote: Lote;
	miembros: LoteMiembroInfo[];
}

export interface LoteRepository {
	findById(id: number): Promise<Lote | null>;
	findDetailById(id: number): Promise<LoteDetailRecord | null>;
	findAll(filters: LoteFilters): Promise<Pagination<Lote>>;
	save(lote: Lote): Promise<Lote>;
	delete(id: number): Promise<void>;
	addMembers(loteId: number, ganadoIds: number[]): Promise<void>;
	removeMember(loteId: number, ganadoId: number): Promise<void>;
	findActiveMemberIds(loteId: number): Promise<number[]>;
}

import type { MotivoBaja } from "../MotivoBaja";

export interface MotivoBajaRepository {
	findAll(): Promise<MotivoBaja[]>;
	findById(id: number): Promise<MotivoBaja | null>;
}

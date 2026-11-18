import type { PlanSanitario } from "../PlanSanitario";

export interface PlanSanitarioRepository {
	save(plan: PlanSanitario): Promise<PlanSanitario>;
	findById(id: number): Promise<PlanSanitario | null>;
	findByUsuario(usuarioId?: number): Promise<PlanSanitario[]>;
	findActivosPorEjecutar(
		hasta: Date,
		usuarioId?: number,
	): Promise<PlanSanitario[]>;
	delete(id: number): Promise<void>;
}

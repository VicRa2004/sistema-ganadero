import type { Actor } from "@/core/shared/domain/Actor";
import type { PlanSanitario } from "../PlanSanitario";

export interface PlanSanitarioRepository {
	save(plan: PlanSanitario): Promise<PlanSanitario>;
	findById(id: number): Promise<PlanSanitario | null>;
	findByUsuario(actor: Actor): Promise<PlanSanitario[]>;
	findActivosPorEjecutar(hasta: Date, actor?: Actor): Promise<PlanSanitario[]>;
	delete(id: number): Promise<void>;
}

import { Entity } from "@/core/shared/domain/Entity";
import type { EntityId } from "@/core/shared/domain/EntityId";

export class Propietario extends Entity {
	private constructor(
		private nombre: string,
		id?: EntityId,
	) {
		super(id);
	}
}

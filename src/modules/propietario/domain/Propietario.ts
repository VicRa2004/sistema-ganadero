import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class Propietario extends Entity {
  private constructor(private nombre: string) {
    super(id);
  }
}

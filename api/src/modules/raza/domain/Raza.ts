import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class Raza extends Entity {
	private nombre: string;
	private descripcion: string | null;

	private constructor(
		id: EntityId,
		nombre: string,
		descripcion: string | null,
	) {
		super(id);
		this.nombre = nombre;
		this.descripcion = descripcion;
	}

	/**
	 * Crea una nueva instancia de Raza (registro nuevo sin ID persistido aún)
	 */
	public static create(
		nombre: string,
		descripcion: string | null = null,
	): Raza {
		return new Raza(new EntityId(), nombre, descripcion);
	}

	/**
	 * Reconstituye una Raza existente desde los datos de persistencia
	 */
	public static reconstitute(
		id: number,
		nombre: string,
		descripcion: string | null = null,
	): Raza {
		return new Raza(new EntityId(id), nombre, descripcion);
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getDescripcion(): string | null {
		return this.descripcion;
	}

	/**
	 * Retorna si la entidad es nueva (no persistida)
	 */
	public esNuevo(): boolean {
		return this.id.isNew();
	}

	/**
	 * Actualiza los datos de la raza
	 */
	public actualizar(nombre: string, descripcion: string | null): void {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre de la raza no puede estar vacío");
		}
		this.nombre = nombre;
		this.descripcion = descripcion;
	}
}

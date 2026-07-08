import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class Propietario extends Entity {
	private nombre: string;
	private telefono: string | null;
	private correo: string | null;

	private constructor(
		id: EntityId,
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
	) {
		super(id);
		this.nombre = nombre;
		this.telefono = telefono;
		this.correo = correo;
	}

	public static create(
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
	): Propietario {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del propietario no puede estar vacío");
		}
		return new Propietario(new EntityId(), nombre, telefono, correo);
	}

	public static reconstitute(
		id: number,
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
	): Propietario {
		return new Propietario(new EntityId(id), nombre, telefono, correo);
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getTelefono(): string | null {
		return this.telefono;
	}

	public getCorreo(): string | null {
		return this.correo;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(
		nombre: string,
		telefono: string | null,
		correo: string | null,
	): void {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del propietario no puede estar vacío");
		}
		this.nombre = nombre;
		this.telefono = telefono;
		this.correo = correo;
	}

	public actualizarDatosContacto(
		telefono: string | null,
		correo: string | null,
	): void {
		this.telefono = telefono;
		this.correo = correo;
	}
}

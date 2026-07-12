import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class Veterinario extends Entity {
	private nombre: string;
	private telefono: string;
	private cedulaProfesional: string;
	private especialidad: string | null;

	private constructor(
		id: EntityId,
		nombre: string,
		telefono: string,
		cedulaProfesional: string,
		especialidad: string | null = null,
	) {
		super(id);
		this.nombre = nombre;
		this.telefono = telefono;
		this.cedulaProfesional = cedulaProfesional;
		this.especialidad = especialidad;
	}

	public static create(
		nombre: string,
		telefono: string,
		cedulaProfesional: string,
		especialidad: string | null = null,
	): Veterinario {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del veterinario no puede estar vacío");
		}
		if (!telefono || telefono.trim() === "") {
			throw new Error("El teléfono del veterinario no puede estar vacío");
		}
		if (!cedulaProfesional || cedulaProfesional.trim() === "") {
			throw new Error(
				"La cédula profesional del veterinario no puede estar vacía",
			);
		}
		return new Veterinario(
			new EntityId(),
			nombre,
			telefono,
			cedulaProfesional,
			especialidad,
		);
	}

	public static reconstitute(
		id: number,
		nombre: string,
		telefono: string,
		cedulaProfesional: string,
		especialidad: string | null = null,
	): Veterinario {
		return new Veterinario(
			new EntityId(id),
			nombre,
			telefono,
			cedulaProfesional,
			especialidad,
		);
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getTelefono(): string {
		return this.telefono;
	}

	public getCedulaProfesional(): string {
		return this.cedulaProfesional;
	}

	public getEspecialidad(): string | null {
		return this.especialidad;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(
		nombre: string,
		telefono: string,
		cedulaProfesional: string,
		especialidad: string | null,
	): void {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del veterinario no puede estar vacío");
		}
		if (!telefono || telefono.trim() === "") {
			throw new Error("El teléfono del veterinario no puede estar vacío");
		}
		if (!cedulaProfesional || cedulaProfesional.trim() === "") {
			throw new Error(
				"La cédula profesional del veterinario no puede estar vacía",
			);
		}
		this.nombre = nombre;
		this.telefono = telefono;
		this.cedulaProfesional = cedulaProfesional;
		this.especialidad = especialidad;
	}
}

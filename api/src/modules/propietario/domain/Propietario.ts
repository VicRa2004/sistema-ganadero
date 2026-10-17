import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export class Propietario extends Entity {
	private nombre: string;
	private telefono: string | null;
	private correo: string | null;
	private imagenMarca: string | null;
	private readonly usuarioId: number;

	private constructor(
		id: EntityId,
		usuarioId: number,
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
		imagenMarca: string | null = null,
	) {
		super(id);
		this.usuarioId = usuarioId;
		this.nombre = nombre;
		this.telefono = telefono;
		this.correo = correo;
		this.imagenMarca = imagenMarca;
	}

	public static create(
		usuarioId: number,
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
		imagenMarca: string | null = null,
	): Propietario {
		if (!nombre || nombre.trim() === "") {
			throw new ValidationError(
				"El nombre del propietario no puede estar vacío",
			);
		}
		return new Propietario(
			new EntityId(),
			usuarioId,
			nombre,
			telefono,
			correo,
			imagenMarca,
		);
	}

	public static reconstitute(
		id: number,
		usuarioId: number,
		nombre: string,
		telefono: string | null = null,
		correo: string | null = null,
		imagenMarca: string | null = null,
	): Propietario {
		return new Propietario(
			new EntityId(id),
			usuarioId,
			nombre,
			telefono,
			correo,
			imagenMarca,
		);
	}

	public getUsuarioId(): number {
		return this.usuarioId;
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

	public getImagenMarca(): string | null {
		return this.imagenMarca;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(
		nombre: string,
		telefono: string | null,
		correo: string | null,
		imagenMarca: string | null,
	): void {
		if (!nombre || nombre.trim() === "") {
			throw new ValidationError(
				"El nombre del propietario no puede estar vacío",
			);
		}
		this.nombre = nombre;
		this.telefono = telefono;
		this.correo = correo;
		this.imagenMarca = imagenMarca;
	}

	public actualizarDatosContacto(
		telefono: string | null,
		correo: string | null,
	): void {
		this.telefono = telefono;
		this.correo = correo;
	}
}

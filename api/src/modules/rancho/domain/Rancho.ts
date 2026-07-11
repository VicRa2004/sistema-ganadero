import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class Rancho extends Entity {
	private nombre: string;
	private ubicacion: string;
	private extensionHectareas: number;
	private capacidadMaxima: number;
	private usuarioId: number;

	private constructor(
		id: EntityId,
		nombre: string,
		ubicacion: string,
		extensionHectareas: number,
		capacidadMaxima: number,
		usuarioId: number,
	) {
		super(id);
		this.nombre = nombre;
		this.ubicacion = ubicacion;
		this.extensionHectareas = extensionHectareas;
		this.capacidadMaxima = capacidadMaxima;
		this.usuarioId = usuarioId;
	}

	public static create(
		nombre: string,
		ubicacion: string,
		extensionHectareas: number,
		capacidadMaxima: number,
		usuarioId: number,
	): Rancho {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del rancho no puede estar vacío");
		}
		if (!ubicacion || ubicacion.trim() === "") {
			throw new Error("La ubicación del rancho no puede estar vacía");
		}
		if (extensionHectareas <= 0) {
			throw new Error("La extensión en hectáreas debe ser mayor que cero");
		}
		if (capacidadMaxima <= 0) {
			throw new Error("La capacidad máxima debe ser mayor que cero");
		}

		return new Rancho(
			new EntityId(),
			nombre,
			ubicacion,
			extensionHectareas,
			capacidadMaxima,
			usuarioId,
		);
	}

	public static reconstitute(
		id: number,
		nombre: string,
		ubicacion: string,
		extensionHectareas: number,
		capacidadMaxima: number,
		usuarioId: number,
	): Rancho {
		return new Rancho(
			new EntityId(id),
			nombre,
			ubicacion,
			extensionHectareas,
			capacidadMaxima,
			usuarioId,
		);
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getUbicacion(): string {
		return this.ubicacion;
	}

	public getExtensionHectareas(): number {
		return this.extensionHectareas;
	}

	public getCapacidadMaxima(): number {
		return this.capacidadMaxima;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizarInformacionFisica(
		nombre: string,
		ubicacion: string,
		extensionHectareas: number,
		capacidadMaxima: number,
	): void {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del rancho no puede estar vacío");
		}
		if (!ubicacion || ubicacion.trim() === "") {
			throw new Error("La ubicación del rancho no puede estar vacía");
		}
		if (extensionHectareas <= 0) {
			throw new Error("La extensión en hectáreas debe ser mayor que cero");
		}
		if (capacidadMaxima <= 0) {
			throw new Error("La capacidad máxima debe ser mayor que cero");
		}

		this.nombre = nombre;
		this.ubicacion = ubicacion;
		this.extensionHectareas = extensionHectareas;
		this.capacidadMaxima = capacidadMaxima;
	}
}

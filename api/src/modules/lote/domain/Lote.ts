import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { PropositoLote } from "./PropositoLote";

export class Lote extends Entity {
	private constructor(
		id: EntityId,
		private nombre: string,
		private proposito: PropositoLote,
		private descripcion: string | null,
		private terrenoId: number | null,
		private activo: boolean,
		private readonly usuarioId: number,
		private readonly cantidadAnimales: number = 0,
		private readonly terrenoNombre: string | null = null,
	) {
		super(id);
	}

	public static create(params: {
		nombre: string;
		proposito: PropositoLote;
		descripcion?: string | null;
		terrenoId?: number | null;
		activo?: boolean;
		usuarioId: number;
	}): Lote {
		if (!params.nombre || params.nombre.trim() === "") {
			throw new ValidationError("El nombre del lote es obligatorio");
		}
		if (!params.usuarioId || params.usuarioId <= 0) {
			throw new ValidationError("El usuarioId es obligatorio");
		}
		return new Lote(
			new EntityId(),
			params.nombre.trim(),
			params.proposito,
			params.descripcion?.trim() ? params.descripcion.trim() : null,
			params.terrenoId ?? null,
			params.activo ?? true,
			params.usuarioId,
		);
	}

	public static reconstitute(params: {
		id: number;
		nombre: string;
		proposito: PropositoLote;
		descripcion: string | null;
		terrenoId: number | null;
		activo: boolean;
		usuarioId: number;
		cantidadAnimales?: number;
		terrenoNombre?: string | null;
	}): Lote {
		return new Lote(
			new EntityId(params.id),
			params.nombre,
			params.proposito,
			params.descripcion,
			params.terrenoId,
			params.activo,
			params.usuarioId,
			params.cantidadAnimales ?? 0,
			params.terrenoNombre ?? null,
		);
	}

	public getNombre(): string {
		return this.nombre;
	}
	public getProposito(): PropositoLote {
		return this.proposito;
	}
	public getDescripcion(): string | null {
		return this.descripcion;
	}
	public getTerrenoId(): number | null {
		return this.terrenoId;
	}
	public esActivo(): boolean {
		return this.activo;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getCantidadAnimales(): number {
		return this.cantidadAnimales;
	}
	public getTerrenoNombre(): string | null {
		return this.terrenoNombre;
	}
	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(params: {
		nombre?: string;
		proposito?: PropositoLote;
		descripcion?: string | null;
		terrenoId?: number | null;
		activo?: boolean;
	}): void {
		if (params.nombre !== undefined) {
			if (!params.nombre.trim()) {
				throw new ValidationError("El nombre del lote no puede estar vacío");
			}
			this.nombre = params.nombre.trim();
		}
		if (params.proposito !== undefined) {
			this.proposito = params.proposito;
		}
		if (params.descripcion !== undefined) {
			this.descripcion = params.descripcion?.trim()
				? params.descripcion.trim()
				: null;
		}
		if (params.terrenoId !== undefined) {
			this.terrenoId = params.terrenoId;
		}
		if (params.activo !== undefined) {
			this.activo = params.activo;
		}
	}

	public setTerrenoId(terrenoId: number | null): void {
		this.terrenoId = terrenoId;
	}
}

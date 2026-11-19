import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export class RacionAlimentacion extends Entity {
	private constructor(
		id: EntityId,
		private nombre: string,
		private insumoId: number,
		private terrenoId: number | null,
		private loteId: number | null,
		private cantidadDiariaPorAnimal: number,
		private diasAlertaAutonomia: number,
		private activo: boolean,
		private observaciones: string | null,
		private readonly usuarioId: number,
		private readonly insumoNombre: string = "",
		private readonly insumoUnidad: string = "",
		private readonly terrenoNombre: string | null = null,
		private readonly loteNombre: string | null = null,
	) {
		super(id);
	}

	public static create(params: {
		nombre: string;
		insumoId: number;
		terrenoId?: number | null;
		loteId?: number | null;
		cantidadDiariaPorAnimal: number;
		diasAlertaAutonomia?: number;
		activo?: boolean;
		observaciones?: string | null;
		usuarioId: number;
	}): RacionAlimentacion {
		if (!params.nombre?.trim()) {
			throw new ValidationError("El nombre de la ración es obligatorio");
		}
		if (!params.terrenoId && !params.loteId) {
			throw new ValidationError(
				"La ración debe estar asignada a un terreno o a un lote",
			);
		}
		if (params.cantidadDiariaPorAnimal <= 0) {
			throw new ValidationError(
				"La cantidad diaria por animal debe ser mayor a cero",
			);
		}
		const diasAlerta = params.diasAlertaAutonomia ?? 7;
		if (!Number.isInteger(diasAlerta) || diasAlerta < 1) {
			throw new ValidationError(
				"Los días de alerta de autonomía deben ser un entero >= 1",
			);
		}
		return new RacionAlimentacion(
			new EntityId(),
			params.nombre.trim(),
			params.insumoId,
			params.terrenoId ?? null,
			params.loteId ?? null,
			params.cantidadDiariaPorAnimal,
			diasAlerta,
			params.activo ?? true,
			params.observaciones?.trim() ? params.observaciones.trim() : null,
			params.usuarioId,
		);
	}

	public static reconstitute(params: {
		id: number;
		nombre: string;
		insumoId: number;
		terrenoId: number | null;
		loteId: number | null;
		cantidadDiariaPorAnimal: number;
		diasAlertaAutonomia: number;
		activo: boolean;
		observaciones: string | null;
		usuarioId: number;
		insumoNombre?: string;
		insumoUnidad?: string;
		terrenoNombre?: string | null;
		loteNombre?: string | null;
	}): RacionAlimentacion {
		return new RacionAlimentacion(
			new EntityId(params.id),
			params.nombre,
			params.insumoId,
			params.terrenoId,
			params.loteId,
			params.cantidadDiariaPorAnimal,
			params.diasAlertaAutonomia,
			params.activo,
			params.observaciones,
			params.usuarioId,
			params.insumoNombre ?? "",
			params.insumoUnidad ?? "",
			params.terrenoNombre ?? null,
			params.loteNombre ?? null,
		);
	}

	public getNombre(): string {
		return this.nombre;
	}
	public getInsumoId(): number {
		return this.insumoId;
	}
	public getTerrenoId(): number | null {
		return this.terrenoId;
	}
	public getLoteId(): number | null {
		return this.loteId;
	}
	public getCantidadDiariaPorAnimal(): number {
		return this.cantidadDiariaPorAnimal;
	}
	public getDiasAlertaAutonomia(): number {
		return this.diasAlertaAutonomia;
	}
	public esActivo(): boolean {
		return this.activo;
	}
	public getObservaciones(): string | null {
		return this.observaciones;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getInsumoNombre(): string {
		return this.insumoNombre;
	}
	public getInsumoUnidad(): string {
		return this.insumoUnidad;
	}
	public getTerrenoNombre(): string | null {
		return this.terrenoNombre;
	}
	public getLoteNombre(): string | null {
		return this.loteNombre;
	}
	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(params: {
		nombre?: string;
		insumoId?: number;
		terrenoId?: number | null;
		loteId?: number | null;
		cantidadDiariaPorAnimal?: number;
		diasAlertaAutonomia?: number;
		activo?: boolean;
		observaciones?: string | null;
	}): void {
		if (params.nombre !== undefined) {
			if (!params.nombre.trim()) {
				throw new ValidationError(
					"El nombre de la ración no puede estar vacío",
				);
			}
			this.nombre = params.nombre.trim();
		}
		if (params.insumoId !== undefined) this.insumoId = params.insumoId;
		if (params.terrenoId !== undefined) this.terrenoId = params.terrenoId;
		if (params.loteId !== undefined) this.loteId = params.loteId;
		if (!this.terrenoId && !this.loteId) {
			throw new ValidationError(
				"La ración debe estar asignada a un terreno o a un lote",
			);
		}
		if (params.cantidadDiariaPorAnimal !== undefined) {
			if (params.cantidadDiariaPorAnimal <= 0) {
				throw new ValidationError(
					"La cantidad diaria por animal debe ser mayor a cero",
				);
			}
			this.cantidadDiariaPorAnimal = params.cantidadDiariaPorAnimal;
		}
		if (params.diasAlertaAutonomia !== undefined) {
			if (
				!Number.isInteger(params.diasAlertaAutonomia) ||
				params.diasAlertaAutonomia < 1
			) {
				throw new ValidationError(
					"Los días de alerta de autonomía deben ser un entero >= 1",
				);
			}
			this.diasAlertaAutonomia = params.diasAlertaAutonomia;
		}
		if (params.activo !== undefined) this.activo = params.activo;
		if (params.observaciones !== undefined) {
			this.observaciones = params.observaciones?.trim()
				? params.observaciones.trim()
				: null;
		}
	}
}

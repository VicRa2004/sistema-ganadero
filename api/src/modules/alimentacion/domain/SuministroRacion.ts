import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export class SuministroRacion extends Entity {
	private constructor(
		id: EntityId,
		private readonly racionId: number,
		private readonly insumoId: number,
		private readonly terrenoId: number | null,
		private readonly loteId: number | null,
		private readonly fecha: Date,
		private readonly cantidadAnimales: number,
		private readonly cantidadTotal: number,
		private readonly costoTotal: number,
		private readonly observaciones: string | null,
		private readonly usuarioId: number,
		private readonly racionNombre: string = "",
		private readonly insumoNombre: string = "",
		private readonly insumoUnidad: string = "",
	) {
		super(id);
	}

	public static create(params: {
		racionId: number;
		insumoId: number;
		terrenoId: number | null;
		loteId: number | null;
		fecha: Date;
		cantidadAnimales: number;
		cantidadTotal: number;
		costoTotal: number;
		observaciones?: string | null;
		usuarioId: number;
	}): SuministroRacion {
		if (params.cantidadAnimales <= 0) {
			throw new ValidationError(
				"La cantidad de animales debe ser mayor a cero",
			);
		}
		if (params.cantidadTotal <= 0) {
			throw new ValidationError(
				"La cantidad total suministrada debe ser mayor a cero",
			);
		}
		if (params.costoTotal < 0) {
			throw new ValidationError("El costo total no puede ser negativo");
		}
		return new SuministroRacion(
			new EntityId(),
			params.racionId,
			params.insumoId,
			params.terrenoId,
			params.loteId,
			params.fecha,
			params.cantidadAnimales,
			params.cantidadTotal,
			params.costoTotal,
			params.observaciones?.trim() ? params.observaciones.trim() : null,
			params.usuarioId,
		);
	}

	public static reconstitute(params: {
		id: number;
		racionId: number;
		insumoId: number;
		terrenoId: number | null;
		loteId: number | null;
		fecha: Date;
		cantidadAnimales: number;
		cantidadTotal: number;
		costoTotal: number;
		observaciones: string | null;
		usuarioId: number;
		racionNombre?: string;
		insumoNombre?: string;
		insumoUnidad?: string;
	}): SuministroRacion {
		return new SuministroRacion(
			new EntityId(params.id),
			params.racionId,
			params.insumoId,
			params.terrenoId,
			params.loteId,
			params.fecha,
			params.cantidadAnimales,
			params.cantidadTotal,
			params.costoTotal,
			params.observaciones,
			params.usuarioId,
			params.racionNombre ?? "",
			params.insumoNombre ?? "",
			params.insumoUnidad ?? "",
		);
	}

	public getRacionId(): number {
		return this.racionId;
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
	public getFecha(): Date {
		return this.fecha;
	}
	public getCantidadAnimales(): number {
		return this.cantidadAnimales;
	}
	public getCantidadTotal(): number {
		return this.cantidadTotal;
	}
	public getCostoTotal(): number {
		return this.costoTotal;
	}
	public getObservaciones(): string | null {
		return this.observaciones;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getRacionNombre(): string {
		return this.racionNombre;
	}
	public getInsumoNombre(): string {
		return this.insumoNombre;
	}
	public getInsumoUnidad(): string {
		return this.insumoUnidad;
	}
}

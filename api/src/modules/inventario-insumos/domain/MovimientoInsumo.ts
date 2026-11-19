import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export const TIPOS_MOVIMIENTO_INSUMO = ["ENTRADA", "SALIDA", "AJUSTE"] as const;
export type TipoMovimientoInsumo = (typeof TIPOS_MOVIMIENTO_INSUMO)[number];

export class MovimientoInsumo extends Entity {
	private constructor(
		id: EntityId,
		private readonly insumoId: number,
		private readonly tipo: TipoMovimientoInsumo,
		private readonly cantidad: number,
		private readonly delta: number,
		private readonly costoUnitario: number | null,
		private readonly motivo: string,
		private readonly referenciaTipo: string | null,
		private readonly referenciaId: number | null,
		private readonly ganadoId: number | null,
		private readonly terrenoId: number | null,
		private readonly loteId: number | null,
		private readonly usuarioId: number,
		private readonly fecha: Date,
	) {
		super(id);
	}

	public static create(params: {
		insumoId: number;
		tipo: TipoMovimientoInsumo;
		cantidad: number;
		costoUnitario?: number | null;
		motivo: string;
		referenciaTipo?: string | null;
		referenciaId?: number | null;
		ganadoId?: number | null;
		terrenoId?: number | null;
		loteId?: number | null;
		usuarioId: number;
		fecha?: Date;
	}): MovimientoInsumo {
		if (!params.insumoId || params.insumoId <= 0) {
			throw new ValidationError("El insumoId es requerido en el kardex");
		}
		if (!params.motivo || params.motivo.trim() === "") {
			throw new ValidationError("El motivo del movimiento es requerido");
		}
		if (
			params.costoUnitario !== undefined &&
			params.costoUnitario !== null &&
			params.costoUnitario < 0
		) {
			throw new ValidationError("El costo unitario no puede ser negativo");
		}

		let delta = params.cantidad;
		if (params.tipo === "ENTRADA") {
			if (params.cantidad <= 0) {
				throw new ValidationError("Una entrada debe ser mayor a cero");
			}
			delta = params.cantidad;
		} else if (params.tipo === "SALIDA") {
			if (params.cantidad <= 0) {
				throw new ValidationError("Una salida debe ser mayor a cero");
			}
			delta = -params.cantidad;
		} else {
			if (params.cantidad === 0) {
				throw new ValidationError("Un ajuste de stock no puede ser cero");
			}
			delta = params.cantidad;
		}

		return new MovimientoInsumo(
			new EntityId(),
			params.insumoId,
			params.tipo,
			params.cantidad,
			delta,
			params.costoUnitario ?? null,
			params.motivo.trim(),
			params.referenciaTipo ?? null,
			params.referenciaId ?? null,
			params.ganadoId ?? null,
			params.terrenoId ?? null,
			params.loteId ?? null,
			params.usuarioId,
			params.fecha ?? new Date(),
		);
	}

	public static reconstitute(params: {
		id: number;
		insumoId: number;
		tipo: TipoMovimientoInsumo;
		cantidad: number;
		delta: number;
		costoUnitario: number | null;
		motivo: string;
		referenciaTipo: string | null;
		referenciaId: number | null;
		ganadoId: number | null;
		terrenoId: number | null;
		loteId: number | null;
		usuarioId: number;
		fecha: Date;
	}): MovimientoInsumo {
		return new MovimientoInsumo(
			new EntityId(params.id),
			params.insumoId,
			params.tipo,
			params.cantidad,
			params.delta,
			params.costoUnitario,
			params.motivo,
			params.referenciaTipo,
			params.referenciaId,
			params.ganadoId,
			params.terrenoId,
			params.loteId,
			params.usuarioId,
			params.fecha,
		);
	}

	public getInsumoId(): number {
		return this.insumoId;
	}
	public getTipo(): TipoMovimientoInsumo {
		return this.tipo;
	}
	public getCantidad(): number {
		return this.cantidad;
	}
	public getDelta(): number {
		return this.delta;
	}
	public getCostoUnitario(): number | null {
		return this.costoUnitario;
	}
	public getMotivo(): string {
		return this.motivo;
	}
	public getReferenciaTipo(): string | null {
		return this.referenciaTipo;
	}
	public getReferenciaId(): number | null {
		return this.referenciaId;
	}
	public getGanadoId(): number | null {
		return this.ganadoId;
	}
	public getTerrenoId(): number | null {
		return this.terrenoId;
	}
	public getLoteId(): number | null {
		return this.loteId;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getFecha(): Date {
		return this.fecha;
	}
}

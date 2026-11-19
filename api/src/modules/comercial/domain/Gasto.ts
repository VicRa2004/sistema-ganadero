import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { CategoriaGasto } from "./CategoriaGasto";

export class Gasto extends Entity {
	private constructor(
		id: EntityId,
		private categoria: CategoriaGasto,
		private concepto: string,
		private monto: number,
		private fecha: Date,
		private terrenoId: number | null,
		private ganadoId: number | null,
		private loteId: number | null,
		private observaciones: string | null,
		private readonly usuarioId: number,
		private readonly terrenoNombre: string | null = null,
		private readonly ganadoIdentificador: string | null = null,
		private readonly loteNombre: string | null = null,
	) {
		super(id);
	}

	public static create(params: {
		categoria: CategoriaGasto;
		concepto: string;
		monto: number;
		fecha: Date;
		terrenoId?: number | null;
		ganadoId?: number | null;
		loteId?: number | null;
		observaciones?: string | null;
		usuarioId: number;
	}): Gasto {
		if (!params.concepto?.trim()) {
			throw new ValidationError("El concepto del gasto es obligatorio");
		}
		if (Number.isNaN(params.monto) || params.monto <= 0) {
			throw new ValidationError("El monto del gasto debe ser mayor a cero");
		}
		if (Number.isNaN(params.fecha.getTime())) {
			throw new ValidationError("La fecha del gasto es inválida");
		}
		return new Gasto(
			new EntityId(),
			params.categoria,
			params.concepto.trim(),
			Number(params.monto.toFixed(2)),
			params.fecha,
			params.terrenoId ?? null,
			params.ganadoId ?? null,
			params.loteId ?? null,
			params.observaciones?.trim() ? params.observaciones.trim() : null,
			params.usuarioId,
		);
	}

	public static reconstitute(params: {
		id: number;
		categoria: CategoriaGasto;
		concepto: string;
		monto: number;
		fecha: Date;
		terrenoId: number | null;
		ganadoId: number | null;
		loteId: number | null;
		observaciones: string | null;
		usuarioId: number;
		terrenoNombre?: string | null;
		ganadoIdentificador?: string | null;
		loteNombre?: string | null;
	}): Gasto {
		return new Gasto(
			new EntityId(params.id),
			params.categoria,
			params.concepto,
			params.monto,
			params.fecha,
			params.terrenoId,
			params.ganadoId,
			params.loteId,
			params.observaciones,
			params.usuarioId,
			params.terrenoNombre ?? null,
			params.ganadoIdentificador ?? null,
			params.loteNombre ?? null,
		);
	}

	public getCategoria(): CategoriaGasto {
		return this.categoria;
	}
	public getConcepto(): string {
		return this.concepto;
	}
	public getMonto(): number {
		return this.monto;
	}
	public getFecha(): Date {
		return this.fecha;
	}
	public getTerrenoId(): number | null {
		return this.terrenoId;
	}
	public getGanadoId(): number | null {
		return this.ganadoId;
	}
	public getLoteId(): number | null {
		return this.loteId;
	}
	public getObservaciones(): string | null {
		return this.observaciones;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getTerrenoNombre(): string | null {
		return this.terrenoNombre;
	}
	public getGanadoIdentificador(): string | null {
		return this.ganadoIdentificador;
	}
	public getLoteNombre(): string | null {
		return this.loteNombre;
	}
	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public actualizar(params: {
		categoria?: CategoriaGasto;
		concepto?: string;
		monto?: number;
		fecha?: Date;
		terrenoId?: number | null;
		ganadoId?: number | null;
		loteId?: number | null;
		observaciones?: string | null;
	}): void {
		if (params.categoria !== undefined) this.categoria = params.categoria;
		if (params.concepto !== undefined) {
			if (!params.concepto.trim()) {
				throw new ValidationError("El concepto no puede estar vacío");
			}
			this.concepto = params.concepto.trim();
		}
		if (params.monto !== undefined) {
			if (Number.isNaN(params.monto) || params.monto <= 0) {
				throw new ValidationError("El monto debe ser mayor a cero");
			}
			this.monto = Number(params.monto.toFixed(2));
		}
		if (params.fecha !== undefined) {
			if (Number.isNaN(params.fecha.getTime())) {
				throw new ValidationError("Fecha inválida");
			}
			this.fecha = params.fecha;
		}
		if (params.terrenoId !== undefined) this.terrenoId = params.terrenoId;
		if (params.ganadoId !== undefined) this.ganadoId = params.ganadoId;
		if (params.loteId !== undefined) this.loteId = params.loteId;
		if (params.observaciones !== undefined) {
			this.observaciones = params.observaciones?.trim()
				? params.observaciones.trim()
				: null;
		}
	}
}

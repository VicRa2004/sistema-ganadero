import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TipoTransaccion } from "./CategoriaGasto";
import type { TransaccionGanado } from "./TransaccionGanado";

export class Transaccion extends Entity {
	private constructor(
		id: EntityId,
		private readonly tipo: TipoTransaccion,
		private readonly fecha: Date,
		private readonly contraparte: string,
		private readonly total: number,
		private readonly moneda: string,
		private readonly documento: string | null,
		private readonly documentoAdjunto: string | null,
		private readonly observaciones: string | null,
		private readonly usuarioId: number,
		private readonly detalles: TransaccionGanado[],
	) {
		super(id);
	}

	public static create(params: {
		tipo: TipoTransaccion;
		fecha: Date;
		contraparte: string;
		moneda?: string;
		documento?: string | null;
		documentoAdjunto?: string | null;
		observaciones?: string | null;
		usuarioId: number;
		detalles: TransaccionGanado[];
	}): Transaccion {
		if (!params.contraparte?.trim()) {
			throw new ValidationError("La contraparte es obligatoria");
		}
		if (Number.isNaN(params.fecha.getTime())) {
			throw new ValidationError("La fecha de la transacción es inválida");
		}
		if (params.detalles.length === 0) {
			throw new ValidationError(
				"La transacción debe incluir al menos un animal",
			);
		}
		const total = Number(
			params.detalles.reduce((acc, d) => acc + d.getPrecio(), 0).toFixed(2),
		);
		return new Transaccion(
			new EntityId(),
			params.tipo,
			params.fecha,
			params.contraparte.trim(),
			total,
			(params.moneda?.trim() || "MXN").toUpperCase(),
			params.documento?.trim() ? params.documento.trim() : null,
			params.documentoAdjunto ?? null,
			params.observaciones?.trim() ? params.observaciones.trim() : null,
			params.usuarioId,
			params.detalles,
		);
	}

	public static reconstitute(params: {
		id: number;
		tipo: TipoTransaccion;
		fecha: Date;
		contraparte: string;
		total: number;
		moneda: string;
		documento: string | null;
		documentoAdjunto: string | null;
		observaciones: string | null;
		usuarioId: number;
		detalles: TransaccionGanado[];
	}): Transaccion {
		return new Transaccion(
			new EntityId(params.id),
			params.tipo,
			params.fecha,
			params.contraparte,
			params.total,
			params.moneda,
			params.documento,
			params.documentoAdjunto,
			params.observaciones,
			params.usuarioId,
			params.detalles,
		);
	}

	public getTipo(): TipoTransaccion {
		return this.tipo;
	}
	public getFecha(): Date {
		return this.fecha;
	}
	public getContraparte(): string {
		return this.contraparte;
	}
	public getTotal(): number {
		return this.total;
	}
	public getMoneda(): string {
		return this.moneda;
	}
	public getDocumento(): string | null {
		return this.documento;
	}
	public getDocumentoAdjunto(): string | null {
		return this.documentoAdjunto;
	}
	public getObservaciones(): string | null {
		return this.observaciones;
	}
	public getUsuarioId(): number {
		return this.usuarioId;
	}
	public getDetalles(): TransaccionGanado[] {
		return this.detalles;
	}
	public esNuevo(): boolean {
		return this.id.isNew();
	}
}

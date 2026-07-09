import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import type { TipoInsumo } from "./TipoInsumo";
import { InsumoCantidadInvalidaError } from "./error/InsumoCantidadInvalidaError";
import { InsumoStockInsuficienteError } from "./error/InsumoStockInsuficienteError";

export class Insumo extends Entity {
	private nombre: string;
	private tipo: TipoInsumo;
	private stock: number;
	private stockMinimo: number;
	private unidadMedida: string;
	private lote: string;
	private fechaCaducidad: Date;

	private constructor(
		id: EntityId,
		nombre: string,
		tipo: TipoInsumo,
		stock: number,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
	) {
		super(id);
		this.nombre = nombre;
		this.tipo = tipo;
		this.stock = stock;
		this.stockMinimo = stockMinimo;
		this.unidadMedida = unidadMedida;
		this.lote = lote;
		this.fechaCaducidad = fechaCaducidad;
	}

	public static create(
		nombre: string,
		tipo: TipoInsumo,
		stock: number,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
	): Insumo {
		if (!nombre || nombre.trim() === "") {
			throw new Error("El nombre del insumo no puede estar vacío");
		}
		if (stock < 0) {
			throw new Error("El stock inicial no puede ser negativo");
		}
		if (stockMinimo < 0) {
			throw new Error("El stock mínimo no puede ser negativo");
		}
		if (!unidadMedida || unidadMedida.trim() === "") {
			throw new Error("La unidad de medida no puede estar vacía");
		}
		if (!lote || lote.trim() === "") {
			throw new Error("El lote del insumo no puede estar vacío");
		}
		return new Insumo(
			new EntityId(),
			nombre,
			tipo,
			stock,
			stockMinimo,
			unidadMedida,
			lote,
			fechaCaducidad,
		);
	}

	public static reconstitute(
		id: number,
		nombre: string,
		tipo: TipoInsumo,
		stock: number,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
	): Insumo {
		return new Insumo(
			new EntityId(id),
			nombre,
			tipo,
			stock,
			stockMinimo,
			unidadMedida,
			lote,
			fechaCaducidad,
		);
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getTipo(): TipoInsumo {
		return this.tipo;
	}

	public getStock(): number {
		return this.stock;
	}

	public getStockMinimo(): number {
		return this.stockMinimo;
	}

	public getUnidadMedida(): string {
		return this.unidadMedida;
	}

	public getLote(): string {
		return this.lote;
	}

	public getFechaCaducidad(): Date {
		return this.fechaCaducidad;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public adicionarStock(cantidad: number): void {
		if (cantidad <= 0) {
			throw new InsumoCantidadInvalidaError(
				"La cantidad a adicionar debe ser mayor a cero",
			);
		}
		this.stock += cantidad;
	}

	public descontarStock(cantidad: number): void {
		if (cantidad <= 0) {
			throw new InsumoCantidadInvalidaError(
				"La cantidad a descontar debe ser mayor a cero",
			);
		}
		if (this.stock - cantidad < 0) {
			throw new InsumoStockInsuficienteError(
				`Stock insuficiente para descontar ${cantidad} ${this.unidadMedida}. Stock disponible: ${this.stock}`,
			);
		}
		this.stock -= cantidad;
	}

	public esBajoStock(): boolean {
		return this.stock <= this.stockMinimo;
	}
}

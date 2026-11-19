import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import type { TipoInsumo } from "./TipoInsumo";
import { InsumoCantidadInvalidaError } from "./error/InsumoCantidadInvalidaError";
import { InsumoStockInsuficienteError } from "./error/InsumoStockInsuficienteError";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export class Insumo extends Entity {
	private nombre: string;
	private tipo: TipoInsumo;
	private stock: number;
	private stockMinimo: number;
	private unidadMedida: string;
	private lote: string;
	private fechaCaducidad: Date;
	private usuarioId: number;
	private periodoRetiroDias: number;
	private costoUnitario: number;

	private constructor(
		id: EntityId,
		nombre: string,
		tipo: TipoInsumo,
		stock: number,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
		usuarioId: number,
		periodoRetiroDias = 0,
		costoUnitario = 0,
	) {
		super(id);
		this.nombre = nombre;
		this.tipo = tipo;
		this.stock = stock;
		this.stockMinimo = stockMinimo;
		this.unidadMedida = unidadMedida;
		this.lote = lote;
		this.fechaCaducidad = fechaCaducidad;
		this.usuarioId = usuarioId;
		this.periodoRetiroDias = periodoRetiroDias;
		this.costoUnitario = costoUnitario;
	}

	public static create(
		nombre: string,
		tipo: TipoInsumo,
		stock: number,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
		usuarioId: number,
		periodoRetiroDias = 0,
		costoUnitario = 0,
	): Insumo {
		if (!nombre || nombre.trim() === "") {
			throw new ValidationError("El nombre del insumo no puede estar vacío");
		}
		if (stock < 0) {
			throw new ValidationError("El stock inicial no puede ser negativo");
		}
		if (stockMinimo < 0) {
			throw new ValidationError("El stock mínimo no puede ser negativo");
		}
		if (!unidadMedida || unidadMedida.trim() === "") {
			throw new ValidationError("La unidad de medida no puede estar vacía");
		}
		if (!lote || lote.trim() === "") {
			throw new ValidationError("El lote del insumo no puede estar vacío");
		}
		if (!usuarioId || usuarioId <= 0) {
			throw new ValidationError("El usuarioId debe ser un ID válido");
		}
		if (!Number.isInteger(periodoRetiroDias) || periodoRetiroDias < 0) {
			throw new ValidationError(
				"El período de retiro debe ser un entero mayor o igual a 0",
			);
		}
		if (Number.isNaN(costoUnitario) || costoUnitario < 0) {
			throw new ValidationError("El costo unitario no puede ser negativo");
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
			usuarioId,
			periodoRetiroDias,
			costoUnitario,
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
		usuarioId: number,
		periodoRetiroDias = 0,
		costoUnitario = 0,
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
			usuarioId,
			periodoRetiroDias,
			costoUnitario,
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

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getPeriodoRetiroDias(): number {
		return this.periodoRetiroDias;
	}

	public getCostoUnitario(): number {
		return this.costoUnitario;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	/** Valida una adición de stock sin modificar el insumo. */
	public validarAdicion(cantidad: number): void {
		if (cantidad <= 0) {
			throw new InsumoCantidadInvalidaError(
				"La cantidad a adicionar debe ser mayor a cero",
			);
		}
	}

	/** Valida un descuento de stock contra el stock actual sin modificar el insumo. */
	public validarDescuento(cantidad: number): void {
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
	}

	public adicionarStock(cantidad: number): void {
		this.validarAdicion(cantidad);
		this.stock += cantidad;
	}

	public descontarStock(cantidad: number): void {
		this.validarDescuento(cantidad);
		this.stock -= cantidad;
	}

	public esBajoStock(): boolean {
		return this.stock <= this.stockMinimo;
	}

	public actualizarDatos(
		nombre: string,
		tipo: TipoInsumo,
		stockMinimo: number,
		unidadMedida: string,
		lote: string,
		fechaCaducidad: Date,
		periodoRetiroDias?: number,
		costoUnitario?: number,
	): void {
		if (!nombre || nombre.trim() === "") {
			throw new ValidationError("El nombre del insumo no puede estar vacío");
		}
		if (stockMinimo < 0) {
			throw new ValidationError("El stock mínimo no puede ser negativo");
		}
		if (!unidadMedida || unidadMedida.trim() === "") {
			throw new ValidationError("La unidad de medida no puede estar vacía");
		}
		if (!lote || lote.trim() === "") {
			throw new ValidationError("El lote del insumo no puede estar vacío");
		}
		if (
			periodoRetiroDias !== undefined &&
			(!Number.isInteger(periodoRetiroDias) || periodoRetiroDias < 0)
		) {
			throw new ValidationError(
				"El período de retiro debe ser un entero mayor o igual a 0",
			);
		}
		if (
			costoUnitario !== undefined &&
			(Number.isNaN(costoUnitario) || costoUnitario < 0)
		) {
			throw new ValidationError("El costo unitario no puede ser negativo");
		}
		this.nombre = nombre;
		this.tipo = tipo;
		this.stockMinimo = stockMinimo;
		this.unidadMedida = unidadMedida;
		this.lote = lote;
		this.fechaCaducidad = fechaCaducidad;
		if (periodoRetiroDias !== undefined) {
			this.periodoRetiroDias = periodoRetiroDias;
		}
		if (costoUnitario !== undefined) {
			this.costoUnitario = costoUnitario;
		}
	}
}

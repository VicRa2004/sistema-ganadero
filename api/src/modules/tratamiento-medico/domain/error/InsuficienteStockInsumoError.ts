import { BaseError } from "@/core/shared/domain/error/BaseError";

export class InsuficienteStockInsumoError extends BaseError {
	constructor(insumoId: number, stockActual: number, dosisRequeridas: number) {
		super(
			`Stock insuficiente para el insumo ID ${insumoId}. Stock disponible: ${stockActual}, Dosis requeridas: ${dosisRequeridas}`,
			400,
		);
	}
}

import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export class TransaccionGanado {
	private constructor(
		private readonly id: number,
		private readonly transaccionId: number,
		private readonly ganadoId: number,
		private readonly precio: number,
		private readonly pesoRegistro: number,
		private readonly procedencia: string | null,
		private readonly ganadoIdentificador: string = "",
	) {}

	public static create(params: {
		ganadoId: number;
		precio: number;
		pesoRegistro: number;
		procedencia?: string | null;
		ganadoIdentificador?: string;
	}): TransaccionGanado {
		if (!params.ganadoId || params.ganadoId <= 0) {
			throw new ValidationError("El ganadoId es obligatorio");
		}
		if (Number.isNaN(params.precio) || params.precio < 0) {
			throw new ValidationError("El precio no puede ser negativo");
		}
		if (Number.isNaN(params.pesoRegistro) || params.pesoRegistro <= 0) {
			throw new ValidationError("El peso de registro debe ser mayor a cero");
		}
		return new TransaccionGanado(
			0,
			0,
			params.ganadoId,
			params.precio,
			params.pesoRegistro,
			params.procedencia?.trim() ? params.procedencia.trim() : null,
			params.ganadoIdentificador ?? "",
		);
	}

	public static reconstitute(params: {
		id: number;
		transaccionId: number;
		ganadoId: number;
		precio: number;
		pesoRegistro: number;
		procedencia: string | null;
		ganadoIdentificador?: string;
	}): TransaccionGanado {
		return new TransaccionGanado(
			params.id,
			params.transaccionId,
			params.ganadoId,
			params.precio,
			params.pesoRegistro,
			params.procedencia,
			params.ganadoIdentificador ?? "",
		);
	}

	public getId(): number {
		return this.id;
	}
	public getTransaccionId(): number {
		return this.transaccionId;
	}
	public getGanadoId(): number {
		return this.ganadoId;
	}
	public getPrecio(): number {
		return this.precio;
	}
	public getPesoRegistro(): number {
		return this.pesoRegistro;
	}
	public getProcedencia(): string | null {
		return this.procedencia;
	}
	public getGanadoIdentificador(): string {
		return this.ganadoIdentificador;
	}
}

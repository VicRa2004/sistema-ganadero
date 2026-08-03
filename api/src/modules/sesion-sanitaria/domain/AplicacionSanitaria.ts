export class AplicacionSanitaria {
	private constructor(
		private readonly id: number | null,
		private readonly sesionId: number | null,
		private readonly ganadoId: number,
		private dosisAplicada: number,
		private observaciones: string | null,
	) {}

	public static create(
		ganadoId: number,
		dosisAplicada: number,
		observaciones?: string | null,
		id?: number | null,
		sesionId?: number | null,
	): AplicacionSanitaria {
		if (dosisAplicada <= 0) {
			throw new Error(
				"La dosis aplicada debe ser un número positivo mayor a 0",
			);
		}

		return new AplicacionSanitaria(
			id ?? null,
			sesionId ?? null,
			ganadoId,
			dosisAplicada,
			observaciones ?? null,
		);
	}

	public getId(): number | null {
		return this.id;
	}

	public getSesionId(): number | null {
		return this.sesionId;
	}

	public getGanadoId(): number {
		return this.ganadoId;
	}

	public getDosisAplicada(): number {
		return this.dosisAplicada;
	}

	public getObservaciones(): string | null {
		return this.observaciones;
	}

	public actualizarDosis(nuevaDosis: number): void {
		if (nuevaDosis <= 0) {
			throw new Error(
				"La dosis aplicada debe ser un número positivo mayor a 0",
			);
		}
		this.dosisAplicada = nuevaDosis;
	}

	public actualizarObservaciones(nuevasObservaciones?: string | null): void {
		this.observaciones = nuevasObservaciones ?? null;
	}
}

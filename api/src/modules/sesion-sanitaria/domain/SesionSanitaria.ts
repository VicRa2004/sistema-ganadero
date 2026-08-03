import type { AplicacionSanitaria } from "./AplicacionSanitaria";

export class SesionSanitaria {
	private constructor(
		private readonly id: number | null,
		private fecha: Date,
		private veterinarioId: number,
		private descripcion: string,
		private insumoId: number,
		private aplicaciones: AplicacionSanitaria[],
	) {}

	public static create(
		fecha: Date,
		veterinarioId: number,
		descripcion: string,
		insumoId: number,
		aplicaciones: AplicacionSanitaria[] = [],
		id?: number | null,
	): SesionSanitaria {
		if (!descripcion || descripcion.trim().length === 0) {
			throw new Error("La descripción de la sesión sanitaria es obligatoria");
		}
		if (veterinarioId <= 0) {
			throw new Error("El ID de veterinario debe ser un entero positivo");
		}
		if (insumoId <= 0) {
			throw new Error("El ID de insumo debe ser un entero positivo");
		}

		return new SesionSanitaria(
			id ?? null,
			fecha,
			veterinarioId,
			descripcion.trim(),
			insumoId,
			aplicaciones,
		);
	}

	public getId(): number | null {
		return this.id;
	}

	public getFecha(): Date {
		return this.fecha;
	}

	public getVeterinarioId(): number {
		return this.veterinarioId;
	}

	public getDescripcion(): string {
		return this.descripcion;
	}

	public getInsumoId(): number {
		return this.insumoId;
	}

	public getAplicaciones(): AplicacionSanitaria[] {
		return [...this.aplicaciones];
	}

	public calcularTotalDosisConsumida(): number {
		return this.aplicaciones.reduce(
			(total, app) => total + app.getDosisAplicada(),
			0,
		);
	}

	public agregarAplicacion(aplicacion: AplicacionSanitaria): void {
		const yaExiste = this.aplicaciones.some(
			(a) => a.getGanadoId() === aplicacion.getGanadoId(),
		);
		if (yaExiste) {
			throw new Error(
				`El animal con ID ${aplicacion.getGanadoId()} ya tiene una aplicación registrada en esta sesión`,
			);
		}
		this.aplicaciones.push(aplicacion);
	}

	public actualizarDatos(
		fecha: Date,
		veterinarioId: number,
		descripcion: string,
		insumoId: number,
	): void {
		if (!descripcion || descripcion.trim().length === 0) {
			throw new Error("La descripción de la sesión sanitaria es obligatoria");
		}
		this.fecha = fecha;
		this.veterinarioId = veterinarioId;
		this.descripcion = descripcion.trim();
		this.insumoId = insumoId;
	}
}

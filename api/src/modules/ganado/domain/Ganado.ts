import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export type SexoGanado = "MACHO" | "HEMBRA";

export class Ganado extends Entity {
	private identificador: string;
	private peso: number;
	private fechaNacimiento: Date;
	private sexo: SexoGanado;
	private imagenGanado: string | null;
	private razaId: number;
	private terrenoId: number;
	private propietarioId: number;
	private padreId: number | null;
	private madreId: number | null;
	private fechaBaja: Date | null;
	private motivoBajaId: number | null;

	private constructor(
		id: EntityId,
		identificador: string,
		peso: number,
		fechaNacimiento: Date,
		sexo: SexoGanado,
		imagenGanado: string | null,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
		padreId: number | null,
		madreId: number | null,
		fechaBaja: Date | null,
		motivoBajaId: number | null,
	) {
		super(id);
		this.identificador = identificador;
		this.peso = peso;
		this.fechaNacimiento = fechaNacimiento;
		this.sexo = sexo;
		this.imagenGanado = imagenGanado;
		this.razaId = razaId;
		this.terrenoId = terrenoId;
		this.propietarioId = propietarioId;
		this.padreId = padreId;
		this.madreId = madreId;
		this.fechaBaja = fechaBaja;
		this.motivoBajaId = motivoBajaId;
	}

	public static create(
		identificador: string,
		peso: number,
		fechaNacimiento: Date,
		sexo: SexoGanado,
		imagenGanado: string | null,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
		padreId: number | null,
		madreId: number | null,
	): Ganado {
		if (!identificador || identificador.trim() === "") {
			throw new Error("El identificador del ganado no puede estar vacío");
		}
		if (peso <= 0) {
			throw new Error("El peso inicial debe ser mayor que cero");
		}
		if (
			!(fechaNacimiento instanceof Date) ||
			Number.isNaN(fechaNacimiento.getTime())
		) {
			throw new Error("La fecha de nacimiento no es válida");
		}
		if (fechaNacimiento > new Date()) {
			throw new Error("La fecha de nacimiento no puede ser futura");
		}
		if (sexo !== "MACHO" && sexo !== "HEMBRA") {
			throw new Error("El sexo del ganado debe ser MACHO o HEMBRA");
		}
		if (razaId <= 0) {
			throw new Error("La raza especificada no es válida");
		}
		if (terrenoId <= 0) {
			throw new Error("El terreno especificado no es válido");
		}
		if (propietarioId <= 0) {
			throw new Error("El propietario especificado no es válido");
		}

		return new Ganado(
			new EntityId(),
			identificador,
			peso,
			fechaNacimiento,
			sexo,
			imagenGanado,
			razaId,
			terrenoId,
			propietarioId,
			padreId,
			madreId,
			null,
			null,
		);
	}

	public static reconstitute(
		id: number,
		identificador: string,
		peso: number,
		fechaNacimiento: Date,
		sexo: SexoGanado,
		imagenGanado: string | null,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
		padreId: number | null,
		madreId: number | null,
		fechaBaja: Date | null,
		motivoBajaId: number | null,
	): Ganado {
		return new Ganado(
			new EntityId(id),
			identificador,
			peso,
			fechaNacimiento,
			sexo,
			imagenGanado,
			razaId,
			terrenoId,
			propietarioId,
			padreId,
			madreId,
			fechaBaja,
			motivoBajaId,
		);
	}

	public getIdentificador(): string {
		return this.identificador;
	}

	public getPeso(): number {
		return this.peso;
	}

	public getFechaNacimiento(): Date {
		return this.fechaNacimiento;
	}

	public getSexo(): SexoGanado {
		return this.sexo;
	}

	public getImagenGanado(): string | null {
		return this.imagenGanado;
	}

	public getRazaId(): number {
		return this.razaId;
	}

	public getTerrenoId(): number {
		return this.terrenoId;
	}

	public getPropietarioId(): number {
		return this.propietarioId;
	}

	public getPadreId(): number | null {
		return this.padreId;
	}

	public getMadreId(): number | null {
		return this.madreId;
	}

	public getFechaBaja(): Date | null {
		return this.fechaBaja;
	}

	public getMotivoBajaId(): number | null {
		return this.motivoBajaId;
	}

	public estaActivo(): boolean {
		return this.fechaBaja === null;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public setImagenGanado(ruta: string | null): void {
		this.imagenGanado = ruta;
	}

	public registrarPesaje(nuevoPeso: number): void {
		if (nuevoPeso <= 0) {
			throw new Error("El peso registrado debe ser mayor que cero");
		}
		this.peso = nuevoPeso;
	}

	public cambiarDeTerreno(nuevoTerrenoId: number): void {
		if (nuevoTerrenoId <= 0) {
			throw new Error("El terreno destino no es válido");
		}
		this.terrenoId = nuevoTerrenoId;
	}

	public darDeBaja(fecha: Date, motivoBajaId: number): void {
		if (!this.estaActivo()) {
			throw new Error("El ganado ya se encuentra dado de baja");
		}
		if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
			throw new Error("La fecha de baja no es válida");
		}
		if (motivoBajaId <= 0) {
			throw new Error("El motivo de baja no es válido");
		}
		this.fechaBaja = fecha;
		this.motivoBajaId = motivoBajaId;
	}

	public actualizar(
		identificador: string,
		peso: number,
		fechaNacimiento: Date,
		sexo: SexoGanado,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
		padreId: number | null,
		madreId: number | null,
	): void {
		if (!identificador || identificador.trim() === "") {
			throw new Error("El identificador del ganado no puede estar vacío");
		}
		if (peso <= 0) {
			throw new Error("El peso debe ser mayor que cero");
		}
		if (
			!(fechaNacimiento instanceof Date) ||
			Number.isNaN(fechaNacimiento.getTime())
		) {
			throw new Error("La fecha de nacimiento no es válida");
		}
		if (fechaNacimiento > new Date()) {
			throw new Error("La fecha de nacimiento no puede ser futura");
		}
		if (sexo !== "MACHO" && sexo !== "HEMBRA") {
			throw new Error("El sexo del ganado debe ser MACHO o HEMBRA");
		}
		if (razaId <= 0) {
			throw new Error("La raza especificada no es válida");
		}
		if (terrenoId <= 0) {
			throw new Error("El terreno especificado no es válido");
		}
		if (propietarioId <= 0) {
			throw new Error("El propietario especificado no es válido");
		}

		this.identificador = identificador;
		this.peso = peso;
		this.fechaNacimiento = fechaNacimiento;
		this.sexo = sexo;
		this.razaId = razaId;
		this.terrenoId = terrenoId;
		this.propietarioId = propietarioId;
		this.padreId = padreId;
		this.madreId = madreId;
	}
}

import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export type SexoGanado = "MACHO" | "HEMBRA";

export class Ganado extends Entity {
	private identificador: string;
	private peso: number;
	private edadEnMeses: number;
	private sexo: SexoGanado;
	private razaId: number;
	private terrenoId: number;
	private propietarioId: number;

	private constructor(
		id: EntityId,
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
	) {
		super(id);
		this.identificador = identificador;
		this.peso = peso;
		this.edadEnMeses = edadEnMeses;
		this.sexo = sexo;
		this.razaId = razaId;
		this.terrenoId = terrenoId;
		this.propietarioId = propietarioId;
	}

	public static create(
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
	): Ganado {
		if (!identificador || identificador.trim() === "") {
			throw new Error("El identificador del ganado no puede estar vacío");
		}
		if (peso <= 0) {
			throw new Error("El peso inicial debe ser mayor que cero");
		}
		if (edadEnMeses < 0) {
			throw new Error("La edad en meses no puede ser negativa");
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
			edadEnMeses,
			sexo,
			razaId,
			terrenoId,
			propietarioId,
		);
	}

	public static reconstitute(
		id: number,
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
	): Ganado {
		return new Ganado(
			new EntityId(id),
			identificador,
			peso,
			edadEnMeses,
			sexo,
			razaId,
			terrenoId,
			propietarioId,
		);
	}

	public getIdentificador(): string {
		return this.identificador;
	}

	public getPeso(): number {
		return this.peso;
	}

	public getEdadEnMeses(): number {
		return this.edadEnMeses;
	}

	public getSexo(): SexoGanado {
		return this.sexo;
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

	public esNuevo(): boolean {
		return this.id.isNew();
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

	public actualizar(
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		terrenoId: number,
		propietarioId: number,
	): void {
		if (!identificador || identificador.trim() === "") {
			throw new Error("El identificador del ganado no puede estar vacío");
		}
		if (peso <= 0) {
			throw new Error("El peso debe ser mayor que cero");
		}
		if (edadEnMeses < 0) {
			throw new Error("La edad en meses no puede ser negativa");
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
		this.edadEnMeses = edadEnMeses;
		this.sexo = sexo;
		this.razaId = razaId;
		this.terrenoId = terrenoId;
		this.propietarioId = propietarioId;
	}
}

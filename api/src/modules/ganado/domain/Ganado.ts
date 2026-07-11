import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export type SexoGanado = "MACHO" | "HEMBRA";

export class Ganado extends Entity {
	private identificador: string;
	private peso: number;
	private edadEnMeses: number;
	private sexo: SexoGanado;
	private razaId: number;
	private ranchoId: number;
	private propietarioId: number;

	private constructor(
		id: EntityId,
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		ranchoId: number,
		propietarioId: number,
	) {
		super(id);
		this.identificador = identificador;
		this.peso = peso;
		this.edadEnMeses = edadEnMeses;
		this.sexo = sexo;
		this.razaId = razaId;
		this.ranchoId = ranchoId;
		this.propietarioId = propietarioId;
	}

	public static create(
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		ranchoId: number,
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
		if (ranchoId <= 0) {
			throw new Error("El rancho especificado no es válido");
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
			ranchoId,
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
		ranchoId: number,
		propietarioId: number,
	): Ganado {
		return new Ganado(
			new EntityId(id),
			identificador,
			peso,
			edadEnMeses,
			sexo,
			razaId,
			ranchoId,
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

	public getRanchoId(): number {
		return this.ranchoId;
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

	public cambiarDeRancho(nuevoRanchoId: number): void {
		if (nuevoRanchoId <= 0) {
			throw new Error("El rancho destino no es válido");
		}
		this.ranchoId = nuevoRanchoId;
	}

	public actualizar(
		identificador: string,
		peso: number,
		edadEnMeses: number,
		sexo: SexoGanado,
		razaId: number,
		ranchoId: number,
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
		if (ranchoId <= 0) {
			throw new Error("El rancho especificado no es válido");
		}
		if (propietarioId <= 0) {
			throw new Error("El propietario especificado no es válido");
		}

		this.identificador = identificador;
		this.peso = peso;
		this.edadEnMeses = edadEnMeses;
		this.sexo = sexo;
		this.razaId = razaId;
		this.ranchoId = ranchoId;
		this.propietarioId = propietarioId;
	}
}

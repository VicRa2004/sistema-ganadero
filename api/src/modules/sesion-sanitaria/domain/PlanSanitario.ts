import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export interface PlanSanitarioRelaciones {
	nombreVeterinario?: string;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	nombreTerreno?: string | null;
	nombreRaza?: string | null;
}

export class PlanSanitario extends Entity {
	private nombre: string;
	private descripcion: string;
	private frecuenciaDias: number;
	private dosisPorAnimal: number;
	private veterinarioId: number;
	private insumoId: number;
	private terrenoId: number | null;
	private razaId: number | null;
	private edadMinimaMeses: number | null;
	private proximaEjecucion: Date;
	private activo: boolean;
	private readonly usuarioId: number;
	private readonly relaciones?: PlanSanitarioRelaciones;

	private constructor(
		id: EntityId,
		nombre: string,
		descripcion: string,
		frecuenciaDias: number,
		dosisPorAnimal: number,
		veterinarioId: number,
		insumoId: number,
		terrenoId: number | null,
		razaId: number | null,
		edadMinimaMeses: number | null,
		proximaEjecucion: Date,
		activo: boolean,
		usuarioId: number,
		relaciones?: PlanSanitarioRelaciones,
	) {
		super(id);
		this.nombre = nombre;
		this.descripcion = descripcion;
		this.frecuenciaDias = frecuenciaDias;
		this.dosisPorAnimal = dosisPorAnimal;
		this.veterinarioId = veterinarioId;
		this.insumoId = insumoId;
		this.terrenoId = terrenoId;
		this.razaId = razaId;
		this.edadMinimaMeses = edadMinimaMeses;
		this.proximaEjecucion = proximaEjecucion;
		this.activo = activo;
		this.usuarioId = usuarioId;
		this.relaciones = relaciones;
	}

	private static validar(
		nombre: string,
		descripcion: string,
		frecuenciaDias: number,
		dosisPorAnimal: number,
		veterinarioId: number,
		insumoId: number,
		proximaEjecucion: Date,
		edadMinimaMeses: number | null,
	): void {
		if (!nombre || nombre.trim().length < 3) {
			throw new ValidationError(
				"El nombre del plan sanitario debe tener al menos 3 caracteres",
			);
		}
		if (!descripcion || descripcion.trim().length < 3) {
			throw new ValidationError("La descripción del plan es obligatoria");
		}
		if (!Number.isInteger(frecuenciaDias) || frecuenciaDias < 1) {
			throw new ValidationError(
				"La frecuencia en días debe ser mayor o igual a 1",
			);
		}
		if (dosisPorAnimal <= 0) {
			throw new ValidationError("La dosis por animal debe ser mayor a cero");
		}
		if (!veterinarioId || veterinarioId <= 0) {
			throw new ValidationError("El veterinario es obligatorio");
		}
		if (!insumoId || insumoId <= 0) {
			throw new ValidationError("El insumo es obligatorio");
		}
		if (
			!(proximaEjecucion instanceof Date) ||
			Number.isNaN(proximaEjecucion.getTime())
		) {
			throw new ValidationError("La fecha de próxima ejecución no es válida");
		}
		if (
			edadMinimaMeses !== null &&
			(!Number.isInteger(edadMinimaMeses) || edadMinimaMeses < 0)
		) {
			throw new ValidationError(
				"La edad mínima en meses debe ser un entero mayor o igual a 0",
			);
		}
	}

	public static create(
		nombre: string,
		descripcion: string,
		frecuenciaDias: number,
		dosisPorAnimal: number,
		veterinarioId: number,
		insumoId: number,
		proximaEjecucion: Date,
		usuarioId: number,
		opciones?: {
			terrenoId?: number | null;
			razaId?: number | null;
			edadMinimaMeses?: number | null;
			activo?: boolean;
		},
	): PlanSanitario {
		const edadMin = opciones?.edadMinimaMeses ?? null;
		PlanSanitario.validar(
			nombre,
			descripcion,
			frecuenciaDias,
			dosisPorAnimal,
			veterinarioId,
			insumoId,
			proximaEjecucion,
			edadMin,
		);
		if (!usuarioId || usuarioId <= 0) {
			throw new ValidationError("El usuarioId es obligatorio");
		}

		return new PlanSanitario(
			new EntityId(),
			nombre.trim(),
			descripcion.trim(),
			frecuenciaDias,
			dosisPorAnimal,
			veterinarioId,
			insumoId,
			opciones?.terrenoId ?? null,
			opciones?.razaId ?? null,
			edadMin,
			proximaEjecucion,
			opciones?.activo ?? true,
			usuarioId,
		);
	}

	public static reconstitute(
		id: number,
		nombre: string,
		descripcion: string,
		frecuenciaDias: number,
		dosisPorAnimal: number,
		veterinarioId: number,
		insumoId: number,
		terrenoId: number | null,
		razaId: number | null,
		edadMinimaMeses: number | null,
		proximaEjecucion: Date,
		activo: boolean,
		usuarioId: number,
		relaciones?: PlanSanitarioRelaciones,
	): PlanSanitario {
		return new PlanSanitario(
			new EntityId(id),
			nombre,
			descripcion,
			frecuenciaDias,
			dosisPorAnimal,
			veterinarioId,
			insumoId,
			terrenoId,
			razaId,
			edadMinimaMeses,
			proximaEjecucion,
			activo,
			usuarioId,
			relaciones,
		);
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getDescripcion(): string {
		return this.descripcion;
	}

	public getFrecuenciaDias(): number {
		return this.frecuenciaDias;
	}

	public getDosisPorAnimal(): number {
		return this.dosisPorAnimal;
	}

	public getVeterinarioId(): number {
		return this.veterinarioId;
	}

	public getInsumoId(): number {
		return this.insumoId;
	}

	public getTerrenoId(): number | null {
		return this.terrenoId;
	}

	public getRazaId(): number | null {
		return this.razaId;
	}

	public getEdadMinimaMeses(): number | null {
		return this.edadMinimaMeses;
	}

	public getProximaEjecucion(): Date {
		return this.proximaEjecucion;
	}

	public estaActivo(): boolean {
		return this.activo;
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getRelaciones(): PlanSanitarioRelaciones | undefined {
		return this.relaciones;
	}

	public avanzarProximaEjecucion(): void {
		const siguiente = new Date(this.proximaEjecucion);
		siguiente.setDate(siguiente.getDate() + this.frecuenciaDias);
		this.proximaEjecucion = siguiente;
	}

	public actualizar(datos: {
		nombre?: string;
		descripcion?: string;
		frecuenciaDias?: number;
		dosisPorAnimal?: number;
		veterinarioId?: number;
		insumoId?: number;
		terrenoId?: number | null;
		razaId?: number | null;
		edadMinimaMeses?: number | null;
		proximaEjecucion?: Date;
		activo?: boolean;
	}): void {
		const nombre = datos.nombre ?? this.nombre;
		const descripcion = datos.descripcion ?? this.descripcion;
		const frecuenciaDias = datos.frecuenciaDias ?? this.frecuenciaDias;
		const dosisPorAnimal = datos.dosisPorAnimal ?? this.dosisPorAnimal;
		const veterinarioId = datos.veterinarioId ?? this.veterinarioId;
		const insumoId = datos.insumoId ?? this.insumoId;
		const proximaEjecucion = datos.proximaEjecucion ?? this.proximaEjecucion;
		const edadMinimaMeses =
			datos.edadMinimaMeses !== undefined
				? datos.edadMinimaMeses
				: this.edadMinimaMeses;

		PlanSanitario.validar(
			nombre,
			descripcion,
			frecuenciaDias,
			dosisPorAnimal,
			veterinarioId,
			insumoId,
			proximaEjecucion,
			edadMinimaMeses,
		);

		this.nombre = nombre.trim();
		this.descripcion = descripcion.trim();
		this.frecuenciaDias = frecuenciaDias;
		this.dosisPorAnimal = dosisPorAnimal;
		this.veterinarioId = veterinarioId;
		this.insumoId = insumoId;
		this.proximaEjecucion = proximaEjecucion;
		this.edadMinimaMeses = edadMinimaMeses;
		if (datos.terrenoId !== undefined) this.terrenoId = datos.terrenoId;
		if (datos.razaId !== undefined) this.razaId = datos.razaId;
		if (datos.activo !== undefined) this.activo = datos.activo;
	}
}

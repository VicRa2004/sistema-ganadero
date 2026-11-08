import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export interface TratamientoMedicoRelaciones {
	ganadoIdentificador?: string;
	insumoNombre?: string;
	insumoUnidad?: string;
	veterinarioNombre?: string;
	createdAt?: Date;
	updatedAt?: Date | null;
}

export class TratamientoMedico extends Entity {
	private ganadoId: number;
	private diagnostico: string;
	private fechaInicio: Date;
	private fechaFin: Date;
	private activo: boolean;
	private insumoId: number;
	private dosisDiaria: number;
	private veterinarioId: number | null;
	private relaciones?: TratamientoMedicoRelaciones;

	private constructor(
		id: EntityId,
		ganadoId: number,
		diagnostico: string,
		fechaInicio: Date,
		fechaFin: Date,
		activo: boolean,
		insumoId: number,
		dosisDiaria: number,
		veterinarioId: number | null,
		relaciones?: TratamientoMedicoRelaciones,
	) {
		super(id);
		this.ganadoId = ganadoId;
		this.diagnostico = diagnostico;
		this.fechaInicio = fechaInicio;
		this.fechaFin = fechaFin;
		this.activo = activo;
		this.insumoId = insumoId;
		this.dosisDiaria = dosisDiaria;
		this.veterinarioId = veterinarioId;
		this.relaciones = relaciones;
	}

	private static validarCampos(
		ganadoId: number,
		diagnostico: string,
		fechaInicio: Date,
		fechaFin: Date,
		insumoId: number,
		dosisDiaria: number,
		veterinarioId: number | null,
	): void {
		if (!ganadoId || ganadoId <= 0) {
			throw new ValidationError("El ID del ganado debe ser un entero positivo");
		}
		if (!diagnostico || diagnostico.trim().length === 0) {
			throw new ValidationError(
				"El diagnóstico del tratamiento médico es obligatorio",
			);
		}
		if (
			!(fechaInicio instanceof Date) ||
			Number.isNaN(fechaInicio.getTime()) ||
			!(fechaFin instanceof Date) ||
			Number.isNaN(fechaFin.getTime())
		) {
			throw new ValidationError("Las fechas del tratamiento no son válidas");
		}
		if (fechaFin < fechaInicio) {
			throw new ValidationError(
				"La fecha de fin no puede ser anterior a la fecha de inicio",
			);
		}
		if (!insumoId || insumoId <= 0) {
			throw new ValidationError("El ID del insumo debe ser un entero positivo");
		}
		if (dosisDiaria <= 0) {
			throw new ValidationError("La dosis diaria debe ser mayor a cero");
		}
		if (veterinarioId !== null && veterinarioId <= 0) {
			throw new ValidationError(
				"El ID del veterinario debe ser un entero positivo",
			);
		}
	}

	public static create(
		ganadoId: number,
		diagnostico: string,
		fechaInicio: Date,
		fechaFin: Date,
		insumoId: number,
		dosisDiaria: number,
		veterinarioId: number | null = null,
		activo = true,
	): TratamientoMedico {
		TratamientoMedico.validarCampos(
			ganadoId,
			diagnostico,
			fechaInicio,
			fechaFin,
			insumoId,
			dosisDiaria,
			veterinarioId,
		);

		return new TratamientoMedico(
			new EntityId(),
			ganadoId,
			diagnostico.trim(),
			fechaInicio,
			fechaFin,
			activo,
			insumoId,
			dosisDiaria,
			veterinarioId,
		);
	}

	public static reconstitute(
		id: number,
		ganadoId: number,
		diagnostico: string,
		fechaInicio: Date,
		fechaFin: Date,
		activo: boolean,
		insumoId: number,
		dosisDiaria: number,
		veterinarioId: number | null = null,
		relaciones?: TratamientoMedicoRelaciones,
	): TratamientoMedico {
		return new TratamientoMedico(
			new EntityId(id),
			ganadoId,
			diagnostico,
			fechaInicio,
			fechaFin,
			activo,
			insumoId,
			dosisDiaria,
			veterinarioId,
			relaciones,
		);
	}

	public getGanadoId(): number {
		return this.ganadoId;
	}

	public getDiagnostico(): string {
		return this.diagnostico;
	}

	public getFechaInicio(): Date {
		return this.fechaInicio;
	}

	public getFechaFin(): Date {
		return this.fechaFin;
	}

	public esActivo(): boolean {
		return this.activo;
	}

	public getInsumoId(): number {
		return this.insumoId;
	}

	public getDosisDiaria(): number {
		return this.dosisDiaria;
	}

	public getVeterinarioId(): number | null {
		return this.veterinarioId;
	}

	public getRelaciones(): TratamientoMedicoRelaciones | undefined {
		return this.relaciones;
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public finalizarTratamiento(): void {
		if (!this.activo) {
			throw new ValidationError(
				"El tratamiento médico ya se encuentra finalizado",
			);
		}
		this.activo = false;
	}

	public actualizar(
		diagnostico: string,
		fechaInicio: Date,
		fechaFin: Date,
		insumoId: number,
		dosisDiaria: number,
		veterinarioId: number | null,
		activo?: boolean,
	): void {
		TratamientoMedico.validarCampos(
			this.ganadoId,
			diagnostico,
			fechaInicio,
			fechaFin,
			insumoId,
			dosisDiaria,
			veterinarioId,
		);
		this.diagnostico = diagnostico.trim();
		this.fechaInicio = fechaInicio;
		this.fechaFin = fechaFin;
		this.insumoId = insumoId;
		this.dosisDiaria = dosisDiaria;
		this.veterinarioId = veterinarioId;
		if (activo !== undefined) {
			this.activo = activo;
		}
	}
}

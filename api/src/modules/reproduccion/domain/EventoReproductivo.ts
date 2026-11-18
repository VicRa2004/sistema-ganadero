import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

export type TipoEventoReproductivo =
	| "MONTA"
	| "INSEMINACION"
	| "DIAGNOSTICO_GESTACION"
	| "PARTO"
	| "DESTETE"
	| "ABORTO";

export type ResultadoDiagnostico = "POSITIVO" | "NEGATIVO";

export interface EventoReproductivoRelaciones {
	hembraIdentificador?: string;
	machoIdentificador?: string | null;
	crias?: { id: number; identificador: string; sexo: "MACHO" | "HEMBRA" }[];
}

export class EventoReproductivo extends Entity {
	private constructor(
		id: EntityId,
		private readonly hembraId: number,
		private readonly machoId: number | null,
		private readonly tipo: TipoEventoReproductivo,
		private readonly fecha: Date,
		private readonly resultado: ResultadoDiagnostico | null,
		private readonly fechaProbableParto: Date | null,
		private readonly observaciones: string | null,
		private readonly relaciones?: EventoReproductivoRelaciones,
	) {
		super(id);
	}

	public static create(params: {
		hembraId: number;
		machoId: number | null;
		tipo: TipoEventoReproductivo;
		fecha: Date;
		resultado: ResultadoDiagnostico | null;
		fechaProbableParto: Date | null;
		observaciones: string | null;
	}): EventoReproductivo {
		if (params.hembraId <= 0) {
			throw new ValidationError("La hembra especificada no es válida");
		}
		if (params.machoId !== null && params.machoId <= 0) {
			throw new ValidationError("El macho especificado no es válido");
		}
		if (params.machoId !== null && params.machoId === params.hembraId) {
			throw new ValidationError(
				"La hembra y el macho del evento no pueden ser el mismo animal",
			);
		}
		if (
			!(params.fecha instanceof Date) ||
			Number.isNaN(params.fecha.getTime())
		) {
			throw new ValidationError("La fecha del evento no es válida");
		}
		if (params.fecha > new Date()) {
			throw new ValidationError("La fecha del evento no puede ser futura");
		}
		if (
			params.tipo === "DIAGNOSTICO_GESTACION" &&
			params.resultado !== "POSITIVO" &&
			params.resultado !== "NEGATIVO"
		) {
			throw new ValidationError(
				"El diagnóstico de gestación requiere un resultado POSITIVO o NEGATIVO",
			);
		}
		if (params.tipo !== "DIAGNOSTICO_GESTACION" && params.resultado !== null) {
			throw new ValidationError(
				"El resultado solo aplica a eventos de diagnóstico de gestación",
			);
		}

		const obs =
			params.observaciones && params.observaciones.trim() !== ""
				? params.observaciones.trim()
				: null;

		return new EventoReproductivo(
			new EntityId(),
			params.hembraId,
			params.machoId,
			params.tipo,
			params.fecha,
			params.resultado,
			params.fechaProbableParto,
			obs,
		);
	}

	public static reconstitute(params: {
		id: number;
		hembraId: number;
		machoId: number | null;
		tipo: TipoEventoReproductivo;
		fecha: Date;
		resultado: ResultadoDiagnostico | null;
		fechaProbableParto: Date | null;
		observaciones: string | null;
		relaciones?: EventoReproductivoRelaciones;
	}): EventoReproductivo {
		return new EventoReproductivo(
			new EntityId(params.id),
			params.hembraId,
			params.machoId,
			params.tipo,
			params.fecha,
			params.resultado,
			params.fechaProbableParto,
			params.observaciones,
			params.relaciones,
		);
	}

	public esNuevo(): boolean {
		return this.id.isNew();
	}

	public getHembraId(): number {
		return this.hembraId;
	}

	public getMachoId(): number | null {
		return this.machoId;
	}

	public getTipo(): TipoEventoReproductivo {
		return this.tipo;
	}

	public getFecha(): Date {
		return this.fecha;
	}

	public getResultado(): ResultadoDiagnostico | null {
		return this.resultado;
	}

	public getFechaProbableParto(): Date | null {
		return this.fechaProbableParto;
	}

	public getObservaciones(): string | null {
		return this.observaciones;
	}

	public getRelaciones(): EventoReproductivoRelaciones | undefined {
		return this.relaciones;
	}
}

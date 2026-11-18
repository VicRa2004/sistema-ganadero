import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TipoNotificacion } from "./TipoNotificacion";

export class Notificacion extends Entity {
	private readonly usuarioId: number;
	private readonly tipo: TipoNotificacion;
	private readonly titulo: string;
	private readonly cuerpo: string;
	private readonly referenciaTipo: string | null;
	private readonly referenciaId: number | null;
	private readonly claveDeduplicacion: string;
	private leidaAt: Date | null;
	private readonly createdAt: Date;

	private constructor(
		id: EntityId,
		usuarioId: number,
		tipo: TipoNotificacion,
		titulo: string,
		cuerpo: string,
		referenciaTipo: string | null,
		referenciaId: number | null,
		claveDeduplicacion: string,
		leidaAt: Date | null,
		createdAt: Date,
	) {
		super(id);
		this.usuarioId = usuarioId;
		this.tipo = tipo;
		this.titulo = titulo;
		this.cuerpo = cuerpo;
		this.referenciaTipo = referenciaTipo;
		this.referenciaId = referenciaId;
		this.claveDeduplicacion = claveDeduplicacion;
		this.leidaAt = leidaAt;
		this.createdAt = createdAt;
	}

	public static create(
		usuarioId: number,
		tipo: TipoNotificacion,
		titulo: string,
		cuerpo: string,
		claveDeduplicacion: string,
		referenciaTipo: string | null = null,
		referenciaId: number | null = null,
	): Notificacion {
		if (!usuarioId || usuarioId <= 0) {
			throw new ValidationError("El usuarioId debe ser válido");
		}
		if (!titulo || titulo.trim() === "") {
			throw new ValidationError("El título de la notificación es obligatorio");
		}
		if (!cuerpo || cuerpo.trim() === "") {
			throw new ValidationError("El cuerpo de la notificación es obligatorio");
		}
		if (!claveDeduplicacion || claveDeduplicacion.trim() === "") {
			throw new ValidationError("La clave de deduplicación es obligatoria");
		}

		return new Notificacion(
			new EntityId(),
			usuarioId,
			tipo,
			titulo.trim(),
			cuerpo.trim(),
			referenciaTipo,
			referenciaId,
			claveDeduplicacion.trim(),
			null,
			new Date(),
		);
	}

	public static reconstitute(
		id: number,
		usuarioId: number,
		tipo: TipoNotificacion,
		titulo: string,
		cuerpo: string,
		referenciaTipo: string | null,
		referenciaId: number | null,
		claveDeduplicacion: string,
		leidaAt: Date | null,
		createdAt: Date,
	): Notificacion {
		return new Notificacion(
			new EntityId(id),
			usuarioId,
			tipo,
			titulo,
			cuerpo,
			referenciaTipo,
			referenciaId,
			claveDeduplicacion,
			leidaAt,
			createdAt,
		);
	}

	public getUsuarioId(): number {
		return this.usuarioId;
	}

	public getTipo(): TipoNotificacion {
		return this.tipo;
	}

	public getTitulo(): string {
		return this.titulo;
	}

	public getCuerpo(): string {
		return this.cuerpo;
	}

	public getReferenciaTipo(): string | null {
		return this.referenciaTipo;
	}

	public getReferenciaId(): number | null {
		return this.referenciaId;
	}

	public getClaveDeduplicacion(): string {
		return this.claveDeduplicacion;
	}

	public getLeidaAt(): Date | null {
		return this.leidaAt;
	}

	public getCreatedAt(): Date {
		return this.createdAt;
	}

	public estaLeida(): boolean {
		return this.leidaAt !== null;
	}

	public marcarComoLeida(): void {
		if (!this.leidaAt) {
			this.leidaAt = new Date();
		}
	}
}

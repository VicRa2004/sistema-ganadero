import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import { Notificacion } from "../../domain/Notificacion";
import type { NotificacionFilters } from "../../domain/repository/NotificacionFilters";
import type {
	NotificacionRepository,
	PreferenciaNotificacionItem,
} from "../../domain/repository/NotificacionRepository";
import type { TipoNotificacion } from "../../domain/TipoNotificacion";

interface PrismaNotificacionRecord {
	id: number;
	usuarioId: number;
	tipo: TipoNotificacion;
	titulo: string;
	cuerpo: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
	claveDeduplicacion: string;
	leidaAt: Date | null;
	createdAt: Date;
}

@injectable()
export class PrismaNotificacionRepository implements NotificacionRepository {
	private toDomain(record: PrismaNotificacionRecord): Notificacion {
		return Notificacion.reconstitute(
			record.id,
			record.usuarioId,
			record.tipo,
			record.titulo,
			record.cuerpo,
			record.referenciaTipo,
			record.referenciaId,
			record.claveDeduplicacion,
			record.leidaAt,
			record.createdAt,
		);
	}

	public async findByUsuario(
		filters: NotificacionFilters,
	): Promise<Pagination<Notificacion>> {
		const skip = (filters.page - 1) * filters.limit;
		const where: Prisma.NotificacionWhereInput = {
			usuarioId: filters.usuarioId,
		};
		if (filters.soloNoLeidas) {
			where.leidaAt = null;
		}
		if (filters.tipo) {
			where.tipo = filters.tipo;
		}

		const [records, totalItems] = await Promise.all([
			db().notificacion.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			}),
			db().notificacion.count({ where }),
		]);

		return {
			data: records.map((r) =>
				this.toDomain(r as unknown as PrismaNotificacionRecord),
			),
			page: filters.page,
			totalItems,
			totalPages: Math.ceil(totalItems / filters.limit),
		};
	}

	public async countNoLeidas(usuarioId: number): Promise<number> {
		return db().notificacion.count({
			where: { usuarioId, leidaAt: null },
		});
	}

	public async saveIfNotExists(
		notificacion: Notificacion,
	): Promise<Notificacion | null> {
		const { count } = await db().notificacion.createMany({
			data: [
				{
					usuarioId: notificacion.getUsuarioId(),
					tipo: notificacion.getTipo(),
					titulo: notificacion.getTitulo(),
					cuerpo: notificacion.getCuerpo(),
					referenciaTipo: notificacion.getReferenciaTipo(),
					referenciaId: notificacion.getReferenciaId(),
					claveDeduplicacion: notificacion.getClaveDeduplicacion(),
				},
			],
			skipDuplicates: true,
		});

		if (count === 0) return null;

		const created = await db().notificacion.findFirst({
			where: {
				usuarioId: notificacion.getUsuarioId(),
				claveDeduplicacion: notificacion.getClaveDeduplicacion(),
			},
		});
		if (!created) return null;
		return this.toDomain(created as unknown as PrismaNotificacionRecord);
	}

	public async marcarLeida(
		id: number,
		usuarioId: number,
	): Promise<Notificacion | null> {
		const existing = await db().notificacion.findFirst({
			where: { id, usuarioId },
		});
		if (!existing) return null;

		const updated = existing.leidaAt
			? existing
			: await db().notificacion.update({
					where: { id },
					data: { leidaAt: new Date() },
				});
		return this.toDomain(updated as unknown as PrismaNotificacionRecord);
	}

	public async marcarTodasLeidas(usuarioId: number): Promise<number> {
		const result = await db().notificacion.updateMany({
			where: { usuarioId, leidaAt: null },
			data: { leidaAt: new Date() },
		});
		return result.count;
	}

	public async getPreferencias(
		usuarioId: number,
	): Promise<PreferenciaNotificacionItem[]> {
		const records = await db().preferenciaNotificacion.findMany({
			where: { usuarioId },
		});
		return records.map((r) => ({
			tipo: r.tipo as TipoNotificacion,
			inApp: r.inApp,
			email: r.email,
		}));
	}

	public async upsertPreferencia(
		usuarioId: number,
		tipo: TipoNotificacion,
		inApp: boolean,
		email: boolean,
	): Promise<PreferenciaNotificacionItem> {
		const saved = await db().preferenciaNotificacion.upsert({
			where: { usuarioId_tipo: { usuarioId, tipo } },
			update: { inApp, email },
			create: { usuarioId, tipo, inApp, email },
		});
		return {
			tipo: saved.tipo as TipoNotificacion,
			inApp: saved.inApp,
			email: saved.email,
		};
	}
}

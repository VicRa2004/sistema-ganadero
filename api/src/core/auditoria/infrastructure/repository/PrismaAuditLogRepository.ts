import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type {
	AuditLogFilters,
	AuditLogRegistro,
	AuditLogRepository,
	NuevoAuditLog,
} from "../../domain/repository/AuditLogRepository";

@injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
	async registrar(entrada: NuevoAuditLog): Promise<void> {
		await prisma.auditLog.create({ data: entrada });
	}

	async listar(
		filters: AuditLogFilters,
	): Promise<Pagination<AuditLogRegistro>> {
		const { page, limit, usuarioId, metodo, ruta, desde, hasta } = filters;
		const where = {
			...(usuarioId && { usuarioId }),
			...(metodo && { metodo }),
			...(ruta && { ruta: { contains: ruta } }),
			...((desde || hasta) && { fecha: { gte: desde, lte: hasta } }),
		};

		const [rows, totalItems] = await prisma.$transaction([
			prisma.auditLog.findMany({
				where,
				orderBy: [{ fecha: "desc" }, { id: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
				include: {
					usuario: { select: { id: true, name: true, email: true } },
				},
			}),
			prisma.auditLog.count({ where }),
		]);

		return {
			data: rows.map(({ usuario, usuarioId: _u, ...r }) => ({
				...r,
				usuario: usuario
					? { id: usuario.id, nombre: usuario.name, email: usuario.email }
					: null,
			})),
			page,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		};
	}
}

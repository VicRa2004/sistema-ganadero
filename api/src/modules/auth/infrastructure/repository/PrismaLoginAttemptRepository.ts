import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { LoginAttemptRepository } from "../../domain/repository/LoginAttemptRepository";

@injectable()
export class PrismaLoginAttemptRepository implements LoginAttemptRepository {
	async obtenerBloqueo(userId: number): Promise<Date | null> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { bloqueadoHasta: true },
		});
		const hasta = user?.bloqueadoHasta ?? null;
		return hasta && hasta > new Date() ? hasta : null;
	}

	async registrarFallo(
		userId: number,
		maxIntentos: number,
		minutosBloqueo: number,
	): Promise<void> {
		// El increment es atómico; fallos concurrentes no se pierden
		const { intentosFallidos } = await prisma.user.update({
			where: { id: userId },
			data: { intentosFallidos: { increment: 1 } },
			select: { intentosFallidos: true },
		});
		if (intentosFallidos < maxIntentos) return;

		await prisma.user.update({
			where: { id: userId },
			data: {
				intentosFallidos: 0,
				bloqueadoHasta: new Date(Date.now() + minutosBloqueo * 60_000),
			},
		});
	}

	async reiniciar(userId: number): Promise<void> {
		await prisma.user.updateMany({
			where: {
				id: userId,
				OR: [
					{ intentosFallidos: { gt: 0 } },
					{ bloqueadoHasta: { not: null } },
				],
			},
			data: { intentosFallidos: 0, bloqueadoHasta: null },
		});
	}
}

import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

@injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
	async create(data: {
		tokenHash: string;
		userId: number;
		expiresAt: Date;
	}): Promise<void> {
		await prisma.refreshToken.create({
			data: {
				tokenHash: data.tokenHash,
				userId: data.userId,
				expiresAt: data.expiresAt,
			},
		});
	}

	async findValidByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; expiresAt: Date } | null> {
		const record = await prisma.refreshToken.findUnique({
			where: {
				tokenHash,
				revoked: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!record) return null;

		return {
			id: record.id,
			userId: record.userId,
			expiresAt: record.expiresAt,
		};
	}

	async findByHash(tokenHash: string): Promise<{
		id: number;
		userId: number;
		expiresAt: Date;
		revoked: boolean;
	} | null> {
		const record = await prisma.refreshToken.findUnique({
			where: { tokenHash },
		});

		if (!record) return null;

		return {
			id: record.id,
			userId: record.userId,
			expiresAt: record.expiresAt,
			revoked: record.revoked,
		};
	}

	async rotate(
		currentId: number,
		next: { tokenHash: string; userId: number; expiresAt: Date },
	): Promise<boolean> {
		return prisma.$transaction(async (tx) => {
			// El updateMany condicionado garantiza que solo una petición concurrente gane
			const { count } = await tx.refreshToken.updateMany({
				where: { id: currentId, revoked: false },
				data: { revoked: true },
			});

			if (count !== 1) return false;

			await tx.refreshToken.create({
				data: {
					tokenHash: next.tokenHash,
					userId: next.userId,
					expiresAt: next.expiresAt,
				},
			});
			return true;
		});
	}

	async revokeById(id: number): Promise<void> {
		await prisma.refreshToken.update({
			where: { id },
			data: { revoked: true },
		});
	}

	async revokeAllByUserId(userId: number): Promise<void> {
		await prisma.refreshToken.updateMany({
			where: { userId, revoked: false },
			data: { revoked: true },
		});
	}

	async deleteExpired(): Promise<void> {
		await prisma.refreshToken.deleteMany({
			where: { expiresAt: { lt: new Date() } },
		});
	}
}

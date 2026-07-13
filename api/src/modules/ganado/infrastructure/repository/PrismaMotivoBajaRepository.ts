import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { MotivoBaja } from "../../domain/MotivoBaja";
import type { MotivoBajaRepository } from "../../domain/repository/MotivoBajaRepository";

@injectable()
export class PrismaMotivoBajaRepository implements MotivoBajaRepository {
	public async findAll(): Promise<MotivoBaja[]> {
		const records = await prisma.motivoBaja.findMany({
			orderBy: { nombre: "asc" },
		});
		return records.map((r) =>
			MotivoBaja.reconstitute(r.id, r.nombre, r.descripcion),
		);
	}

	public async findById(id: number): Promise<MotivoBaja | null> {
		const record = await prisma.motivoBaja.findFirst({ where: { id } });
		if (!record) return null;
		return MotivoBaja.reconstitute(
			record.id,
			record.nombre,
			record.descripcion,
		);
	}
}

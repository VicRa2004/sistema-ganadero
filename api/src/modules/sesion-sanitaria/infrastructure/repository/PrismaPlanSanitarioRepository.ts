import { injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Prisma } from "@/generated/prisma/client";
import { PlanSanitario } from "../../domain/PlanSanitario";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";

interface PrismaPlanRecord {
	id: number;
	nombre: string;
	descripcion: string;
	frecuenciaDias: number;
	dosisPorAnimal: Prisma.Decimal;
	veterinarioId: number;
	insumoId: number;
	terrenoId: number | null;
	razaId: number | null;
	edadMinimaMeses: number | null;
	proximaEjecucion: Date;
	activo: boolean;
	usuarioId: number;
	veterinario?: { nombre: string };
	insumo?: { nombre: string; unidadMedida: string };
	terreno?: { nombre: string } | null;
	raza?: { nombre: string } | null;
}

@injectable()
export class PrismaPlanSanitarioRepository implements PlanSanitarioRepository {
	private readonly includeRelaciones = {
		veterinario: { select: { nombre: true } },
		insumo: { select: { nombre: true, unidadMedida: true } },
		terreno: { select: { nombre: true } },
		raza: { select: { nombre: true } },
	} as const;

	private toDomain(record: PrismaPlanRecord): PlanSanitario {
		return PlanSanitario.reconstitute(
			record.id,
			record.nombre,
			record.descripcion,
			record.frecuenciaDias,
			record.dosisPorAnimal.toNumber(),
			record.veterinarioId,
			record.insumoId,
			record.terrenoId,
			record.razaId,
			record.edadMinimaMeses,
			record.proximaEjecucion,
			record.activo,
			record.usuarioId,
			{
				nombreVeterinario: record.veterinario?.nombre,
				nombreInsumo: record.insumo?.nombre,
				unidadMedidaInsumo: record.insumo?.unidadMedida,
				nombreTerreno: record.terreno?.nombre ?? null,
				nombreRaza: record.raza?.nombre ?? null,
			},
		);
	}

	public async save(plan: PlanSanitario): Promise<PlanSanitario> {
		const data = {
			nombre: plan.getNombre(),
			descripcion: plan.getDescripcion(),
			frecuenciaDias: plan.getFrecuenciaDias(),
			dosisPorAnimal: plan.getDosisPorAnimal(),
			veterinarioId: plan.getVeterinarioId(),
			insumoId: plan.getInsumoId(),
			terrenoId: plan.getTerrenoId(),
			razaId: plan.getRazaId(),
			edadMinimaMeses: plan.getEdadMinimaMeses(),
			proximaEjecucion: plan.getProximaEjecucion(),
			activo: plan.estaActivo(),
			usuarioId: plan.getUsuarioId(),
		};

		if (plan.esNuevo()) {
			const created = await db().planSanitario.create({
				data,
				include: this.includeRelaciones,
			});
			return this.toDomain(created as unknown as PrismaPlanRecord);
		}

		const updated = await db().planSanitario.update({
			where: { id: plan.getId() },
			data,
			include: this.includeRelaciones,
		});
		return this.toDomain(updated as unknown as PrismaPlanRecord);
	}

	public async findById(id: number): Promise<PlanSanitario | null> {
		const record = await db().planSanitario.findFirst({
			where: { id },
			include: this.includeRelaciones,
		});
		if (!record) return null;
		return this.toDomain(record as unknown as PrismaPlanRecord);
	}

	public async findByUsuario(actor: Actor): Promise<PlanSanitario[]> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const records = await db().planSanitario.findMany({
			where: usuarioId !== undefined ? { usuarioId } : {},
			include: this.includeRelaciones,
			orderBy: { proximaEjecucion: "asc" },
		});
		return records.map((r) => this.toDomain(r as unknown as PrismaPlanRecord));
	}

	public async findActivosPorEjecutar(
		hasta: Date,
		actor?: Actor,
	): Promise<PlanSanitario[]> {
		const usuarioId = actor ? usuarioIdDeFiltro(actor) : undefined;
		const records = await db().planSanitario.findMany({
			where: {
				activo: true,
				proximaEjecucion: { lte: hasta },
				...(usuarioId !== undefined && { usuarioId }),
			},
			include: this.includeRelaciones,
			orderBy: { proximaEjecucion: "asc" },
		});
		return records.map((r) => this.toDomain(r as unknown as PrismaPlanRecord));
	}

	public async delete(id: number): Promise<void> {
		await db().planSanitario.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}

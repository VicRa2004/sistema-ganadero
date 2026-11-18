import { inject, injectable } from "tsyringe";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { DashboardResumenDto } from "../dtos/DashboardResumenDto";
import type { DashboardResumenQuery } from "../queries/DashboardResumenQuery";

const CACHE_TTL_MS = 45_000;

@injectable()
export class ObtenerDashboardResumenUseCase {
	private readonly cache = new Map<
		string,
		{ expiresAt: number; data: DashboardResumenDto }
	>();

	constructor(
		@inject("DashboardResumenQuery")
		private readonly query: DashboardResumenQuery,
	) {}

	public async run(actor: Actor): Promise<DashboardResumenDto> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const cacheKey = usuarioId !== undefined ? `user:${usuarioId}` : "ADMIN";
		const ahora = Date.now();
		const hit = this.cache.get(cacheKey);
		if (hit && hit.expiresAt > ahora) {
			return hit.data;
		}

		const data = await this.query.obtenerResumen(actor);
		this.cache.set(cacheKey, {
			expiresAt: ahora + CACHE_TTL_MS,
			data,
		});
		return data;
	}

	public limpiarCache(): void {
		this.cache.clear();
	}
}

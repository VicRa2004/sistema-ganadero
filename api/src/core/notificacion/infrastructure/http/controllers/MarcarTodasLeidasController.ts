import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { MarcarTodasLeidasUseCase } from "../../../application/useCases/MarcarTodasLeidasUseCase";

@injectable()
export class MarcarTodasLeidasController extends BaseController {
	constructor(
		@inject("MarcarTodasLeidasUseCase")
		private readonly useCase: MarcarTodasLeidasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const result = await this.useCase.run(actor.id);
			return this.ok(c, result);
		});
	};
}

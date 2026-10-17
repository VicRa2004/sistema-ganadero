import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ConsumirInsumoUseCase } from "./ConsumirInsumoUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import { InsumoStockInsuficienteError } from "../../domain/error/InsumoStockInsuficienteError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("ConsumirInsumoUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: ConsumirInsumoUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		repository = {
			findById: mock((id: number) => {
				if (id === 5) {
					return Promise.resolve(
						Insumo.reconstitute(
							5,
							"Vacuna",
							"VACUNA",
							50,
							20,
							"dosis",
							"LOT-200",
							new Date("2027-01-01"),
							1,
						),
					);
				}
				return Promise.resolve(null);
			}),
			findAll: mock(() =>
				Promise.resolve({ data: [], page: 1, totalItems: 0, totalPages: 0 }),
			),
			findCriticos: mock(() => Promise.resolve([])),
			save: mock((insumo: Insumo) => Promise.resolve(insumo)),
			descontarStock: mock((id: number, cantidad: number) =>
				Promise.resolve(
					Insumo.reconstitute(
						id,
						"Vacuna",
						"VACUNA",
						50 - cantidad,
						20,
						"dosis",
						"LOT-200",
						new Date("2027-01-01"),
						1,
					),
				),
			),
			adicionarStock: mock(() => Promise.resolve(null)),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new ConsumirInsumoUseCase(repository, mapper);
	});

	it("debe descontar stock de un insumo existente y retornar DTO", async () => {
		const result = await useCase.run(5, { cantidad: 20 }, 1, "USER");

		expect(repository.findById).toHaveBeenCalledWith(5);
		expect(repository.descontarStock).toHaveBeenCalledWith(5, 20);
		expect(repository.save).not.toHaveBeenCalled();
		expect(result.stock).toBe(30);
		expect(result.esBajoStock).toBeFalse();
	});

	it("debe lanzar InsumoStockInsuficienteError si la cantidad supera el stock", async () => {
		expect(useCase.run(5, { cantidad: 100 }, 1, "USER")).rejects.toThrow(
			InsumoStockInsuficienteError,
		);
	});

	it("debe lanzar InsumoNotFoundError si el insumo no existe", async () => {
		expect(useCase.run(99, { cantidad: 5 }, 1, "USER")).rejects.toThrow(
			InsumoNotFoundError,
		);
	});

	it("no descuenta si la cantidad supera el stock leído", async () => {
		await expect(useCase.run(5, { cantidad: 100 }, 1, "USER")).rejects.toThrow(
			InsumoStockInsuficienteError,
		);
		expect(repository.descontarStock).not.toHaveBeenCalled();
	});

	it("falla con stock insuficiente si otra petición consumió el stock entretanto", async () => {
		repository.descontarStock = mock(() => Promise.resolve(null));

		await expect(useCase.run(5, { cantidad: 20 }, 1, "USER")).rejects.toThrow(
			InsumoStockInsuficienteError,
		);
	});
});

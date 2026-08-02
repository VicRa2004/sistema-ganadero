import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ListarInsumosUseCase } from "./ListarInsumosUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("ListarInsumosUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: ListarInsumosUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		const insumos = [
			Insumo.reconstitute(
				1,
				"Insumo 1",
				"MEDICAMENTO",
				100,
				10,
				"ml",
				"L1",
				new Date("2027-01-01"),
			),
			Insumo.reconstitute(
				2,
				"Insumo 2",
				"ALIMENTO",
				500,
				50,
				"kg",
				"L2",
				new Date("2027-01-01"),
			),
		];
		repository = {
			findById: mock(() => Promise.resolve(null)),
			findAll: mock(() =>
				Promise.resolve({
					data: insumos,
					page: 1,
					totalItems: 2,
					totalPages: 1,
				}),
			),
			findCriticos: mock(() => Promise.resolve([])),
			save: mock((insumo: Insumo) => Promise.resolve(insumo)),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new ListarInsumosUseCase(repository, mapper);
	});

	it("debe retornar insumos paginados mapeados a DTOs", async () => {
		const filters = { page: 1, limit: 10, nombre: "Insumo" };
		const result = await useCase.run(filters);

		expect(repository.findAll).toHaveBeenCalledWith(filters);
		expect(result.data).toHaveLength(2);
		expect(result.totalItems).toBe(2);
		expect(result.totalPages).toBe(1);
		expect(result.data[0].id).toBe(1);
	});
});

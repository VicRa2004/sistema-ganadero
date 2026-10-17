import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { AbastecerInsumoUseCase } from "./AbastecerInsumoUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("AbastecerInsumoUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: AbastecerInsumoUseCase;

	const mockInsumo = Insumo.reconstitute(
		5,
		"Antibiótico",
		"MEDICAMENTO",
		50,
		20,
		"ml",
		"LOT-100",
		new Date("2027-01-01"),
		1,
	);

	beforeEach(() => {
		mapper = new InsumoMapper();
		repository = {
			findById: mock((id: number) =>
				Promise.resolve(id === 5 ? mockInsumo : null),
			),
			findAll: mock(() =>
				Promise.resolve({ data: [], page: 1, totalItems: 0, totalPages: 0 }),
			),
			findCriticos: mock(() => Promise.resolve([])),
			save: mock((insumo: Insumo) => Promise.resolve(insumo)),
			descontarStock: mock(() => Promise.resolve(null)),
			adicionarStock: mock((id: number, cantidad: number) =>
				Promise.resolve(
					Insumo.reconstitute(
						id,
						"Antibiótico",
						"MEDICAMENTO",
						mockInsumo.getStock() + cantidad,
						20,
						"ml",
						"LOT-100",
						new Date("2027-01-01"),
						1,
					),
				),
			),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new AbastecerInsumoUseCase(repository, mapper);
	});

	it("debe adicionar stock a un insumo existente y retornar DTO actualizado", async () => {
		const result = await useCase.run(5, { cantidad: 30 }, 1, "USER");

		expect(repository.findById).toHaveBeenCalledWith(5);
		expect(repository.adicionarStock).toHaveBeenCalledWith(5, 30);
		expect(repository.save).not.toHaveBeenCalled();
		expect(result.stock).toBe(80);
	});

	it("debe rechazar cantidades no positivas sin tocar la BD", async () => {
		await expect(useCase.run(5, { cantidad: 0 }, 1, "USER")).rejects.toThrow(
			"mayor a cero",
		);
		expect(repository.adicionarStock).not.toHaveBeenCalled();
	});

	it("debe lanzar InsumoNotFoundError si el insumo no existe", async () => {
		expect(useCase.run(99, { cantidad: 10 }, 1, "USER")).rejects.toThrow(
			InsumoNotFoundError,
		);
	});
});

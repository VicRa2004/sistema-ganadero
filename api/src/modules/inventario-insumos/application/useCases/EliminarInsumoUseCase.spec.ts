import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { EliminarInsumoUseCase } from "./EliminarInsumoUseCase";
import { Insumo } from "../../domain/Insumo";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("EliminarInsumoUseCase", () => {
	let repository: InsumoRepository;
	let useCase: EliminarInsumoUseCase;

	beforeEach(() => {
		repository = {
			findById: mock((id: number) =>
				Promise.resolve(
					id === 1
						? Insumo.reconstitute(
								1,
								"Insumo a Eliminar",
								"ALIMENTO",
								100,
								10,
								"kg",
								"L-DEL",
								new Date("2027-01-01"),
							)
						: null,
				),
			),
			findAll: mock(() =>
				Promise.resolve({ data: [], page: 1, totalItems: 0, totalPages: 0 }),
			),
			findCriticos: mock(() => Promise.resolve([])),
			save: mock((insumo: Insumo) => Promise.resolve(insumo)),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new EliminarInsumoUseCase(repository);
	});

	it("debe ejecutar el borrado suave (delete) si el insumo existe", async () => {
		await useCase.run(1);

		expect(repository.findById).toHaveBeenCalledWith(1);
		expect(repository.delete).toHaveBeenCalledWith(1);
	});

	it("debe lanzar InsumoNotFoundError si el insumo no existe", async () => {
		expect(useCase.run(999)).rejects.toThrow(InsumoNotFoundError);
	});
});

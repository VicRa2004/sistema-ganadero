import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ObtenerDetalleInsumoUseCase } from "./ObtenerDetalleInsumoUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("ObtenerDetalleInsumoUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: ObtenerDetalleInsumoUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		repository = {
			findById: mock((id: number) =>
				Promise.resolve(
					id === 1
						? Insumo.reconstitute(
								1,
								"Insumo Test",
								"MEDICAMENTO",
								10,
								2,
								"ml",
								"L-1",
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
		useCase = new ObtenerDetalleInsumoUseCase(repository, mapper);
	});

	it("debe retornar el DTO del insumo si existe", async () => {
		const result = await useCase.run(1);

		expect(repository.findById).toHaveBeenCalledWith(1);
		expect(result.id).toBe(1);
		expect(result.nombre).toBe("Insumo Test");
	});

	it("debe lanzar InsumoNotFoundError si el insumo no existe", async () => {
		expect(useCase.run(999)).rejects.toThrow(InsumoNotFoundError);
	});
});

import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ActualizarInsumoUseCase } from "./ActualizarInsumoUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("ActualizarInsumoUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: ActualizarInsumoUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		repository = {
			findById: mock((id: number) =>
				Promise.resolve(
					id === 1
						? Insumo.reconstitute(
								1,
								"Nombre Viejo",
								"MEDICAMENTO",
								100,
								10,
								"ml",
								"LOT-VIEJO",
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
		useCase = new ActualizarInsumoUseCase(repository, mapper);
	});

	it("debe actualizar los datos del insumo y retornar DTO actualizado", async () => {
		const result = await useCase.run(1, {
			nombre: "Nombre Nuevo",
			stockMinimo: 25,
			lote: "LOT-NUEVO",
		});

		expect(repository.findById).toHaveBeenCalledWith(1);
		expect(repository.save).toHaveBeenCalled();
		expect(result.nombre).toBe("Nombre Nuevo");
		expect(result.stockMinimo).toBe(25);
		expect(result.lote).toBe("LOT-NUEVO");
	});

	it("debe lanzar InsumoNotFoundError si el insumo no existe", async () => {
		expect(useCase.run(999, { nombre: "Test" })).rejects.toThrow(
			InsumoNotFoundError,
		);
	});
});

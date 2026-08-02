import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { RegistrarInsumoUseCase } from "./RegistrarInsumoUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { RegistrarInsumoInputDto } from "../dtos/InsumoDto";

describe("RegistrarInsumoUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: RegistrarInsumoUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		repository = {
			findById: mock(() => Promise.resolve(null)),
			findAll: mock(() =>
				Promise.resolve({ data: [], page: 1, totalItems: 0, totalPages: 0 }),
			),
			findCriticos: mock(() => Promise.resolve([])),
			save: mock((insumo: Insumo) =>
				Promise.resolve(
					Insumo.reconstitute(
						1,
						insumo.getNombre(),
						insumo.getTipo(),
						insumo.getStock(),
						insumo.getStockMinimo(),
						insumo.getUnidadMedida(),
						insumo.getLote(),
						insumo.getFechaCaducidad(),
					),
				),
			),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new RegistrarInsumoUseCase(repository, mapper);
	});

	it("debe registrar un nuevo insumo y retornar su DTO", async () => {
		const input: RegistrarInsumoInputDto = {
			nombre: "Vitamina B12",
			tipo: "MEDICAMENTO",
			stockInicial: 100,
			stockMinimo: 20,
			unidadMedida: "ml",
			lote: "LOT-999",
			fechaCaducidad: "2028-01-01T00:00:00.000Z",
		};

		const result = await useCase.run(input);

		expect(repository.save).toHaveBeenCalled();
		expect(result).toEqual({
			id: 1,
			nombre: "Vitamina B12",
			tipo: "MEDICAMENTO",
			stock: 100,
			stockMinimo: 20,
			unidadMedida: "ml",
			lote: "LOT-999",
			fechaCaducidad: new Date("2028-01-01T00:00:00.000Z").toISOString(),
			esBajoStock: false,
		});
	});
});

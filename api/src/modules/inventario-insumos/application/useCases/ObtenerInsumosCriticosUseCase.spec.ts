import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ObtenerInsumosCriticosUseCase } from "./ObtenerInsumosCriticosUseCase";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { Insumo } from "../../domain/Insumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

describe("ObtenerInsumosCriticosUseCase", () => {
	let repository: InsumoRepository;
	let mapper: InsumoMapper;
	let useCase: ObtenerInsumosCriticosUseCase;

	beforeEach(() => {
		mapper = new InsumoMapper();
		const critico = Insumo.reconstitute(
			1,
			"Vacuna Critica",
			"VACUNA",
			5,
			50,
			"dosis",
			"LOT-X",
			new Date("2027-01-01"),
		);
		repository = {
			findById: mock(() => Promise.resolve(null)),
			findAll: mock(() =>
				Promise.resolve({ data: [], page: 1, totalItems: 0, totalPages: 0 }),
			),
			findCriticos: mock(() => Promise.resolve([critico])),
			save: mock((insumo: Insumo) => Promise.resolve(insumo)),
			delete: mock(() => Promise.resolve()),
		};
		useCase = new ObtenerInsumosCriticosUseCase(repository, mapper);
	});

	it("debe retornar la lista de insumos con stock igual o inferior al stock mínimo", async () => {
		const result = await useCase.run();

		expect(repository.findCriticos).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].nombre).toBe("Vacuna Critica");
		expect(result[0].esBajoStock).toBeTrue();
	});
});

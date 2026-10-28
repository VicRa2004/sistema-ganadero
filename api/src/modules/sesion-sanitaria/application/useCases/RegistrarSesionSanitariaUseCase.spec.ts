import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { RegistrarSesionSanitariaUseCase } from "./RegistrarSesionSanitariaUseCase";

const actor: Actor = { id: 1, role: "USER" };

const sesionRepository = { save: mock(async (s: unknown) => s) };
const insumoRepository = { descontarStock: mock(), findById: mock() };
const transactionRunner = { run: mock(async (fn: () => unknown) => fn()) };
const accessService = { obtenerVeterinario: mock(), obtenerInsumo: mock() };
const ganadoAccessService = { obtenerGanado: mock() };
const mapper = { toDto: mock((s: unknown) => s) };

const insumo = (stock: number) => ({
	getId: () => 3,
	getStock: () => stock,
	getNombre: () => "Ivermectina",
	getUnidadMedida: () => "ml",
});

const dto = {
	fecha: "2024-05-01",
	veterinarioId: 2,
	insumoId: 3,
	descripcion: "Desparasitación",
	aplicaciones: [
		{ ganadoId: 10, dosisAplicada: 5 },
		{ ganadoId: 11, dosisAplicada: 5 },
	],
};

describe("RegistrarSesionSanitariaUseCase", () => {
	const useCase = new RegistrarSesionSanitariaUseCase(
		sesionRepository as any,
		insumoRepository as any,
		transactionRunner as any,
		accessService as any,
		ganadoAccessService as any,
		mapper as any,
	);

	beforeEach(() => {
		sesionRepository.save.mockClear();
		insumoRepository.descontarStock.mockReset();
		insumoRepository.findById.mockReset();
		accessService.obtenerVeterinario.mockResolvedValue({
			getNombre: () => "Dr. Pérez",
		});
	});

	it("descuenta la dosis total y guarda la sesión en la misma transacción", async () => {
		accessService.obtenerInsumo.mockResolvedValue(insumo(100));
		insumoRepository.descontarStock.mockResolvedValue(true);

		await useCase.run(dto as any, actor);

		expect(insumoRepository.descontarStock).toHaveBeenCalledWith(3, 10);
		expect(sesionRepository.save).toHaveBeenCalled();
		expect(transactionRunner.run).toHaveBeenCalled();
	});

	it("rechaza si el stock no alcanza, sin tocar la BD", async () => {
		accessService.obtenerInsumo.mockResolvedValue(insumo(9));

		await expect(useCase.run(dto as any, actor)).rejects.toBeDefined();
		expect(insumoRepository.descontarStock).not.toHaveBeenCalled();
		expect(sesionRepository.save).not.toHaveBeenCalled();
	});

	it("no guarda la sesión si otro proceso consumió el stock (carrera)", async () => {
		accessService.obtenerInsumo.mockResolvedValue(insumo(100));
		insumoRepository.descontarStock.mockResolvedValue(false);
		insumoRepository.findById.mockResolvedValue(insumo(2));

		await expect(useCase.run(dto as any, actor)).rejects.toBeDefined();
		expect(sesionRepository.save).not.toHaveBeenCalled();
	});

	it("exige al menos una aplicación", async () => {
		accessService.obtenerInsumo.mockResolvedValue(insumo(100));

		await expect(
			useCase.run({ ...dto, aplicaciones: [] } as any, actor),
		).rejects.toBeDefined();
	});
});

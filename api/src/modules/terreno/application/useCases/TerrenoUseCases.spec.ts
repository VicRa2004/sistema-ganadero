import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Terreno } from "../../domain/Terreno";
import { TerrenoMapper } from "../mappers/TerrenoMapper";
import { EliminarTerrenoUseCase } from "./EliminarTerrenoUseCase";
import { ObtenerCapacidadTerrenoUseCase } from "./ObtenerCapacidadTerrenoUseCase";
import { RegistrarTerrenoUseCase } from "./RegistrarTerrenoUseCase";

const terrenoRepository = {
	findById: mock(),
	save: mock(),
	delete: mock(async () => {}),
	countGanadoByRanchoId: mock(),
};
const imageStorage = { upload: mock() };

// Terreno 5, dueño usuario 1, capacidad 10
const terreno = () =>
	Terreno.reconstitute(5, "Potrero", "Norte", 20, 10, null, 1);

beforeEach(() => {
	terrenoRepository.findById.mockReset();
	terrenoRepository.save.mockReset();
	terrenoRepository.delete.mockClear();
	terrenoRepository.countGanadoByRanchoId.mockReset();
});

describe("ObtenerCapacidadTerrenoUseCase", () => {
	const useCase = new ObtenerCapacidadTerrenoUseCase(terrenoRepository as any);

	it("calcula el espacio disponible", async () => {
		terrenoRepository.findById.mockResolvedValue(terreno());
		terrenoRepository.countGanadoByRanchoId.mockResolvedValue(4);

		expect(await useCase.run(5, 1, "USER")).toMatchObject({
			capacidadMaxima: 10,
			cabezasGanadoActuales: 4,
			espacioDisponible: 6,
		});
	});

	it("niega el acceso a un usuario ajeno pero no a un ADMIN", async () => {
		terrenoRepository.findById.mockResolvedValue(terreno());
		terrenoRepository.countGanadoByRanchoId.mockResolvedValue(0);

		await expect(useCase.run(5, 2, "USER")).rejects.toMatchObject({
			code: 403,
		});
		await expect(useCase.run(5, 2, "ADMIN")).resolves.toBeDefined();
	});

	it("404 si el terreno no existe", async () => {
		terrenoRepository.findById.mockResolvedValue(null);
		await expect(useCase.run(5, 1, "USER")).rejects.toMatchObject({
			code: 404,
		});
	});
});

describe("EliminarTerrenoUseCase", () => {
	const useCase = new EliminarTerrenoUseCase(terrenoRepository as any);

	it("elimina el terreno propio", async () => {
		terrenoRepository.findById.mockResolvedValue(terreno());
		await useCase.run(5, 1, "USER");
		expect(terrenoRepository.delete).toHaveBeenCalledWith(5);
	});

	it("no elimina un terreno ajeno", async () => {
		terrenoRepository.findById.mockResolvedValue(terreno());
		await expect(useCase.run(5, 2, "USER")).rejects.toMatchObject({
			code: 403,
		});
		expect(terrenoRepository.delete).not.toHaveBeenCalled();
	});
});

describe("RegistrarTerrenoUseCase", () => {
	const useCase = new RegistrarTerrenoUseCase(
		terrenoRepository as any,
		new TerrenoMapper(),
		imageStorage as any,
	);
	const dto = {
		nombre: "Potrero",
		ubicacion: "Norte",
		extensionHectareas: 20,
		capacidadMaxima: 10,
		usuarioId: 1,
	};

	it("registra el terreno", async () => {
		terrenoRepository.save.mockResolvedValue(terreno());
		const result = await useCase.run(dto as any);
		expect(result.nombre).toBe("Potrero");
	});

	it("rechaza una capacidad inválida sin guardar", async () => {
		await expect(
			useCase.run({ ...dto, capacidadMaxima: 0 } as any),
		).rejects.toBeDefined();
		expect(terrenoRepository.save).not.toHaveBeenCalled();
	});
});

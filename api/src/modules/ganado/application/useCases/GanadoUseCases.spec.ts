import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { Terreno } from "@/modules/terreno/domain/Terreno";
import { Ganado } from "../../domain/Ganado";
import { GanadoMapper } from "../mappers/GanadoMapper";
import { DarDeBajaGanadoUseCase } from "./DarDeBajaGanadoUseCase";
import { RegistrarGanadoUseCase } from "./RegistrarGanadoUseCase";
import { TrasladarGanadoUseCase } from "./TrasladarGanadoUseCase";

const actor: Actor = { id: 1, role: "USER" };
const mapper = new GanadoMapper();

const ganadoRepository = {
	save: mock(async (g: Ganado) => g),
	findByIdentificador: mock(),
};
const motivoBajaRepository = { findById: mock() };
const razaRepository = { findById: mock() };
const imageStorage = { upload: mock() };
const terrenoRepository = { countGanadoByRanchoId: mock(async () => 0) };
const accessService = {
	obtenerGanado: mock(),
	obtenerTerreno: mock(),
	obtenerPropietario: mock(),
};

const terreno = (capacidad: number) =>
	Terreno.reconstitute(5, "Potrero", "Norte", 10, capacidad, null, 1);

const vaca = (fechaBaja: Date | null = null) =>
	Ganado.reconstitute(
		10,
		"ARETE-1",
		300,
		new Date("2023-01-01"),
		"HEMBRA",
		null,
		1,
		2,
		3,
		null,
		null,
		fechaBaja,
		fechaBaja ? 1 : null,
	);

beforeEach(() => {
	for (const m of [
		...Object.values(ganadoRepository),
		...Object.values(motivoBajaRepository),
		...Object.values(razaRepository),
		...Object.values(accessService),
	])
		m.mockClear();
	ganadoRepository.findByIdentificador.mockReset();
	accessService.obtenerGanado.mockReset();
	accessService.obtenerTerreno.mockReset();
	accessService.obtenerPropietario.mockReset();
});

describe("RegistrarGanadoUseCase", () => {
	const useCase = new RegistrarGanadoUseCase(
		ganadoRepository as any,
		razaRepository as any,
		accessService as any,
		mapper,
		imageStorage as any,
	);
	const dto = {
		identificador: "ARETE-1",
		peso: 300,
		fechaNacimiento: "2023-01-01",
		sexo: "HEMBRA" as const,
		razaId: 1,
		terrenoId: 2,
		propietarioId: 3,
	};

	it("registra el ganado validando terreno y propietario del actor", async () => {
		ganadoRepository.findByIdentificador.mockResolvedValue(null);
		razaRepository.findById.mockResolvedValue({});
		ganadoRepository.save.mockResolvedValueOnce(vaca()); // la BD asigna el id

		const result = await useCase.run(dto as any, actor);

		expect(accessService.obtenerTerreno).toHaveBeenCalledWith(2, actor);
		expect(accessService.obtenerPropietario).toHaveBeenCalledWith(3, actor);
		expect(result.identificador).toBe("ARETE-1");
	});

	it("rechaza un arete duplicado sin guardar", async () => {
		ganadoRepository.findByIdentificador.mockResolvedValue(vaca());

		await expect(useCase.run(dto as any, actor)).rejects.toMatchObject({
			code: 400,
		});
		expect(ganadoRepository.save).not.toHaveBeenCalled();
	});

	it("propaga el error de ownership del terreno", async () => {
		ganadoRepository.findByIdentificador.mockResolvedValue(null);
		razaRepository.findById.mockResolvedValue({});
		accessService.obtenerTerreno.mockRejectedValue(new Error("ajeno"));

		await expect(useCase.run(dto as any, actor)).rejects.toThrow("ajeno");
		expect(ganadoRepository.save).not.toHaveBeenCalled();
	});
});

describe("TrasladarGanadoUseCase", () => {
	const useCase = new TrasladarGanadoUseCase(
		ganadoRepository as any,
		terrenoRepository as any,
		accessService as any,
		mapper,
	);

	it("mueve el ganado al terreno destino", async () => {
		accessService.obtenerTerreno.mockResolvedValue(terreno(10));
		accessService.obtenerGanado.mockResolvedValue(vaca());

		const result = await useCase.run(10, 5, actor);

		expect(accessService.obtenerTerreno).toHaveBeenCalledWith(5, actor);
		expect(result.terrenoId).toBe(5);
	});

	it("rechaza el traslado si el terreno destino está lleno", async () => {
		accessService.obtenerGanado.mockResolvedValue(vaca());
		accessService.obtenerTerreno.mockResolvedValue(terreno(3));
		terrenoRepository.countGanadoByRanchoId.mockResolvedValueOnce(3);

		await expect(useCase.run(10, 5, actor)).rejects.toMatchObject({
			code: 400,
		});
		expect(ganadoRepository.save).not.toHaveBeenCalled();
	});

	it("no guarda si el terreno destino no es accesible", async () => {
		accessService.obtenerGanado.mockResolvedValue(vaca());
		accessService.obtenerTerreno.mockRejectedValue(new Error("ajeno"));

		await expect(useCase.run(10, 5, actor)).rejects.toThrow("ajeno");
		expect(ganadoRepository.save).not.toHaveBeenCalled();
	});
});

describe("DarDeBajaGanadoUseCase", () => {
	const useCase = new DarDeBajaGanadoUseCase(
		ganadoRepository as any,
		motivoBajaRepository as any,
		accessService as any,
		mapper,
	);
	const dto = { motivoBajaId: 1, fechaBaja: "2024-05-01" };

	it("da de baja al ganado activo", async () => {
		accessService.obtenerGanado.mockResolvedValue(vaca());
		motivoBajaRepository.findById.mockResolvedValue({});

		const result = await useCase.run(10, dto, actor);

		expect(result.motivoBajaId).toBe(1);
		expect(result.fechaBaja).not.toBeNull();
	});

	it("rechaza si ya estaba dado de baja", async () => {
		accessService.obtenerGanado.mockResolvedValue(vaca(new Date()));

		await expect(useCase.run(10, dto, actor)).rejects.toMatchObject({
			code: 400,
		});
		expect(ganadoRepository.save).not.toHaveBeenCalled();
	});

	it("rechaza un motivo de baja inexistente", async () => {
		accessService.obtenerGanado.mockResolvedValue(vaca());
		motivoBajaRepository.findById.mockResolvedValue(null);

		await expect(useCase.run(10, dto, actor)).rejects.toMatchObject({
			code: 404,
		});
	});
});

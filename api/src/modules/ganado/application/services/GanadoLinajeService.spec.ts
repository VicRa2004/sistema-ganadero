import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { Ganado } from "../../domain/Ganado";
import { GanadoLinajeService } from "./GanadoLinajeService";

const actor: Actor = { id: 1, role: "USER" };

const makeAnimal = (
	id: number,
	sexo: "MACHO" | "HEMBRA",
	fechaNacimiento: string,
	padreId: number | null = null,
	madreId: number | null = null,
) =>
	Ganado.reconstitute(
		id,
		`AR-${id}`,
		400,
		new Date(fechaNacimiento),
		sexo,
		null,
		1,
		1,
		1,
		padreId,
		madreId,
		null,
		null,
	);

describe("GanadoLinajeService", () => {
	const ganadoRepo = { findById: mock() };
	const accessService = { obtenerGanado: mock() };
	const service = new GanadoLinajeService(
		ganadoRepo as never,
		accessService as never,
	);

	beforeEach(() => {
		ganadoRepo.findById.mockReset();
		accessService.obtenerGanado.mockReset();
	});

	it("acepta padre MACHO y madre HEMBRA con al menos 12 meses de edad", async () => {
		const toro = makeAnimal(10, "MACHO", "2022-01-01");
		const vaca = makeAnimal(11, "HEMBRA", "2022-03-01");
		accessService.obtenerGanado.mockImplementation(async (id: number) =>
			id === 10 ? toro : vaca,
		);
		ganadoRepo.findById.mockResolvedValue(null);

		const res = await service.validarPadres({
			ganadoId: 20,
			fechaNacimientoCria: new Date("2025-01-01"),
			padreId: 10,
			madreId: 11,
			actor,
		});

		expect(res.padre?.getId()).toBe(10);
		expect(res.madre?.getId()).toBe(11);
	});

	it("rechaza padre HEMBRA o madre MACHO", async () => {
		const hembra = makeAnimal(10, "HEMBRA", "2022-01-01");
		accessService.obtenerGanado.mockResolvedValue(hembra);

		await expect(
			service.validarPadres({
				fechaNacimientoCria: new Date("2025-01-01"),
				padreId: 10,
				madreId: null,
				actor,
			}),
		).rejects.toMatchObject({ code: 400 });

		const macho = makeAnimal(11, "MACHO", "2022-01-01");
		accessService.obtenerGanado.mockResolvedValue(macho);

		await expect(
			service.validarPadres({
				fechaNacimientoCria: new Date("2025-01-01"),
				padreId: null,
				madreId: 11,
				actor,
			}),
		).rejects.toMatchObject({ code: 400 });
	});

	it("rechaza progenitor menor a 12 meses al nacimiento de la cría", async () => {
		const toroJoven = makeAnimal(10, "MACHO", "2024-06-01");
		accessService.obtenerGanado.mockResolvedValue(toroJoven);

		await expect(
			service.validarPadres({
				fechaNacimientoCria: new Date("2025-01-01"),
				padreId: 10,
				madreId: null,
				actor,
			}),
		).rejects.toMatchObject({ code: 400 });
	});

	it("detecta ciclos genealógicos indirectos (abuelo -> hijo -> nieto)", async () => {
		// Queremos asignar a animal 10 como padre de animal 1, pero 10 tiene como padre a 1
		const toro10 = makeAnimal(10, "MACHO", "2020-01-01", 1, null);
		accessService.obtenerGanado.mockResolvedValue(toro10);
		ganadoRepo.findById.mockImplementation(async (id: number) =>
			id === 10 ? toro10 : null,
		);

		await expect(
			service.validarPadres({
				ganadoId: 1,
				fechaNacimientoCria: new Date("2025-01-01"),
				padreId: 10,
				madreId: null,
				actor,
			}),
		).rejects.toMatchObject({ code: 400 });
	});
});

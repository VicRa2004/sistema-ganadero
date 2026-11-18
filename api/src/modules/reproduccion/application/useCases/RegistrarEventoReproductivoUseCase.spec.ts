import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { Ganado } from "@/modules/ganado/domain/Ganado";
import { Terreno } from "@/modules/terreno/domain/Terreno";
import { EventoReproductivo } from "../../domain/EventoReproductivo";
import { EventoReproductivoMapper } from "../mappers/EventoReproductivoMapper";
import { RegistrarEventoReproductivoUseCase } from "./RegistrarEventoReproductivoUseCase";

const actor: Actor = { id: 1, role: "USER" };

const animal = (
	id: number,
	sexo: "MACHO" | "HEMBRA",
	nacimiento: string,
	identificador = `AR-${id}`,
) =>
	Ganado.reconstitute(
		id,
		identificador,
		420,
		new Date(nacimiento),
		sexo,
		null,
		1,
		5,
		2,
		null,
		null,
		null,
		null,
	);

const terreno = Terreno.reconstitute(
	5,
	"Potrero Norte",
	"Norte",
	20,
	10,
	null,
	1,
);

describe("RegistrarEventoReproductivoUseCase", () => {
	const eventoRepo = {
		save: mock(async (e: EventoReproductivo) =>
			EventoReproductivo.reconstitute({
				id: 99,
				hembraId: e.getHembraId(),
				machoId: e.getMachoId(),
				tipo: e.getTipo(),
				fecha: e.getFecha(),
				resultado: e.getResultado(),
				fechaProbableParto: e.getFechaProbableParto(),
				observaciones: e.getObservaciones(),
			}),
		),
		findById: mock(),
		findAll: mock(),
		findUltimoServicioAbierto: mock(),
		vincularCrias: mock(async () => {}),
		delete: mock(),
	};
	const ganadoRepo = {
		findByIdentificador: mock(async () => null),
		save: mock(async (g: Ganado) =>
			Ganado.reconstitute(
				200,
				g.getIdentificador(),
				g.getPeso(),
				g.getFechaNacimiento(),
				g.getSexo(),
				null,
				g.getRazaId(),
				g.getTerrenoId(),
				g.getPropietarioId(),
				g.getPadreId(),
				g.getMadreId(),
				null,
				null,
			),
		),
	};
	const ganadoAccess = {
		obtenerGanado: mock(),
		obtenerTerreno: mock(async () => terreno),
		obtenerPropietario: mock(async () => ({})),
	};
	const razaRepo = { findById: mock(async () => ({ id: 1 })) };
	const terrenoRepo = { countGanadoByRanchoId: mock(async () => 2) };
	const transactionRunner = {
		run: mock(async (fn: () => Promise<unknown>) => fn()),
	};

	const useCase = new RegistrarEventoReproductivoUseCase(
		eventoRepo as never,
		ganadoRepo as never,
		ganadoAccess as never,
		razaRepo as never,
		terrenoRepo as never,
		transactionRunner as never,
		new EventoReproductivoMapper(),
	);

	beforeEach(() => {
		for (const m of [
			eventoRepo.save,
			eventoRepo.findById,
			eventoRepo.findUltimoServicioAbierto,
			eventoRepo.vincularCrias,
			ganadoRepo.findByIdentificador,
			ganadoRepo.save,
			ganadoAccess.obtenerGanado,
			terrenoRepo.countGanadoByRanchoId,
			transactionRunner.run,
		]) {
			m.mockClear();
		}
		ganadoRepo.findByIdentificador.mockResolvedValue(null);
		terrenoRepo.countGanadoByRanchoId.mockResolvedValue(2);
	});

	it("calcula la fecha probable de parto (~283 días) en una MONTA", async () => {
		const hembra = animal(10, "HEMBRA", "2022-01-01");
		const macho = animal(11, "MACHO", "2022-01-01");
		ganadoAccess.obtenerGanado.mockImplementation(async (id: number) =>
			id === 10 ? hembra : macho,
		);

		const res = await useCase.run(
			{
				hembraId: 10,
				machoId: 11,
				tipo: "MONTA",
				fecha: "2025-01-01",
			},
			actor,
		);

		// 2025-01-01 + 283 días = 2025-10-11
		expect(res.fechaProbableParto).toBe("2025-10-11");
		expect(res.tipo).toBe("MONTA");
	});

	it("rechaza una MONTA si la hembra tiene menos de 12 meses", async () => {
		const becerra = animal(10, "HEMBRA", "2024-06-01");
		ganadoAccess.obtenerGanado.mockResolvedValue(becerra);

		await expect(
			useCase.run({ hembraId: 10, tipo: "MONTA", fecha: "2025-01-01" }, actor),
		).rejects.toMatchObject({ code: 400 });
		expect(eventoRepo.save).not.toHaveBeenCalled();
	});

	it("rechaza si el animal indicado como hembra es MACHO", async () => {
		const macho = animal(10, "MACHO", "2022-01-01");
		ganadoAccess.obtenerGanado.mockResolvedValue(macho);

		await expect(
			useCase.run(
				{ hembraId: 10, tipo: "INSEMINACION", fecha: "2025-01-01" },
				actor,
			),
		).rejects.toMatchObject({ code: 400 });
	});

	it("en PARTO crea las crías con padreId/madreId heredando terreno/raza/propietario en transacción", async () => {
		const madre = animal(10, "HEMBRA", "2022-01-01", "VACA-10");
		ganadoAccess.obtenerGanado.mockResolvedValue(madre);
		eventoRepo.findUltimoServicioAbierto.mockResolvedValue(
			EventoReproductivo.reconstitute({
				id: 50,
				hembraId: 10,
				machoId: 11,
				tipo: "MONTA",
				fecha: new Date("2024-04-01"),
				resultado: null,
				fechaProbableParto: new Date("2025-01-09"),
				observaciones: null,
			}),
		);
		eventoRepo.findById.mockResolvedValue(
			EventoReproductivo.reconstitute({
				id: 99,
				hembraId: 10,
				machoId: null,
				tipo: "PARTO",
				fecha: new Date("2025-01-10"),
				resultado: null,
				fechaProbableParto: null,
				observaciones: null,
				relaciones: {
					hembraIdentificador: "VACA-10",
					crias: [{ id: 200, identificador: "CRIA-01", sexo: "HEMBRA" }],
				},
			}),
		);

		const res = await useCase.run(
			{
				hembraId: 10,
				tipo: "PARTO",
				fecha: "2025-01-10",
				crias: [{ identificador: "CRIA-01", sexo: "HEMBRA", peso: 38 }],
			},
			actor,
		);

		expect(transactionRunner.run).toHaveBeenCalledTimes(1);
		expect(ganadoRepo.save).toHaveBeenCalledTimes(1);
		const criaGuardada = ganadoRepo.save.mock.calls[0]?.[0] as Ganado;
		expect(criaGuardada.getMadreId()).toBe(10);
		expect(criaGuardada.getPadreId()).toBe(11);
		expect(criaGuardada.getTerrenoId()).toBe(5);
		expect(eventoRepo.vincularCrias).toHaveBeenCalledWith(99, [200]);
		expect(res.crias).toHaveLength(1);
	});
});

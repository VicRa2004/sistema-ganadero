import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { Ganado } from "@/modules/ganado/domain/Ganado";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import { Insumo } from "@/modules/inventario-insumos/domain/Insumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import type { SesionAccessService } from "@/modules/sesion-sanitaria/application/services/SesionAccessService";
import type { SesionSanitariaRepository } from "@/modules/sesion-sanitaria/domain/repository/SesionSanitariaRepository";
import { SesionSanitaria } from "@/modules/sesion-sanitaria/domain/SesionSanitaria";
import { Terreno } from "@/modules/terreno/domain/Terreno";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import { Lote } from "../../domain/Lote";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";
import { CrearLoteUseCase } from "./CrearLoteUseCase";
import { PesajeMasivoLoteUseCase } from "./PesajeMasivoLoteUseCase";
import { TrasladoMasivoLoteUseCase } from "./TrasladoMasivoLoteUseCase";
import { VacunacionMasivaLoteUseCase } from "./VacunacionMasivaLoteUseCase";

describe("Casos de uso de Lote y operaciones masivas", () => {
	const actor: Actor = { id: 1, role: "USER" };
	const txRunner: TransactionRunner = {
		run: async <T>(fn: () => Promise<T>) => fn(),
	};

	let loteEntity: Lote;
	let ganado1: Ganado;
	let ganado2: Ganado;
	let loteRepo: LoteRepository;
	let accessService: LoteAccessService;
	let ganadoAccess: GanadoAccessService;
	let ganadoRepo: GanadoRepository;

	beforeEach(() => {
		loteEntity = Lote.reconstitute({
			id: 7,
			nombre: "Lote Engorda 1",
			proposito: "ENGORDA",
			descripcion: null,
			terrenoId: 3,
			activo: true,
			usuarioId: 1,
			cantidadAnimales: 2,
		});
		ganado1 = Ganado.reconstitute(
			101,
			"ARE-101",
			300,
			new Date("2024-01-01"),
			"MACHO",
			null,
			1,
			3,
			1,
			null,
			null,
			null,
			null,
		);
		ganado2 = Ganado.reconstitute(
			102,
			"ARE-102",
			320,
			new Date("2024-01-01"),
			"MACHO",
			null,
			1,
			3,
			1,
			null,
			null,
			null,
			null,
		);

		const lotesById = new Map<number, Lote>([[7, loteEntity]]);
		loteRepo = {
			findById: mock(async (id: number) => lotesById.get(id) ?? null),
			findDetailById: mock(async () => ({ lote: loteEntity, miembros: [] })),
			findAll: mock(async () => ({
				data: [loteEntity],
				page: 1,
				totalItems: 1,
				totalPages: 1,
			})),
			save: mock(async (l: Lote) => {
				const persisted = l.esNuevo()
					? Lote.reconstitute({
							id: 8,
							nombre: l.getNombre(),
							proposito: l.getProposito(),
							descripcion: l.getDescripcion(),
							terrenoId: l.getTerrenoId(),
							activo: l.esActivo(),
							usuarioId: l.getUsuarioId(),
						})
					: l;
				lotesById.set(persisted.getId(), persisted);
				return persisted;
			}),
			delete: mock(async () => {}),
			addMembers: mock(async () => {}),
			removeMember: mock(async () => {}),
			findActiveMemberIds: mock(async () => [101, 102]),
		};

		accessService = {
			obtenerLote: mock(async () => loteEntity),
			obtenerDetalle: mock(async () => ({ lote: loteEntity, miembros: [] })),
			validarTerreno: mock(async () => {}),
			validarGanadoActivo: mock(async (id: number) =>
				id === 101 ? ganado1 : ganado2,
			),
		} as unknown as LoteAccessService;

		ganadoAccess = {
			obtenerGanado: mock(async (id: number) =>
				id === 101 ? ganado1 : ganado2,
			),
			obtenerTerreno: mock(async (id: number) =>
				Terreno.reconstitute(id, "Potrero B", "Sur", 10, 5, null, 1),
			),
		} as unknown as GanadoAccessService;

		ganadoRepo = {
			save: mock(async (g: Ganado) => g),
			registrarPesaje: mock(async () => {}),
		} as unknown as GanadoRepository;
	});

	it("crea lote con miembros iniciales", async () => {
		const uc = new CrearLoteUseCase(
			loteRepo,
			accessService,
			txRunner,
			new LoteMapper(),
		);
		const res = await uc.run(
			{
				nombre: "Novillos",
				proposito: "ENGORDA",
				ganadoIds: [101, 102],
			},
			actor,
		);
		expect(res.id).toBe(8);
		expect(loteRepo.addMembers).toHaveBeenCalledWith(8, [101, 102]);
	});

	it("ejecuta pesaje masivo validando pertenencia al lote", async () => {
		const uc = new PesajeMasivoLoteUseCase(
			loteRepo,
			ganadoRepo,
			accessService,
			txRunner,
		);
		const res = await uc.run(
			7,
			{
				items: [
					{ ganadoId: 101, peso: 315 },
					{ ganadoId: 102, peso: 340 },
				],
			},
			actor,
		);
		expect(res.pesajesRegistrados).toBe(2);
		expect(ganadoRepo.registrarPesaje).toHaveBeenCalledTimes(2);
	});

	it("valida capacidad del terreno destino durante traslado masivo", async () => {
		const terrenoRepo = {
			countGanadoByRanchoId: mock(async () => 4),
		} as unknown as TerrenoRepository;
		const uc = new TrasladoMasivoLoteUseCase(
			loteRepo,
			ganadoRepo,
			terrenoRepo,
			ganadoAccess,
			accessService,
			txRunner,
		);
		await expect(uc.run(7, { terrenoDestinoId: 9 }, actor)).rejects.toThrow(
			ValidationError,
		);

		(
			terrenoRepo.countGanadoByRanchoId as ReturnType<typeof mock>
		).mockResolvedValueOnce(1);
		const ok = await uc.run(7, { terrenoDestinoId: 9 }, actor);
		expect(ok.animalesTrasladados).toBe(2);
		expect(ganado1.getTerrenoId()).toBe(9);
	});

	it("ejecuta vacunación masiva descontando stock y registrando kardex", async () => {
		const insumo = Insumo.reconstitute(
			20,
			"Vacuna Aftosa",
			"VACUNA",
			50,
			10,
			"dosis",
			"LOT-VAC",
			new Date("2028-01-01"),
			1,
			0,
			15,
		);
		const insumoRepo = {
			descontarStock: mock(async () =>
				Insumo.reconstitute(
					20,
					"Vacuna Aftosa",
					"VACUNA",
					46,
					10,
					"dosis",
					"LOT-VAC",
					new Date("2028-01-01"),
					1,
					0,
					15,
				),
			),
		} as unknown as InsumoRepository;
		const movimientoRepo = {
			registrarMuchos: mock(async () => {}),
		} as unknown as MovimientoInsumoRepository;
		const sesionAccess = {
			obtenerVeterinario: mock(async () => {}),
			obtenerInsumo: mock(async () => insumo),
		} as unknown as SesionAccessService;
		const sesionRepo = {
			save: mock(async (s: SesionSanitaria) =>
				SesionSanitaria.create(
					s.getFecha(),
					s.getVeterinarioId(),
					s.getDescripcion(),
					s.getInsumoId(),
					s.getAplicaciones(),
					99,
					"REALIZADA",
				),
			),
		} as unknown as SesionSanitariaRepository;

		const uc = new VacunacionMasivaLoteUseCase(
			loteRepo,
			accessService,
			sesionAccess,
			sesionRepo,
			insumoRepo,
			movimientoRepo,
			txRunner,
		);
		const res = await uc.run(
			7,
			{
				veterinarioId: 1,
				insumoId: 20,
				dosisPorAnimal: 2,
				fecha: "2026-10-01",
				descripcion: "Refuerzo anual",
			},
			actor,
		);
		expect(res.sesionId).toBe(99);
		expect(res.animalesVacunados).toBe(2);
		expect(res.dosisTotalConsumida).toBe(4);
		expect(movimientoRepo.registrarMuchos).toHaveBeenCalledTimes(1);
	});
});

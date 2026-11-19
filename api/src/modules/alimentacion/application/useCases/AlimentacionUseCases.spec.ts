import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { OutboxEventPublisher } from "@/core/notificacion/domain/events/SaludEvents";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { Insumo } from "@/modules/inventario-insumos/domain/Insumo";
import type { InsumoRepository } from "@/modules/inventario-insumos/domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "@/modules/inventario-insumos/domain/repository/MovimientoInsumoRepository";
import { RacionAlimentacion } from "../../domain/RacionAlimentacion";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import { SuministroRacion } from "../../domain/SuministroRacion";
import { AlimentacionMapper } from "../mappers/AlimentacionMapper";
import type { AutonomiaAlimentoQuery } from "../queries/AutonomiaAlimentoQuery";
import { AlimentacionAccessService } from "../services/AlimentacionAccessService";
import { CrearRacionUseCase } from "./CrearRacionUseCase";
import { ObtenerAutonomiaAlimentoUseCase } from "./ObtenerAutonomiaAlimentoUseCase";
import { RegistrarSuministroUseCase } from "./RegistrarSuministroUseCase";

describe("Casos de uso de Alimentación y Autonomía", () => {
	const actor: Actor = { id: 1, role: "USER" };
	const txRunner: TransactionRunner = {
		run: async <T>(fn: () => Promise<T>) => fn(),
	};

	let alimento: Insumo;
	let medicamento: Insumo;
	let racion: RacionAlimentacion;
	let alimRepo: AlimentacionRepository;
	let insumoRepo: InsumoRepository;
	let movRepo: MovimientoInsumoRepository;
	let outbox: OutboxEventPublisher;
	let autonomiaQuery: AutonomiaAlimentoQuery;

	beforeEach(() => {
		alimento = Insumo.reconstitute(
			30,
			"Concentrado Lechero",
			"ALIMENTO",
			100,
			20,
			"kg",
			"LOT-ALIM",
			new Date("2028-01-01"),
			1,
			0,
			12,
		);
		medicamento = Insumo.reconstitute(
			31,
			"Vitamina B12",
			"MEDICAMENTO",
			50,
			10,
			"ml",
			"LOT-MED",
			new Date("2028-01-01"),
			1,
			0,
			30,
		);
		racion = RacionAlimentacion.reconstitute({
			id: 1,
			nombre: "Ración Producción",
			insumoId: 30,
			terrenoId: 2,
			loteId: null,
			cantidadDiariaPorAnimal: 4,
			diasAlertaAutonomia: 7,
			activo: true,
			observaciones: null,
			usuarioId: 1,
		});

		alimRepo = {
			findRacionById: mock(async () => racion),
			findRaciones: mock(async () => ({
				data: [racion],
				page: 1,
				totalItems: 1,
				totalPages: 1,
			})),
			saveRacion: mock(async (r: RacionAlimentacion) => r),
			deleteRacion: mock(async () => {}),
			registrarSuministro: mock(async (s: SuministroRacion) =>
				SuministroRacion.reconstitute({
					id: 55,
					racionId: s.getRacionId(),
					insumoId: s.getInsumoId(),
					terrenoId: s.getTerrenoId(),
					loteId: s.getLoteId(),
					fecha: s.getFecha(),
					cantidadAnimales: s.getCantidadAnimales(),
					cantidadTotal: s.getCantidadTotal(),
					costoTotal: s.getCostoTotal(),
					observaciones: s.getObservaciones(),
					usuarioId: s.getUsuarioId(),
				}),
			),
			findSuministros: mock(async () => ({
				data: [],
				page: 1,
				totalItems: 0,
				totalPages: 0,
			})),
			countAnimalesGrupo: mock(async () => 5),
		};

		insumoRepo = {
			findById: mock(async (id: number) =>
				id === 30 ? alimento : id === 31 ? medicamento : null,
			),
			descontarStock: mock(async (_id: number, qty: number) =>
				Insumo.reconstitute(
					30,
					"Concentrado Lechero",
					"ALIMENTO",
					100 - qty,
					20,
					"kg",
					"LOT-ALIM",
					new Date("2028-01-01"),
					1,
					0,
					12,
				),
			),
		} as unknown as InsumoRepository;

		movRepo = {
			registrar: mock(async (m) => m),
		} as unknown as MovimientoInsumoRepository;

		outbox = {
			publish: mock(async () => {}),
			reprocesarPendientes: mock(async () => 0),
		} as unknown as OutboxEventPublisher;

		autonomiaQuery = {
			obtenerAutonomia: mock(async () => [
				{
					insumoId: 30,
					insumoNombre: "Concentrado Lechero",
					unidadMedida: "kg",
					stock: 80,
					consumoDiarioEsperado: 20,
					diasAutonomia: 4,
					diasAlertaUmbral: 7,
					enAlerta: true,
					animalesCubiertos: 5,
					usuarioId: 1,
				},
			]),
		};
	});

	it("rechaza crear ración con insumos que no sean ALIMENTO", async () => {
		const access = new AlimentacionAccessService(
			alimRepo,
			insumoRepo,
			{ findById: mock(async () => ({ getUsuarioId: () => 1 })) } as never,
			{} as never,
		);
		const uc = new CrearRacionUseCase(
			alimRepo,
			access,
			new AlimentacionMapper(),
		);
		await expect(
			uc.run(
				{
					nombre: "Inválida",
					insumoId: 31,
					terrenoId: 2,
					cantidadDiariaPorAnimal: 3,
				},
				actor,
			),
		).rejects.toThrow(ValidationError);
	});

	it("suministra ración, descuenta stock, registra kardex y emite alerta AUTONOMIA_ALIMENTO", async () => {
		const access = {
			obtenerRacion: mock(async () => racion),
			obtenerInsumoAlimento: mock(async () => alimento),
		} as unknown as AlimentacionAccessService;

		const uc = new RegistrarSuministroUseCase(
			alimRepo,
			access,
			insumoRepo,
			movRepo,
			txRunner,
			new AlimentacionMapper(),
			autonomiaQuery,
			outbox,
		);
		const res = await uc.run(1, { observaciones: "Mañana" }, actor);
		expect(res.cantidadTotal).toBe(20);
		expect(res.costoTotal).toBe(240);
		expect(movRepo.registrar).toHaveBeenCalledTimes(1);
		expect(outbox.publish).toHaveBeenCalledTimes(1);

		const auto = await new ObtenerAutonomiaAlimentoUseCase(autonomiaQuery).run(
			actor,
		);
		expect(auto[0]?.enAlerta).toBeTrue();
	});
});

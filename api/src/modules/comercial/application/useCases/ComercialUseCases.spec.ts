import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { DocumentStorageService } from "@/core/shared/domain/services/DocumentStorageService";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoDetalleQuery } from "@/modules/ganado/application/queries/GanadoDetalleQuery";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { Ganado } from "@/modules/ganado/domain/Ganado";
import { MotivoBaja } from "@/modules/ganado/domain/MotivoBaja";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import type { MotivoBajaRepository } from "@/modules/ganado/domain/repository/MotivoBajaRepository";
import type { RazaRepository } from "@/modules/raza/domain/repository/RazaRepository";
import { Gasto } from "../../domain/Gasto";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import { Transaccion } from "../../domain/Transaccion";
import { TransaccionGanado } from "../../domain/TransaccionGanado";
import { ComercialMapper } from "../mappers/ComercialMapper";
import type { RentabilidadQuery } from "../queries/RentabilidadQuery";
import type { ComercialAccessService } from "../services/ComercialAccessService";
import { ExportarTransaccionPdfUseCase } from "./ExportarTransaccionPdfUseCase";
import { ObtenerRentabilidadGanadoUseCase } from "./ObtenerRentabilidadGanadoUseCase";
import { ObtenerRentabilidadUseCase } from "./ObtenerRentabilidadUseCase";
import { RegistrarCompraGanadoUseCase } from "./RegistrarCompraGanadoUseCase";
import { RegistrarGastoUseCase } from "./RegistrarGastoUseCase";
import { RegistrarVentaGanadoUseCase } from "./RegistrarVentaGanadoUseCase";

describe("Casos de uso de Comercial y Costos", () => {
	const actor: Actor = { id: 1, role: "USER" };
	const txRunner: TransactionRunner = {
		run: async <T>(fn: () => Promise<T>) => fn(),
	};

	let ganadoActivo: Ganado;
	let trRepo: TransaccionRepository;
	let gastoRepo: GastoRepository;
	let ganadoRepo: GanadoRepository;
	let motivoBajaRepo: MotivoBajaRepository;
	let ganadoAccess: GanadoAccessService;
	let ganadoDetalleQuery: GanadoDetalleQuery;
	let docStorage: DocumentStorageService;

	beforeEach(() => {
		ganadoActivo = Ganado.reconstitute(
			50,
			"ARE-50",
			480,
			new Date("2023-05-01"),
			"MACHO",
			null,
			1,
			2,
			1,
			null,
			null,
			null,
			null,
		);

		trRepo = {
			save: mock(async (tr: Transaccion) =>
				Transaccion.reconstitute({
					id: 11,
					tipo: tr.getTipo(),
					fecha: tr.getFecha(),
					contraparte: tr.getContraparte(),
					total: tr.getTotal(),
					moneda: tr.getMoneda(),
					documento: tr.getDocumento(),
					documentoAdjunto: tr.getDocumentoAdjunto(),
					observaciones: tr.getObservaciones(),
					usuarioId: tr.getUsuarioId(),
					detalles: tr.getDetalles(),
				}),
			),
			findById: mock(async () => null),
			findAll: mock(async () => ({
				data: [],
				page: 1,
				totalItems: 0,
				totalPages: 0,
			})),
			delete: mock(async () => {}),
		};

		gastoRepo = {
			save: mock(async (g: Gasto) =>
				Gasto.reconstitute({
					id: 21,
					categoria: g.getCategoria(),
					concepto: g.getConcepto(),
					monto: g.getMonto(),
					fecha: g.getFecha(),
					terrenoId: g.getTerrenoId(),
					ganadoId: g.getGanadoId(),
					loteId: g.getLoteId(),
					observaciones: g.getObservaciones(),
					usuarioId: g.getUsuarioId(),
				}),
			),
			findById: mock(async () => null),
			findAll: mock(async () => ({
				data: [],
				page: 1,
				totalItems: 0,
				totalPages: 0,
			})),
			delete: mock(async () => {}),
		};

		ganadoRepo = {
			findByIdentificador: mock(async () => null),
			save: mock(async (g: Ganado) =>
				g.esNuevo()
					? Ganado.reconstitute(
							51,
							g.getIdentificador(),
							g.getPeso(),
							g.getFechaNacimiento(),
							g.getSexo(),
							null,
							g.getRazaId(),
							g.getTerrenoId(),
							g.getPropietarioId(),
							null,
							null,
							null,
							null,
							g.getProcedencia(),
						)
					: g,
			),
		} as unknown as GanadoRepository;

		motivoBajaRepo = {
			findAll: mock(async () => [MotivoBaja.reconstitute(3, "VENTA", "Venta")]),
		} as unknown as MotivoBajaRepository;

		ganadoAccess = {
			obtenerGanado: mock(async () => ganadoActivo),
			obtenerTerreno: mock(async () => ({})),
			obtenerPropietario: mock(async () => ({})),
		} as unknown as GanadoAccessService;

		ganadoDetalleQuery = {
			obtenerRetiroVigente: mock(async () => ({ vigente: false })),
		} as unknown as GanadoDetalleQuery;

		docStorage = {
			upload: mock(async () => "/uploads/comercial/guia.pdf"),
			delete: mock(async () => {}),
		} as unknown as DocumentStorageService;
	});

	it("bloquea la venta cuando el animal tiene período de retiro vigente", async () => {
		(
			ganadoDetalleQuery.obtenerRetiroVigente as ReturnType<typeof mock>
		).mockResolvedValueOnce({
			vigente: true,
			hasta: new Date("2026-12-01"),
			motivo: "Ivermectina",
		});

		const uc = new RegistrarVentaGanadoUseCase(
			trRepo,
			ganadoRepo,
			motivoBajaRepo,
			ganadoAccess,
			ganadoDetalleQuery,
			txRunner,
			new ComercialMapper(),
			docStorage,
		);

		await expect(
			uc.run(
				{
					fecha: "2026-11-18",
					contraparte: "Engorda Norte",
					items: [{ ganadoId: 50, precio: 25000 }],
				},
				actor,
			),
		).rejects.toThrow(ValidationError);
	});

	it("vende atómicamente dando de baja al animal con motivo VENTA y registra compra con procedencia", async () => {
		const ventaUc = new RegistrarVentaGanadoUseCase(
			trRepo,
			ganadoRepo,
			motivoBajaRepo,
			ganadoAccess,
			ganadoDetalleQuery,
			txRunner,
			new ComercialMapper(),
			docStorage,
		);
		const venta = await ventaUc.run(
			{
				fecha: "2026-11-18",
				contraparte: "Carnes del Valle",
				items: [{ ganadoId: 50, precio: 28000 }],
			},
			actor,
		);
		expect(venta.total).toBe(28000);
		expect(ganadoActivo.getMotivoBajaId()).toBe(3);

		const compraUc = new RegistrarCompraGanadoUseCase(
			trRepo,
			ganadoRepo,
			{ findById: mock(async () => ({ id: 1 })) } as unknown as RazaRepository,
			ganadoAccess,
			txRunner,
			new ComercialMapper(),
			docStorage,
		);
		const compra = await compraUc.run(
			{
				fecha: "2026-11-18",
				contraparte: "Rancho San José",
				items: [
					{
						identificador: "NEW-51",
						peso: 210,
						fechaNacimiento: "2025-05-01",
						sexo: "HEMBRA",
						razaId: 1,
						terrenoId: 2,
						propietarioId: 1,
						precio: 14500,
						procedencia: "Feria Ganadera",
					},
				],
			},
			actor,
		);
		expect(compra.total).toBe(14500);
		expect(compra.detalles[0]?.procedencia).toBe("Feria Ganadera");
	});

	it("exporta PDF de comprobante comercial, registra gasto y consulta rentabilidad", async () => {
		const tr = Transaccion.reconstitute({
			id: 11,
			tipo: "VENTA",
			fecha: new Date("2026-11-18"),
			contraparte: "Comprador SA",
			total: 30000,
			moneda: "MXN",
			documento: "GUIA-001",
			documentoAdjunto: null,
			observaciones: "Todo en orden",
			usuarioId: 1,
			detalles: [
				TransaccionGanado.create({
					ganadoId: 50,
					precio: 30000,
					pesoRegistro: 490,
					ganadoIdentificador: "ARE-50",
				}),
			],
		});
		const access = {
			obtenerTransaccion: mock(async () => tr),
			validarReferenciasGasto: mock(async () => {}),
		} as unknown as ComercialAccessService;

		const pdfBytes = await new ExportarTransaccionPdfUseCase(access).run(
			11,
			actor,
		);
		expect(new TextDecoder().decode(pdfBytes.slice(0, 5))).toBe("%PDF-");

		const gasto = await new RegistrarGastoUseCase(
			gastoRepo,
			access,
			new ComercialMapper(),
		).run(
			{
				categoria: "MANO_OBRA",
				concepto: "Jornal manejo",
				monto: 1200,
				fecha: "2026-11-18",
				terrenoId: 2,
			},
			actor,
		);
		expect(gasto.id).toBe(21);

		const rentabilidadQuery: RentabilidadQuery = {
			obtenerRentabilidad: mock(async () => ({
				resumen: {
					ingresosVenta: 30000,
					costoCompra: 14500,
					gastosOperativos: 1200,
					costoInsumos: 700,
					costoTotal: 16400,
					gananciaNeta: 13600,
					margenPorcentaje: 45.33,
				},
				porAnimal: [],
				porTerreno: [],
				porPeriodo: [],
			})),
			obtenerRentabilidadPorGanado: mock(async () => ({
				ganadoId: 50,
				identificador: "ARE-50",
				ingresosVenta: 30000,
				costoCompra: 14500,
				costoInsumosAplicados: 700,
				gastosDirectos: 0,
				costoTotal: 15200,
				gananciaNeta: 14800,
				margenPorcentaje: 49.33,
			})),
		};

		const rep = await new ObtenerRentabilidadUseCase(rentabilidadQuery).run(
			{},
			actor,
		);
		expect(rep.resumen.gananciaNeta).toBe(13600);
		const animalRep = await new ObtenerRentabilidadGanadoUseCase(
			ganadoAccess,
			rentabilidadQuery,
		).run(50, actor);
		expect(animalRep.gananciaNeta).toBe(14800);
	});
});

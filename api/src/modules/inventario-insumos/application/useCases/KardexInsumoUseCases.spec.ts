import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { InsumoStockInsuficienteError } from "../../domain/error/InsumoStockInsuficienteError";
import { Insumo } from "../../domain/Insumo";
import { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import { InsumoMapper } from "../mappers/InsumoMapper";
import { MovimientoInsumoMapper } from "../mappers/MovimientoInsumoMapper";
import { AbastecerInsumoUseCase } from "./AbastecerInsumoUseCase";
import { AjustarStockInsumoUseCase } from "./AjustarStockInsumoUseCase";
import { ConsumirInsumoUseCase } from "./ConsumirInsumoUseCase";
import { ListarKardexInsumoUseCase } from "./ListarKardexInsumoUseCase";

describe("Kardex de Insumo (Abastecer, Consumir, Ajustar, Listar)", () => {
	let stockActual: number;
	let costoActual: number;
	const registrados: MovimientoInsumo[] = [];
	let insumoRepo: InsumoRepository;
	let movimientoRepo: MovimientoInsumoRepository;
	const txRunner: TransactionRunner = {
		run: async <T>(fn: () => Promise<T>) => fn(),
	};

	const buildInsumo = () =>
		Insumo.reconstitute(
			10,
			"Maíz Molido",
			"ALIMENTO",
			stockActual,
			50,
			"kg",
			"LOT-MAIZ",
			new Date("2028-01-01"),
			1,
			0,
			costoActual,
		);

	beforeEach(() => {
		stockActual = 100;
		costoActual = 10;
		registrados.length = 0;

		insumoRepo = {
			findById: mock(async (id: number) => (id === 10 ? buildInsumo() : null)),
			findAll: mock(async () => ({
				data: [],
				page: 1,
				totalItems: 0,
				totalPages: 0,
			})),
			findCriticos: mock(async () => []),
			save: mock(async (i: Insumo) => i),
			adicionarStock: mock(async (_id: number, cantidad: number) => {
				stockActual += cantidad;
				return buildInsumo();
			}),
			descontarStock: mock(async (_id: number, cantidad: number) => {
				if (stockActual < cantidad) return null;
				stockActual -= cantidad;
				return buildInsumo();
			}),
			ajustarStock: mock(async (_id: number, delta: number) => {
				if (stockActual + delta < 0) return null;
				stockActual += delta;
				return buildInsumo();
			}),
			actualizarCostoUnitario: mock(async (_id: number, costo: number) => {
				costoActual = costo;
				return buildInsumo();
			}),
			delete: mock(async () => {}),
		};

		movimientoRepo = {
			registrar: mock(async (mov: MovimientoInsumo) => {
				const saved = MovimientoInsumo.reconstitute({
					id: registrados.length + 1,
					insumoId: mov.getInsumoId(),
					tipo: mov.getTipo(),
					cantidad: mov.getCantidad(),
					delta: mov.getDelta(),
					costoUnitario: mov.getCostoUnitario(),
					motivo: mov.getMotivo(),
					referenciaTipo: mov.getReferenciaTipo(),
					referenciaId: mov.getReferenciaId(),
					ganadoId: mov.getGanadoId(),
					terrenoId: mov.getTerrenoId(),
					loteId: mov.getLoteId(),
					usuarioId: mov.getUsuarioId(),
					fecha: mov.getFecha(),
				});
				registrados.push(saved);
				return saved;
			}),
			registrarMuchos: mock(async () => {}),
			findByInsumo: mock(async () => ({
				data: [...registrados],
				page: 1,
				totalItems: registrados.length,
				totalPages: 1,
			})),
			sumDeltaByInsumo: mock(async () =>
				registrados.reduce((acc, m) => acc + m.getDelta(), 0),
			),
		};
	});

	it("calcula el costo unitario promedio ponderado y registra ENTRADA al abastecer", async () => {
		const uc = new AbastecerInsumoUseCase(
			insumoRepo,
			new InsumoMapper(),
			movimientoRepo,
			txRunner,
		);
		// 100 kg @ 10 + 100 kg @ 20 = promedio 15
		const res = await uc.run(
			10,
			{ cantidad: 100, costoUnitario: 20, motivo: "Compra mensual" },
			1,
			"USER",
		);
		expect(res.stock).toBe(200);
		expect(res.costoUnitario).toBe(15);
		expect(registrados).toHaveLength(1);
		expect(registrados[0]?.getTipo()).toBe("ENTRADA");
		expect(registrados[0]?.getDelta()).toBe(100);
	});

	it("registra SALIDA con delta negativo al consumir", async () => {
		const uc = new ConsumirInsumoUseCase(
			insumoRepo,
			new InsumoMapper(),
			undefined,
			movimientoRepo,
			txRunner,
		);
		const res = await uc.run(
			10,
			{ cantidad: 25, motivo: "Uso diario" },
			1,
			"USER",
		);
		expect(res.stock).toBe(75);
		expect(registrados[0]?.getTipo()).toBe("SALIDA");
		expect(registrados[0]?.getDelta()).toBe(-25);
	});

	it("ajusta stock positivo/negativo y rechaza cero o dejar stock negativo", async () => {
		const uc = new AjustarStockInsumoUseCase(
			insumoRepo,
			movimientoRepo,
			txRunner,
			new InsumoMapper(),
		);
		await expect(
			uc.run(10, { cantidadDelta: 0, motivo: "Nulo" }, { id: 1, role: "USER" }),
		).rejects.toThrow(ValidationError);
		await expect(
			uc.run(
				10,
				{ cantidadDelta: -150, motivo: "Merma" },
				{ id: 1, role: "USER" },
			),
		).rejects.toThrow(InsumoStockInsuficienteError);

		const ajustado = await uc.run(
			10,
			{ cantidadDelta: -10, motivo: "Conteo físico" },
			{ id: 1, role: "USER" },
		);
		expect(ajustado.stock).toBe(90);
		expect(registrados[0]?.getTipo()).toBe("AJUSTE");
		expect(registrados[0]?.getDelta()).toBe(-10);
	});

	it("lista kardex con stockActual y sumaKardex verificada", async () => {
		registrados.push(
			MovimientoInsumo.reconstitute({
				id: 1,
				insumoId: 10,
				tipo: "ENTRADA",
				cantidad: 100,
				delta: 100,
				costoUnitario: 10,
				motivo: "Inicial",
				referenciaTipo: "MANUAL",
				referenciaId: null,
				ganadoId: null,
				terrenoId: null,
				loteId: null,
				usuarioId: 1,
				fecha: new Date(),
			}),
		);
		const uc = new ListarKardexInsumoUseCase(
			insumoRepo,
			movimientoRepo,
			new MovimientoInsumoMapper(),
		);
		const res = await uc.run(
			10,
			{ page: 1, limit: 20 },
			{ id: 1, role: "USER" },
		);
		expect(res.stockActual).toBe(100);
		expect(res.sumaKardex).toBe(100);
		expect(res.consistente).toBeTrue();
		expect(res.movimientos.data).toHaveLength(1);
	});
});

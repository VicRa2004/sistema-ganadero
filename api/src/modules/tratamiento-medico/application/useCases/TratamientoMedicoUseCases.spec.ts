import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Actor } from "@/core/shared/domain/Actor";
import { GanadoNotFoundError } from "@/modules/ganado/domain/error/GanadoNotFoundError";
import { InsumoNotFoundError } from "@/modules/inventario-insumos/domain/error/InsumoNotFoundError";
import { VeterinarioNotFoundError } from "@/modules/veterinario/domain/error/VeterinarioNotFoundError";
import { InsuficienteStockInsumoError } from "../../domain/error/InsuficienteStockInsumoError";
import { TratamientoMedicoNotFoundError } from "../../domain/error/TratamientoMedicoNotFoundError";
import { TratamientoMedico } from "../../domain/TratamientoMedico";
import { TratamientoMedicoMapper } from "../mappers/TratamientoMedicoMapper";
import { TratamientoAccessService } from "../services/TratamientoAccessService";
import { ActualizarTratamientoUseCase } from "./ActualizarTratamientoUseCase";
import { EliminarTratamientoUseCase } from "./EliminarTratamientoUseCase";
import { FinalizarTratamientoUseCase } from "./FinalizarTratamientoUseCase";
import { ListarTratamientosPorGanadoUseCase } from "./ListarTratamientosPorGanadoUseCase";
import { ListarTratamientosUseCase } from "./ListarTratamientosUseCase";
import { ObtenerTratamientoUseCase } from "./ObtenerTratamientoUseCase";
import { RecetarTratamientoUseCase } from "./RecetarTratamientoUseCase";
import { RegistrarAplicacionDiariaUseCase } from "./RegistrarAplicacionDiariaUseCase";

const userActor: Actor = { id: 1, role: "USER" };
const adminActor: Actor = { id: 99, role: "ADMIN" };

const fechaInicio = new Date("2026-05-01T00:00:00.000Z");
const fechaFin = new Date("2026-05-10T23:59:59.000Z");

const crearTratamiento = (activo = true) =>
	TratamientoMedico.reconstitute(
		100,
		10,
		"Infección bacteriana",
		fechaInicio,
		fechaFin,
		activo,
		5,
		10,
		2,
		{
			ganadoIdentificador: "BOV-010",
			insumoNombre: "Oxitetraciclina",
			insumoUnidad: "ml",
			veterinarioNombre: "Dr. Morales",
		},
	);

const crearInsumoMock = (stock: number, usuarioId = 1) => ({
	getId: () => 5,
	getStock: () => stock,
	getNombre: () => "Oxitetraciclina",
	getUnidadMedida: () => "ml",
	getUsuarioId: () => usuarioId,
});

const crearVeterinarioMock = (usuarioId = 1) => ({
	getId: () => 2,
	getNombre: () => "Dr. Morales",
	getUsuarioId: () => usuarioId,
});

const crearGanadoMock = () => ({
	getId: () => 10,
	getIdentificador: () => "BOV-010",
});

describe("TratamientoMedico Application Layer & Use Cases", () => {
	const tratamientoRepository = {
		save: mock(async (t: TratamientoMedico) =>
			t.esNuevo()
				? TratamientoMedico.reconstitute(
						100,
						t.getGanadoId(),
						t.getDiagnostico(),
						t.getFechaInicio(),
						t.getFechaFin(),
						t.esActivo(),
						t.getInsumoId(),
						t.getDosisDiaria(),
						t.getVeterinarioId(),
					)
				: t,
		),
		findById: mock(),
		find: mock(),
		findByGanadoId: mock(),
		delete: mock(async () => {}),
	};

	const insumoRepository = {
		findById: mock(),
		descontarStock: mock(),
	};

	const veterinarioRepository = {
		findById: mock(),
	};

	const ganadoAccessService = {
		obtenerGanado: mock(),
	};

	const transactionRunner = {
		run: mock(async <T>(fn: () => Promise<T>) => fn()),
	};

	const mapper = new TratamientoMedicoMapper();
	const accessService = new TratamientoAccessService(
		tratamientoRepository as never,
		ganadoAccessService as never,
		insumoRepository as never,
		veterinarioRepository as never,
	);

	beforeEach(() => {
		tratamientoRepository.save.mockClear();
		tratamientoRepository.findById.mockReset();
		tratamientoRepository.find.mockReset();
		tratamientoRepository.findByGanadoId.mockReset();
		tratamientoRepository.delete.mockClear();
		insumoRepository.findById.mockReset();
		insumoRepository.descontarStock.mockReset();
		veterinarioRepository.findById.mockReset();
		ganadoAccessService.obtenerGanado.mockReset();
		transactionRunner.run.mockClear();
	});

	describe("TratamientoAccessService (Aislamiento por usuario)", () => {
		it("convierte GanadoNotFoundError en TratamientoMedicoNotFoundError (404) cuando el animal es de otro usuario", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento());
			ganadoAccessService.obtenerGanado.mockRejectedValue(
				new GanadoNotFoundError(10),
			);

			await expect(
				accessService.obtenerTratamiento(100, userActor),
			).rejects.toBeInstanceOf(TratamientoMedicoNotFoundError);
		});

		it("rechaza con 404 si el insumo o veterinario pertenece a otro usuario", async () => {
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(50, 2));
			veterinarioRepository.findById.mockResolvedValue(crearVeterinarioMock(2));

			await expect(
				accessService.obtenerInsumo(5, userActor),
			).rejects.toBeInstanceOf(InsumoNotFoundError);

			await expect(
				accessService.obtenerVeterinario(2, userActor),
			).rejects.toBeInstanceOf(VeterinarioNotFoundError);

			// ADMIN sí puede acceder
			await expect(
				accessService.obtenerInsumo(5, adminActor),
			).resolves.toBeDefined();
		});
	});

	describe("RecetarTratamientoUseCase", () => {
		const useCase = new RecetarTratamientoUseCase(
			tratamientoRepository as never,
			ganadoAccessService as never,
			accessService,
			mapper,
		);

		it("receta y guarda un tratamiento médico verificando acceso a ganado, insumo y veterinario", async () => {
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(100));
			veterinarioRepository.findById.mockResolvedValue(crearVeterinarioMock());

			const result = await useCase.run(
				{
					ganadoId: 10,
					diagnostico: "Neumonía",
					fechaInicio: fechaInicio.toISOString(),
					fechaFin: fechaFin.toISOString(),
					insumoId: 5,
					dosisDiaria: 10,
					veterinarioId: 2,
				},
				userActor,
			);

			expect(tratamientoRepository.save).toHaveBeenCalledTimes(1);
			expect(result.id).toBe(100);
			expect(result.ganadoIdentificador).toBe("BOV-010");
			expect(result.insumoNombre).toBe("Oxitetraciclina");
			expect(result.insumoUnidad).toBe("ml");
			expect(result.veterinarioNombre).toBe("Dr. Morales");
			expect(result.activo).toBe(true);
		});
	});

	describe("RegistrarAplicacionDiariaUseCase", () => {
		const useCase = new RegistrarAplicacionDiariaUseCase(
			tratamientoRepository as never,
			insumoRepository as never,
			transactionRunner as never,
			accessService,
			mapper,
		);

		it("descuenta la dosis diaria por defecto y guarda el tratamiento dentro de una transacción", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(50));
			insumoRepository.descontarStock.mockResolvedValue(crearInsumoMock(40));

			const result = await useCase.run(
				{ tratamientoId: 100, observaciones: "Aplicación matutina" },
				userActor,
			);

			expect(transactionRunner.run).toHaveBeenCalledTimes(1);
			expect(insumoRepository.descontarStock).toHaveBeenCalledWith(5, 10);
			expect(tratamientoRepository.save).toHaveBeenCalledTimes(1);
			expect(result.id).toBe(100);
		});

		it("descuenta cantidadDosis personalizada cuando se especifica en el DTO", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(50));
			insumoRepository.descontarStock.mockResolvedValue(crearInsumoMock(35));

			await useCase.run({ tratamientoId: 100, cantidadDosis: 15 }, userActor);

			expect(insumoRepository.descontarStock).toHaveBeenCalledWith(5, 15);
		});

		it("rechaza con 400 si el tratamiento ya está finalizado", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(false));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());

			await expect(
				useCase.run({ tratamientoId: 100 }, userActor),
			).rejects.toMatchObject({ code: 400 });

			expect(insumoRepository.descontarStock).not.toHaveBeenCalled();
			expect(tratamientoRepository.save).not.toHaveBeenCalled();
		});

		it("rechaza antes de abrir transacción si el stock actual es insuficiente", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(4));

			await expect(
				useCase.run({ tratamientoId: 100 }, userActor),
			).rejects.toBeInstanceOf(InsuficienteStockInsumoError);

			expect(insumoRepository.descontarStock).not.toHaveBeenCalled();
			expect(tratamientoRepository.save).not.toHaveBeenCalled();
		});

		it("aborta el guardado si otro proceso consumió el stock en condición de carrera (descontarStock retorna null)", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById
				.mockResolvedValueOnce(crearInsumoMock(50))
				.mockResolvedValueOnce(crearInsumoMock(3));
			insumoRepository.descontarStock.mockResolvedValue(null);

			await expect(
				useCase.run({ tratamientoId: 100 }, userActor),
			).rejects.toBeInstanceOf(InsuficienteStockInsumoError);

			expect(insumoRepository.descontarStock).toHaveBeenCalledWith(5, 10);
			expect(tratamientoRepository.save).not.toHaveBeenCalled();
		});
	});

	describe("FinalizarTratamientoUseCase", () => {
		const useCase = new FinalizarTratamientoUseCase(
			tratamientoRepository as never,
			accessService,
			mapper,
		);

		it("marca el tratamiento como inactivo y lo persiste", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());

			const result = await useCase.run(100, userActor);

			expect(result.activo).toBe(false);
			expect(tratamientoRepository.save).toHaveBeenCalledTimes(1);
		});
	});

	describe("ActualizarTratamientoUseCase", () => {
		const useCase = new ActualizarTratamientoUseCase(
			tratamientoRepository as never,
			accessService,
			mapper,
		);

		it("actualiza el tratamiento validando permisos sobre el insumo y veterinario", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			insumoRepository.findById.mockResolvedValue(crearInsumoMock(100));
			veterinarioRepository.findById.mockResolvedValue(crearVeterinarioMock());

			const result = await useCase.run(
				100,
				{
					diagnostico: "Infección controlada",
					dosisDiaria: 8,
				},
				userActor,
			);

			expect(result.diagnostico).toBe("Infección controlada");
			expect(result.dosisDiaria).toBe(8);
			expect(tratamientoRepository.save).toHaveBeenCalledTimes(1);
		});
	});

	describe("ObtenerTratamientoUseCase, ListarTratamientosUseCase, ListarTratamientosPorGanadoUseCase & EliminarTratamientoUseCase", () => {
		const obtenerUseCase = new ObtenerTratamientoUseCase(accessService, mapper);
		const listarUseCase = new ListarTratamientosUseCase(
			tratamientoRepository as never,
			mapper,
		);
		const listarPorGanadoUseCase = new ListarTratamientosPorGanadoUseCase(
			tratamientoRepository as never,
			ganadoAccessService as never,
			mapper,
		);
		const eliminarUseCase = new EliminarTratamientoUseCase(
			tratamientoRepository as never,
			accessService,
		);

		it("obtiene el detalle de un tratamiento del usuario", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());

			const dto = await obtenerUseCase.run(100, userActor);
			expect(dto.id).toBe(100);
			expect(dto.ganadoIdentificador).toBe("BOV-010");
		});

		it("lista tratamientos filtrando por usuarioId para USER y sin filtro para ADMIN", async () => {
			tratamientoRepository.find.mockResolvedValue({
				data: [crearTratamiento(true)],
				page: 1,
				totalItems: 1,
				totalPages: 1,
			});

			const userResult = await listarUseCase.run(
				{ page: 1, limit: 10, activo: true },
				userActor,
			);
			expect(tratamientoRepository.find).toHaveBeenCalledWith({
				page: 1,
				limit: 10,
				activo: true,
				usuarioId: 1,
			});
			expect(userResult.data).toHaveLength(1);

			await listarUseCase.run({ page: 1, limit: 10 }, adminActor);
			expect(tratamientoRepository.find).toHaveBeenLastCalledWith({
				page: 1,
				limit: 10,
				usuarioId: undefined,
			});
		});

		it("lista tratamientos por ganado verificando propiedad del animal", async () => {
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());
			tratamientoRepository.findByGanadoId.mockResolvedValue([
				crearTratamiento(true),
			]);

			const list = await listarPorGanadoUseCase.run(10, userActor);
			expect(ganadoAccessService.obtenerGanado).toHaveBeenCalledWith(
				10,
				userActor,
			);
			expect(list).toHaveLength(1);
			expect(list[0]?.ganadoIdentificador).toBe("BOV-010");
		});

		it("elimina lógicamente un tratamiento tras verificar propiedad", async () => {
			tratamientoRepository.findById.mockResolvedValue(crearTratamiento(true));
			ganadoAccessService.obtenerGanado.mockResolvedValue(crearGanadoMock());

			await eliminarUseCase.run(100, userActor);
			expect(tratamientoRepository.delete).toHaveBeenCalledWith(100);
		});
	});
});

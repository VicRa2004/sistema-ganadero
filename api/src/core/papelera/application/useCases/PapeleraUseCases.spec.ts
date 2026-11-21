import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { ElementoPapelera } from "../../domain/repository/PapeleraRepository";
import {
	EliminarDefinitivoUseCase,
	PurgarPapeleraUseCase,
	RestaurarElementoUseCase,
} from "./PapeleraUseCases";

const elemento = (o: Partial<ElementoPapelera> = {}): ElementoPapelera => ({
	id: 1,
	nombre: "A-1",
	eliminadoEn: new Date(),
	usuarioId: 7,
	dependeDeEliminado: false,
	...o,
});

const repo = {
	listar: mock(),
	buscarEliminado: mock(
		async (): Promise<ElementoPapelera | null> => elemento(),
	),
	restaurar: mock(async () => {}),
	eliminarDefinitivo: mock(async () => {}),
	idsEliminadosAntesDe: mock(async (): Promise<number[]> => []),
};

describe("Papelera", () => {
	beforeEach(() => {
		for (const m of Object.values(repo)) m.mockClear();
	});

	it("restaura lo propio y responde 404 con lo ajeno", async () => {
		const useCase = new RestaurarElementoUseCase(repo);
		await useCase.run("ganado", 1, { id: 7, role: "USER" });
		expect(repo.restaurar).toHaveBeenCalledWith("ganado", 1);

		await expect(
			useCase.run("ganado", 1, { id: 8, role: "USER" }),
		).rejects.toMatchObject({ code: 404 });
		await useCase.run("ganado", 1, { id: 8, role: "ADMIN" });
		expect(repo.restaurar).toHaveBeenCalledTimes(2);
	});

	it("no restaura si depende de algo eliminado", async () => {
		repo.buscarEliminado.mockResolvedValueOnce(
			elemento({ dependeDeEliminado: true }),
		);
		await expect(
			new RestaurarElementoUseCase(repo).run("ganado", 1, {
				id: 7,
				role: "USER",
			}),
		).rejects.toMatchObject({ code: 409 });
		expect(repo.restaurar).not.toHaveBeenCalled();
	});

	it("no borra definitivamente lo que no está en la papelera", async () => {
		repo.buscarEliminado.mockResolvedValueOnce(null);
		await expect(
			new EliminarDefinitivoUseCase(repo).run("terreno", 1, {
				id: 7,
				role: "ADMIN",
			}),
		).rejects.toMatchObject({ code: 404 });
		expect(repo.eliminarDefinitivo).not.toHaveBeenCalled();
	});

	it("la purga sigue con el resto cuando un elemento está referenciado", async () => {
		repo.idsEliminadosAntesDe.mockImplementation(async (tipo: string) =>
			tipo === "ganado" ? [1, 2] : [],
		);
		repo.eliminarDefinitivo.mockImplementationOnce(async () => {
			throw new Error("FK");
		});

		const ahora = new Date("2026-03-01");
		const res = await new PurgarPapeleraUseCase(repo).run(ahora);

		expect(res).toEqual({ eliminados: 1, conservados: 1 });
		expect(repo.idsEliminadosAntesDe).toHaveBeenCalledWith(
			"ganado",
			new Date("2026-01-30"),
		);
	});
});

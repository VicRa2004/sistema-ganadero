import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import { useDarDeBajaGanado } from "./useDarDeBajaGanado";

describe("useDarDeBajaGanado invalidation", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("invalida queryKeys.ganado.lists() y detalle (no 'ganados') tras dar de baja", async () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		vi.spyOn(ganadoService, "darDeBaja").mockResolvedValue({
			id: 7,
			identificador: "AR-007",
		} as never);

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useDarDeBajaGanado(7), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({
				fechaBaja: "2026-11-18",
				motivoBajaId: 2,
			});
		});

		const calledKeys = invalidateSpy.mock.calls.map(
			(c) => (c[0] as { queryKey: readonly unknown[] }).queryKey,
		);
		expect(calledKeys).toContainEqual(queryKeys.ganado.lists());
		expect(calledKeys).toContainEqual(queryKeys.ganado.detail(7));
		expect(calledKeys).toContainEqual(queryKeys.ganado.detail("AR-007"));
		expect(calledKeys).not.toContainEqual(["ganados"]);
	});
});

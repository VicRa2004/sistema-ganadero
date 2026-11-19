import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../store/authStore";
import { usePermissions } from "./usePermissions";

const mockUseUserPermissions = vi.fn();

vi.mock("./useUserPermissions", () => ({
	useUserPermissions: () => mockUseUserPermissions(),
}));

describe("usePermissions", () => {
	beforeEach(() => {
		useAuthStore.getState().logout();
		mockUseUserPermissions.mockReset();
	});

	it("evalúa permisos en vivo para usuario ADMIN y detecta isAdmin", () => {
		useAuthStore.setState({
			user: {
				id: 1,
				name: "Admin",
				email: "admin@dev.com",
				role: "ADMIN",
				isActive: true,
			},
			permissions: ["users:read"],
		});
		mockUseUserPermissions.mockReturnValue({
			data: ["ganado:read", "comercial:create"],
			isLoading: false,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.isAdmin).toBe(true);
		expect(result.current.can("comercial", "create")).toBe(true);
		expect(result.current.can("users", "delete")).toBe(false);
		expect(
			result.current.canAny([
				["lotes", "read"],
				["ganado", "read"],
			]),
		).toBe(true);
	});

	it("cae al store cuando la query aún no responde y respeta revocaciones en vivo", () => {
		useAuthStore.setState({
			user: {
				id: 2,
				name: "Op",
				email: "user@dev.com",
				role: "USER",
				isActive: true,
			},
			permissions: ["ganado:read", "ganado:delete"],
		});
		mockUseUserPermissions.mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		const { result, rerender } = renderHook(() => usePermissions());
		expect(result.current.isAdmin).toBe(false);
		expect(result.current.can("ganado", "delete")).toBe(true);

		mockUseUserPermissions.mockReturnValue({
			data: ["ganado:read"],
			isLoading: false,
		});
		rerender();
		expect(result.current.can("ganado", "delete")).toBe(false);
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsuarioAccesoDialog } from "./UsuarioAccesoDialog";

const mockGuardarRoles = vi.fn();
const mockGuardarDirectos = vi.fn();

const MOCK_ROLES = [
	{ id: 1, name: "ADMIN", description: "Administrador" },
	{ id: 2, name: "USER", description: "Operador" },
];

const MOCK_PERMISOS = [
	{ id: 10, resource: "ganado", action: "read" },
	{ id: 11, resource: "comercial", action: "create" },
];

const MOCK_ACCESO = {
	userId: 4,
	roles: [{ id: 2, name: "USER" }],
	directPermissions: [{ permissionId: 10, granted: true }],
	effectivePermissions: [{ id: 10, resource: "ganado", action: "read" }],
};

vi.mock("@/modules/permiso/hooks/useListarRoles", () => ({
	useListarRoles: () => ({
		isLoading: false,
		data: MOCK_ROLES,
	}),
}));

vi.mock("@/modules/permiso/hooks/useListarPermisos", () => ({
	useListarPermisos: () => ({
		isLoading: false,
		data: MOCK_PERMISOS,
	}),
}));

vi.mock("@/modules/permiso/hooks/useUsuarioAcceso", () => ({
	useObtenerAccesoUsuario: () => ({
		isLoading: false,
		isError: false,
		data: MOCK_ACCESO,
	}),
	useAsignarRolesUsuario: () => ({
		mutate: mockGuardarRoles,
		isPending: false,
	}),
	useAsignarPermisosDirectosUsuario: () => ({
		mutate: mockGuardarDirectos,
		isPending: false,
	}),
}));

describe("UsuarioAccesoDialog", () => {
	beforeEach(() => {
		mockGuardarRoles.mockReset();
		mockGuardarDirectos.mockReset();
	});

	it("permite alternar roles y enviar excepciones directas", () => {
		render(
			<UsuarioAccesoDialog
				usuario={{
					id: 4,
					name: "Carlos",
					email: "carlos@test.com",
					role: "USER",
					isActive: true,
				}}
				onClose={vi.fn()}
			/>,
		);

		const adminCheckbox = screen.getByLabelText(/ADMIN/i);
		fireEvent.click(adminCheckbox);
		fireEvent.click(screen.getByRole("button", { name: /Guardar roles/i }));

		expect(mockGuardarRoles).toHaveBeenCalledWith([2, 1]);

		const selectComercial = screen.getByLabelText(
			"Permiso comercial:create",
		) as HTMLSelectElement;
		fireEvent.change(selectComercial, { target: { value: "denegar" } });
		fireEvent.click(
			screen.getByRole("button", { name: /Guardar excepciones/i }),
		);

		expect(mockGuardarDirectos).toHaveBeenCalledWith([
			{ permissionId: 10, granted: true },
			{ permissionId: 11, granted: false },
		]);
	});
});

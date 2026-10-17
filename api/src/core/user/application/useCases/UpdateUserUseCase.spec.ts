import { beforeEach, describe, expect, it, mock } from "bun:test";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { User } from "../../domain/User";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

const mockUserRepository = {
	findById: mock(),
	findByEmail: mock(),
	update: mock(async (user: User) => user),
};

const mockPasswordHasher = {
	hash: mock(async (plain: string) => `hash(${plain})`),
	compare: mock(),
};

const mockRefreshTokenRepository = {
	revokeAllByUserId: mock(async () => {}),
};

const crearUsuario = () =>
	User.reconstitute("John", "john@test.com", "hash-viejo", true, 1, "USER");

describe("UpdateUserUseCase", () => {
	let useCase: UpdateUserUseCase;

	beforeEach(() => {
		mockUserRepository.findById.mockReset();
		mockUserRepository.findByEmail.mockReset();
		mockUserRepository.update.mockClear();
		mockPasswordHasher.hash.mockClear();
		mockRefreshTokenRepository.revokeAllByUserId.mockClear();

		useCase = new UpdateUserUseCase(
			mockUserRepository as any,
			mockPasswordHasher as any,
			mockRefreshTokenRepository as any,
		);
	});

	it("aplica el nombre y persiste el usuario modificado", async () => {
		mockUserRepository.findById.mockResolvedValue(crearUsuario());

		const result = await useCase.run(1, { name: "John Updated" });

		const guardado = mockUserRepository.update.mock.calls[0]?.[0] as User;
		expect(guardado.getName()).toBe("John Updated");
		expect(result.name).toBe("John Updated");
		expect(mockRefreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
	});

	it("cambia el correo si no lo usa otro usuario", async () => {
		mockUserRepository.findById.mockResolvedValue(crearUsuario());
		mockUserRepository.findByEmail.mockResolvedValue(null);

		await useCase.run(1, { email: "nuevo@test.com" });

		const guardado = mockUserRepository.update.mock.calls[0]?.[0] as User;
		expect(guardado.getEmail()).toBe("nuevo@test.com");
	});

	it("rechaza un correo que pertenece a otro usuario", async () => {
		mockUserRepository.findById.mockResolvedValue(crearUsuario());
		mockUserRepository.findByEmail.mockResolvedValue(
			User.reconstitute("Otro", "otro@test.com", "h", true, 2, "USER"),
		);

		await expect(useCase.run(1, { email: "otro@test.com" })).rejects.toThrow(
			"ya existe",
		);
		expect(mockUserRepository.update).not.toHaveBeenCalled();
	});

	it("hashea la nueva contraseña y revoca las sesiones abiertas", async () => {
		mockUserRepository.findById.mockResolvedValue(crearUsuario());

		await useCase.run(1, { password: "NuevaClave#12345" });

		const guardado = mockUserRepository.update.mock.calls[0]?.[0] as User;
		expect(guardado.getPasswordHash()).toBe("hash(NuevaClave#12345)");
		expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
			1,
		);
	});

	it("al desactivar la cuenta revoca las sesiones; al activar no", async () => {
		mockUserRepository.findById.mockResolvedValue(crearUsuario());
		await useCase.run(1, { isActive: false });

		const desactivado = mockUserRepository.update.mock.calls[0]?.[0] as User;
		expect(desactivado.getIsActive()).toBe(false);
		expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledTimes(
			1,
		);

		mockRefreshTokenRepository.revokeAllByUserId.mockClear();
		mockUserRepository.findById.mockResolvedValue(
			User.reconstitute("John", "john@test.com", "h", false, 1, "USER"),
		);
		await useCase.run(1, { isActive: true });
		expect(mockRefreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
	});

	it("lanza UserNotFoundError si el usuario no existe", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(useCase.run(999, { name: "x" })).rejects.toThrow(
			UserNotFoundError,
		);
		expect(mockUserRepository.update).not.toHaveBeenCalled();
	});
});

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { User } from "@/core/user/domain/User";
import { LoginUseCase } from "./LoginUseCase";

const userRepository = { findByEmail: mock() };
const passwordHasher = { compare: mock() };
const tokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "refresh"),
	hashRefreshToken: mock(() => "hash"),
};
const refreshTokenRepo = { create: mock(async () => {}) };

const usuario = (isActive: boolean) =>
	User.reconstitute("Ana", "ana@test.com", "hash", isActive, 1, "USER");

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;

	beforeEach(() => {
		userRepository.findByEmail.mockReset();
		passwordHasher.compare.mockReset();
		refreshTokenRepo.create.mockClear();
		useCase = new LoginUseCase(
			userRepository as any,
			passwordHasher as any,
			tokenService as any,
			refreshTokenRepo as any,
		);
	});

	it("emite tokens con credenciales válidas", async () => {
		userRepository.findByEmail.mockResolvedValue(usuario(true));
		passwordHasher.compare.mockResolvedValue(true);

		const result = await useCase.run({ email: "ana@test.com", password: "x" });

		expect(result.accessToken).toBe("access");
		expect(refreshTokenRepo.create).toHaveBeenCalled();
	});

	it("rechaza a un usuario desactivado aunque la contraseña sea correcta", async () => {
		userRepository.findByEmail.mockResolvedValue(usuario(false));
		passwordHasher.compare.mockResolvedValue(true);

		await expect(
			useCase.run({ email: "ana@test.com", password: "x" }),
		).rejects.toMatchObject({ code: 401, message: "Credenciales inválidas" });
		expect(refreshTokenRepo.create).not.toHaveBeenCalled();
	});

	it("rechaza contraseña incorrecta y usuario inexistente con el mismo error", async () => {
		userRepository.findByEmail.mockResolvedValue(usuario(true));
		passwordHasher.compare.mockResolvedValue(false);
		await expect(
			useCase.run({ email: "ana@test.com", password: "mal" }),
		).rejects.toMatchObject({ code: 401, message: "Credenciales inválidas" });

		userRepository.findByEmail.mockResolvedValue(null);
		await expect(
			useCase.run({ email: "nadie@test.com", password: "x" }),
		).rejects.toMatchObject({ code: 401, message: "Credenciales inválidas" });
	});
});

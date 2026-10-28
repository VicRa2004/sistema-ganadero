import { beforeEach, describe, expect, it, mock } from "bun:test";
import { User } from "@/core/user/domain/User";
import { BcryptPasswordHasherService } from "@/core/user/infrastructure/service/BcryptPasswordHasherService";
import { IssueSessionService } from "../services/IssueSessionService";
import { LoginUseCase } from "./LoginUseCase";

const userRepository = { findByEmail: mock() };
const passwordHasher = { compare: mock() };
const tokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "refresh"),
	hashRefreshToken: mock(() => "hash"),
};
const refreshTokenRepo = { create: mock(async () => {}) };
const issueSession = new IssueSessionService(
	tokenService as any,
	refreshTokenRepo as any,
);

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
			issueSession,
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

	it("compara contra un hash ficticio cuando el usuario no existe, aunque la comparación 'acierte'", async () => {
		userRepository.findByEmail.mockResolvedValue(null);
		passwordHasher.compare.mockResolvedValue(true);

		await expect(
			useCase.run({ email: "nadie@test.com", password: "x" }),
		).rejects.toMatchObject({ code: 401 });

		expect(passwordHasher.compare).toHaveBeenCalledTimes(1);
		const hashUsado = passwordHasher.compare.mock.calls[0]?.[1] as string;
		expect(hashUsado).toStartWith("$2b$10$");
		expect(refreshTokenRepo.create).not.toHaveBeenCalled();
	});

	it("con el hasher real, un usuario inexistente tarda lo mismo que uno con contraseña errónea", async () => {
		const real = new LoginUseCase(
			userRepository as any,
			new BcryptPasswordHasherService(),
			issueSession,
		);
		const hashReal = await new BcryptPasswordHasherService().hash("otra");
		const medir = async (user: User | null) => {
			userRepository.findByEmail.mockResolvedValue(user);
			const inicio = performance.now();
			await expect(
				real.run({ email: "x@test.com", password: "incorrecta" }),
			).rejects.toMatchObject({ code: 401 });
			return performance.now() - inicio;
		};

		const sinUsuario = await medir(null);
		const conUsuario = await medir(
			User.reconstitute("Ana", "x@test.com", hashReal, true, 1, "USER"),
		);

		// bcrypt con costo 10 tarda decenas de ms; sin hash ficticio sería casi instantáneo
		expect(sinUsuario).toBeGreaterThan(20);
		expect(sinUsuario / conUsuario).toBeGreaterThan(0.4);
		expect(sinUsuario / conUsuario).toBeLessThan(2.5);
	});
});

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { User } from "@/core/user/domain/User";
import { IssueSessionService } from "../services/IssueSessionService";
import { RegisterUseCase } from "./RegisterUseCase";

const userRepository = { findByEmail: mock(), create: mock() };
const passwordHasher = { hash: mock(async () => "hash") };
const tokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "refresh"),
	hashRefreshToken: mock(() => "tokenHash"),
};
const refreshTokenRepo = { create: mock(async () => {}) };
const issueSession = new IssueSessionService(
	tokenService as any,
	refreshTokenRepo as any,
);

const dto = { name: "Ana", email: "ana@test.com", password: "secreto123" };

describe("RegisterUseCase", () => {
	let useCase: RegisterUseCase;

	beforeEach(() => {
		userRepository.findByEmail.mockReset();
		userRepository.create.mockReset();
		refreshTokenRepo.create.mockClear();
		useCase = new RegisterUseCase(
			userRepository as any,
			passwordHasher as any,
			issueSession,
		);
	});

	it("crea un USER, emite tokens y persiste solo el hash del refresh", async () => {
		userRepository.findByEmail.mockResolvedValue(null);
		userRepository.create.mockResolvedValue(
			User.reconstitute("Ana", "ana@test.com", "hash", true, 1, "USER"),
		);

		const result = await useCase.run(dto);

		expect(result.accessToken).toBe("access");
		expect(result.refreshToken).toBe("refresh");
		expect(result.user.email).toBe("ana@test.com");
		expect(refreshTokenRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({ tokenHash: "tokenHash", userId: 1 }),
		);
	});

	it("rechaza un correo ya registrado", async () => {
		userRepository.findByEmail.mockResolvedValue(
			User.reconstitute("Ana", "ana@test.com", "hash", true, 1, "USER"),
		);

		await expect(useCase.run(dto)).rejects.toMatchObject({ code: 400 });
		expect(userRepository.create).not.toHaveBeenCalled();
	});
});

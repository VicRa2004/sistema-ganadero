import { beforeEach, describe, expect, it, mock } from "bun:test";
import { User } from "@/core/user/domain/User";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase";

const tokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "nuevo-refresh"),
	hashRefreshToken: mock((t: string) => `hash(${t})`),
};
const refreshTokenRepo = {
	findValidByHash: mock(),
	revokeById: mock(async () => {}),
	revokeAllByUserId: mock(async () => {}),
	create: mock(async () => {}),
};
const userRepository = { findById: mock() };

const stored = { id: 10, userId: 1, expiresAt: new Date(Date.now() + 1000) };

describe("RefreshTokenUseCase", () => {
	let useCase: RefreshTokenUseCase;

	beforeEach(() => {
		refreshTokenRepo.findValidByHash.mockReset();
		refreshTokenRepo.revokeById.mockClear();
		refreshTokenRepo.revokeAllByUserId.mockClear();
		refreshTokenRepo.create.mockClear();
		userRepository.findById.mockReset();
		useCase = new RefreshTokenUseCase(
			tokenService as any,
			refreshTokenRepo as any,
			userRepository as any,
		);
	});

	it("rota el refresh token de un usuario activo", async () => {
		refreshTokenRepo.findValidByHash.mockResolvedValue(stored);
		userRepository.findById.mockResolvedValue(
			User.reconstitute("Ana", "ana@test.com", "h", true, 1, "USER"),
		);

		const result = await useCase.run("viejo");

		expect(result).toEqual({
			accessToken: "access",
			refreshToken: "nuevo-refresh",
		});
		expect(refreshTokenRepo.revokeById).toHaveBeenCalledWith(10);
		expect(refreshTokenRepo.create).toHaveBeenCalled();
	});

	it("rechaza a un usuario desactivado y revoca todas sus sesiones", async () => {
		refreshTokenRepo.findValidByHash.mockResolvedValue(stored);
		userRepository.findById.mockResolvedValue(
			User.reconstitute("Ana", "ana@test.com", "h", false, 1, "USER"),
		);

		await expect(useCase.run("viejo")).rejects.toMatchObject({ code: 401 });
		expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(1);
		expect(refreshTokenRepo.create).not.toHaveBeenCalled();
	});
});

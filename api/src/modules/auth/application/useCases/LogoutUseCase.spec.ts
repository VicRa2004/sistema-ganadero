import { beforeEach, describe, expect, it, mock } from "bun:test";
import { LogoutUseCase } from "./LogoutUseCase";

const tokenService = { hashRefreshToken: mock(() => "hash") };
const refreshTokenRepo = { findValidByHash: mock(), revokeById: mock() };

describe("LogoutUseCase", () => {
	let useCase: LogoutUseCase;

	beforeEach(() => {
		refreshTokenRepo.findValidByHash.mockReset();
		refreshTokenRepo.revokeById.mockReset();
		useCase = new LogoutUseCase(tokenService as any, refreshTokenRepo as any);
	});

	it("revoca el refresh token vigente", async () => {
		refreshTokenRepo.findValidByHash.mockResolvedValue({ id: 7 });

		await useCase.run("raw");

		expect(refreshTokenRepo.findValidByHash).toHaveBeenCalledWith("hash");
		expect(refreshTokenRepo.revokeById).toHaveBeenCalledWith(7);
	});

	it("rechaza un refresh token inválido o ya revocado", async () => {
		refreshTokenRepo.findValidByHash.mockResolvedValue(null);

		await expect(useCase.run("raw")).rejects.toMatchObject({ code: 400 });
		expect(refreshTokenRepo.revokeById).not.toHaveBeenCalled();
	});
});

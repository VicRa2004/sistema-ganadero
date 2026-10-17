import { beforeEach, describe, expect, it, mock } from "bun:test";
import { User } from "@/core/user/domain/User";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase";

const tokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "nuevo-refresh"),
	hashRefreshToken: mock((t: string) => `hash(${t})`),
};
const refreshTokenRepo = {
	findByHash: mock(),
	rotate: mock(),
	revokeAllByUserId: mock(async () => {}),
};
const userRepository = { findById: mock() };

const vigente = (revoked = false) => ({
	id: 10,
	userId: 1,
	expiresAt: new Date(Date.now() + 60_000),
	revoked,
});

const usuario = (isActive: boolean) =>
	User.reconstitute("Ana", "ana@test.com", "h", isActive, 1, "USER");

describe("RefreshTokenUseCase", () => {
	let useCase: RefreshTokenUseCase;

	beforeEach(() => {
		refreshTokenRepo.findByHash.mockReset();
		refreshTokenRepo.rotate.mockReset();
		refreshTokenRepo.revokeAllByUserId.mockClear();
		userRepository.findById.mockReset();
		useCase = new RefreshTokenUseCase(
			tokenService as any,
			refreshTokenRepo as any,
			userRepository as any,
		);
	});

	it("rota el refresh token de un usuario activo", async () => {
		refreshTokenRepo.findByHash.mockResolvedValue(vigente());
		userRepository.findById.mockResolvedValue(usuario(true));
		refreshTokenRepo.rotate.mockResolvedValue(true);

		const result = await useCase.run("viejo");

		expect(result).toEqual({
			accessToken: "access",
			refreshToken: "nuevo-refresh",
		});
		expect(refreshTokenRepo.rotate).toHaveBeenCalledWith(
			10,
			expect.objectContaining({ tokenHash: "hash(nuevo-refresh)", userId: 1 }),
		);
		expect(refreshTokenRepo.revokeAllByUserId).not.toHaveBeenCalled();
	});

	it("rechaza un token desconocido o expirado sin revocar sesiones", async () => {
		refreshTokenRepo.findByHash.mockResolvedValue(null);
		await expect(useCase.run("x")).rejects.toMatchObject({ code: 401 });

		refreshTokenRepo.findByHash.mockResolvedValue({
			...vigente(),
			expiresAt: new Date(Date.now() - 1000),
		});
		await expect(useCase.run("x")).rejects.toMatchObject({ code: 401 });

		expect(refreshTokenRepo.revokeAllByUserId).not.toHaveBeenCalled();
	});

	it("detecta el reuso de un token revocado y revoca todas las sesiones del usuario", async () => {
		refreshTokenRepo.findByHash.mockResolvedValue(vigente(true));

		await expect(useCase.run("robado")).rejects.toMatchObject({ code: 401 });

		expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(1);
		expect(refreshTokenRepo.rotate).not.toHaveBeenCalled();
	});

	it("trata como reuso la pérdida de la carrera de rotación concurrente", async () => {
		refreshTokenRepo.findByHash.mockResolvedValue(vigente());
		userRepository.findById.mockResolvedValue(usuario(true));
		refreshTokenRepo.rotate.mockResolvedValue(false);

		await expect(useCase.run("concurrente")).rejects.toMatchObject({
			code: 401,
		});

		expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(1);
	});

	it("rechaza a un usuario desactivado y revoca todas sus sesiones", async () => {
		refreshTokenRepo.findByHash.mockResolvedValue(vigente());
		userRepository.findById.mockResolvedValue(usuario(false));

		await expect(useCase.run("viejo")).rejects.toMatchObject({ code: 401 });

		expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(1);
		expect(refreshTokenRepo.rotate).not.toHaveBeenCalled();
	});
});

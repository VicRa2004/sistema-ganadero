import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ChangePasswordUseCase } from "./ChangePasswordUseCase";

const user = { getPasswordHash: () => "old", cambiarPasswordHash: mock() };
const userRepository = { findById: mock(), update: mock() };
const passwordHasher = { compare: mock(), hash: mock() };
const refreshTokenRepository = { revokeAllByUserId: mock() };

describe("ChangePasswordUseCase", () => {
	let useCase: ChangePasswordUseCase;

	beforeEach(() => {
		for (const m of [
			user.cambiarPasswordHash,
			userRepository.findById,
			userRepository.update,
			passwordHasher.compare,
			passwordHasher.hash,
			refreshTokenRepository.revokeAllByUserId,
		]) {
			m.mockReset();
		}
		userRepository.findById.mockResolvedValue(user);
		useCase = new ChangePasswordUseCase(
			userRepository as any,
			passwordHasher as any,
			refreshTokenRepository as any,
		);
	});

	it("cambia la contraseña y revoca las sesiones", async () => {
		passwordHasher.compare.mockResolvedValue(true);
		passwordHasher.hash.mockResolvedValue("nuevo-hash");

		await useCase.run(1, "actual", "nueva");

		expect(user.cambiarPasswordHash).toHaveBeenCalledWith("nuevo-hash");
		expect(userRepository.update).toHaveBeenCalledWith(user);
		expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(1);
	});

	it("rechaza si la contraseña actual no coincide", async () => {
		passwordHasher.compare.mockResolvedValue(false);

		await expect(useCase.run(1, "mala", "nueva")).rejects.toMatchObject({
			code: 400,
		});
		expect(userRepository.update).not.toHaveBeenCalled();
		expect(refreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
	});
});

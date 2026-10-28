import { injectable, inject } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { UserNotFoundError } from "@/core/user/domain/error/UserNotFoundError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { PasswordHasher } from "@/core/user/domain/service/PasswordHasher";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

@injectable()
export class ChangePasswordUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepository: RefreshTokenRepository,
	) {}

	/** Cambia la contraseña verificando la actual y revoca todas las sesiones abiertas. */
	async run(
		userId: number,
		currentPassword: string,
		newPassword: string,
	): Promise<void> {
		const user = await this.userRepository.findById(userId);
		if (!user) throw new UserNotFoundError();

		const coincide = await this.passwordHasher.compare(
			currentPassword,
			user.getPasswordHash(),
		);
		if (!coincide) {
			throw new BaseError("La contraseña actual es incorrecta", 400);
		}

		user.cambiarPasswordHash(await this.passwordHasher.hash(newPassword));
		await this.userRepository.update(user);
		await this.refreshTokenRepository.revokeAllByUserId(userId);
	}
}

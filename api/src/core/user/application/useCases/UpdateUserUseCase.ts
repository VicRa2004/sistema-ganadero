import { injectable, inject } from "tsyringe";
import type { UpdateUserDto } from "../dtos/UpdateUserDto";
import type { UserDto } from "../dtos/UserDto";
import type { UserRepository } from "../../domain/repository/UserRepository";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";
import type { RefreshTokenRepository } from "@/modules/auth/domain/repository/RefreshTokenRepository";
import { UserMapper } from "../mappers/UserMapper";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";

@injectable()
export class UpdateUserUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepository: RefreshTokenRepository,
	) {}

	async run(id: number, dto: UpdateUserDto): Promise<UserDto> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundError();
		}

		let debeRevocarSesiones = false;

		if (dto.name !== undefined) {
			user.cambiarNombre(dto.name);
		}

		if (
			dto.email !== undefined &&
			dto.email.toLowerCase() !== user.getEmail().toLowerCase()
		) {
			const existente = await this.userRepository.findByEmail(dto.email);
			if (existente && existente.getId() !== id) {
				throw new BaseError(
					"El usuario con este correo electrónico ya existe",
					400,
				);
			}
			user.cambiarEmail(dto.email);
		}

		if (dto.password !== undefined) {
			user.cambiarPasswordHash(await this.passwordHasher.hash(dto.password));
			debeRevocarSesiones = true;
		}

		if (dto.isActive !== undefined && dto.isActive !== user.getIsActive()) {
			if (dto.isActive) {
				user.activate();
			} else {
				user.deactivate();
				debeRevocarSesiones = true;
			}
		}

		const updatedUser = await this.userRepository.update(user);

		// Cambiar la contraseña o desactivar la cuenta invalida las sesiones abiertas
		if (debeRevocarSesiones) {
			await this.refreshTokenRepository.revokeAllByUserId(id);
		}

		return UserMapper.toDto(updatedUser);
	}
}

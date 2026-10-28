import { injectable, inject } from "tsyringe";
import type { RegisterDto } from "../dtos/RegisterDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { PasswordHasher } from "@/core/user/domain/service/PasswordHasher";
import { User } from "@/core/user/domain/User";
import type { IssueSessionService } from "../services/IssueSessionService";
import type { UserDto } from "@/core/user/application/dtos/UserDto";
import { UserMapper } from "@/core/user/application/mappers/UserMapper";

@injectable()
export class RegisterUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("IssueSessionService")
		private readonly issueSession: IssueSessionService,
	) {}

	async run(
		dto: RegisterDto,
	): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
		const existingUser = await this.userRepository.findByEmail(dto.email);

		if (existingUser) {
			throw new BaseError(
				"El usuario con este correo electrónico ya existe",
				400,
			);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);
		// Role comes as 'USER' by default in user create
		const user = User.create(dto.name, dto.email, passwordHash, "USER");

		const createdUser = await this.userRepository.create(user);

		const session = await this.issueSession.emitir(createdUser);

		return {
			...session,
			user: UserMapper.toDto(createdUser),
		};
	}
}

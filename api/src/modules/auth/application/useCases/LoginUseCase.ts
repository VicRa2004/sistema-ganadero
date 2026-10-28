import { injectable, inject } from "tsyringe";
import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { PasswordHasher } from "@/core/user/domain/service/PasswordHasher";
import type { IssueSessionService } from "../services/IssueSessionService";
import type { UserDto } from "@/core/user/application/dtos/UserDto";
import { UserMapper } from "@/core/user/application/mappers/UserMapper";

/**
 * Hash bcrypt de un valor aleatorio descartado. Se compara contra él cuando el usuario no
 * existe para que el tiempo de respuesta no delate qué correos están registrados.
 * Debe usar el mismo costo (10) que BcryptPasswordHasherService.
 */
const HASH_FICTICIO =
	"$2b$10$yRjEBn7/qYHqcemXatF7q.TtkTAh57qxqL7.h09R8a/wkkQxI6cw6";

@injectable()
export class LoginUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("IssueSessionService")
		private readonly issueSession: IssueSessionService,
	) {}

	async run(
		dto: LoginDto,
	): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
		const user = await this.userRepository.findByEmail(dto.email);

		// Siempre se ejecuta bcrypt, exista o no el usuario, para igualar los tiempos
		const isPasswordValid = await this.passwordHasher.compare(
			dto.password,
			user ? user.getPasswordHash() : HASH_FICTICIO,
		);

		// Misma respuesta que con credenciales erróneas para no revelar si el correo existe ni el estado de la cuenta
		if (!user || !isPasswordValid || !user.getIsActive()) {
			throw new BaseError("Credenciales inválidas", 401);
		}

		const session = await this.issueSession.emitir(user);

		return {
			...session,
			user: UserMapper.toDto(user),
		};
	}
}

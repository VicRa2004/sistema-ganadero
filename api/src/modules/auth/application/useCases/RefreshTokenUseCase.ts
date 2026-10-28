import { injectable, inject } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { IssueSessionService } from "../services/IssueSessionService";

const TOKEN_INVALIDO = "Refresh token inválido o expirado";

@injectable()
export class RefreshTokenUseCase {
	constructor(
		@inject("JwtService") private readonly tokenService: TokenService,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepo: RefreshTokenRepository,
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("IssueSessionService")
		private readonly issueSession: IssueSessionService,
	) {}

	/**
	 * Rota el refresh token: revoca el anterior y genera uno nuevo.
	 * También emite un nuevo access token.
	 *
	 * Implementa "Refresh Token Rotation" con detección de reuso: si alguien presenta
	 * un token ya revocado (o pierde la carrera contra otra petición con el mismo token),
	 * se asume robo y se revocan TODOS los tokens del usuario.
	 */
	async run(
		currentRefreshToken: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const tokenHash = this.tokenService.hashRefreshToken(currentRefreshToken);

		const storedToken = await this.refreshTokenRepo.findByHash(tokenHash);

		if (!storedToken || storedToken.expiresAt <= new Date()) {
			throw new BaseError(TOKEN_INVALIDO, 401);
		}

		// Token ya usado: posible robo, se cierran todas las sesiones del usuario
		if (storedToken.revoked) {
			await this.refreshTokenRepo.revokeAllByUserId(storedToken.userId);
			throw new BaseError(TOKEN_INVALIDO, 401);
		}

		// Verificar que el usuario exista y esté activo
		const user = await this.userRepository.findById(storedToken.userId);

		if (!user) {
			throw new BaseError("Usuario no encontrado", 401);
		}

		// Cuenta desactivada: se cierran todas sus sesiones
		if (!user.getIsActive()) {
			await this.refreshTokenRepo.revokeAllByUserId(user.getId());
			throw new BaseError(TOKEN_INVALIDO, 401);
		}

		// Rotación atómica: si otra petición ya consumió este token, se trata como reuso
		const session = await this.issueSession.rotar(user, storedToken.id);

		if (!session) {
			await this.refreshTokenRepo.revokeAllByUserId(storedToken.userId);
			throw new BaseError(TOKEN_INVALIDO, 401);
		}

		return session;
	}
}

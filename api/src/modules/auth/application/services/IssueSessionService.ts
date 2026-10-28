import { injectable, inject } from "tsyringe";
import type { User } from "@/core/user/domain/User";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

/** Duración del refresh token: 7 días */
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface IssuedSession {
	accessToken: string;
	refreshToken: string;
}

/**
 * Único punto donde se fija el payload del JWT y la duración del refresh token.
 * Lo usan login, registro y refresh.
 */
@injectable()
export class IssueSessionService {
	constructor(
		@inject("JwtService") private readonly tokenService: TokenService,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	/** Emite un access token (15 min) y un refresh token opaco persistido como hash. */
	async emitir(user: User): Promise<IssuedSession> {
		const { session, data } = this.crear(user);
		await this.refreshTokenRepo.create(data);
		return session;
	}

	/**
	 * Igual que `emitir`, pero rota de forma atómica el refresh token `tokenId`.
	 * Devuelve null si otra petición ya lo consumió (reuso).
	 */
	async rotar(user: User, tokenId: number): Promise<IssuedSession | null> {
		const { session, data } = this.crear(user);
		return (await this.refreshTokenRepo.rotate(tokenId, data)) ? session : null;
	}

	private crear(user: User) {
		const accessToken = this.tokenService.generateToken({
			id: user.getId(),
			email: user.getEmail(),
			role: user.getRole(),
		});
		const refreshToken = this.tokenService.generateRefreshToken();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
		return {
			session: { accessToken, refreshToken },
			data: {
				tokenHash: this.tokenService.hashRefreshToken(refreshToken),
				userId: user.getId(),
				expiresAt,
			},
		};
	}
}

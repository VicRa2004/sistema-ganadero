import jwt, { type SignOptions } from "jsonwebtoken";
import { injectable } from "tsyringe";
import { env } from "../../../../core/config/env";
import type { TokenService } from "../../domain/service/TokenService";
import crypto from "node:crypto";

const JWT_ALGORITHM = "HS256";

@injectable()
export class JwtService implements TokenService {
	private secret = env.JWT_SECRET;

	generateToken(
		payload: object,
		expiresIn: SignOptions["expiresIn"] = "15m",
	): string {
		return jwt.sign(payload, this.secret, {
			algorithm: JWT_ALGORITHM,
			expiresIn,
		});
	}

	verifyToken(token: string): object | string {
		// Se fija el algoritmo para impedir tokens firmados con otro (p. ej. "none")
		return jwt.verify(token, this.secret, { algorithms: [JWT_ALGORITHM] });
	}

	generateRefreshToken(): string {
		return crypto.randomBytes(48).toString("hex");
	}

	hashRefreshToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}

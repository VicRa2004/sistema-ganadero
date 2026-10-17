/**
 * Contrato de repositorio para la gestión de Refresh Tokens.
 * Define las operaciones de persistencia sin acoplarse a la infraestructura.
 */
export interface RefreshTokenRepository {
	/**
	 * Persiste un nuevo refresh token (hash) asociado a un usuario.
	 */
	create(data: {
		tokenHash: string;
		userId: number;
		expiresAt: Date;
	}): Promise<void>;

	/**
	 * Busca un refresh token activo (no revocado y no expirado) por su hash.
	 * @returns Los datos del token o null si no existe / está inválido.
	 */
	findValidByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; expiresAt: Date } | null>;

	/**
	 * Busca un refresh token por su hash sin filtrar por estado (activo, revocado o expirado).
	 * Permite detectar el reuso de un token ya revocado.
	 */
	findByHash(tokenHash: string): Promise<{
		id: number;
		userId: number;
		expiresAt: Date;
		revoked: boolean;
	} | null>;

	/**
	 * Rota un token de forma atómica: revoca el actual solo si sigue activo y crea el nuevo
	 * en la misma transacción.
	 * @returns false si el token ya estaba revocado (otra petición lo usó antes); en ese caso
	 * no se crea el nuevo.
	 */
	rotate(
		currentId: number,
		next: { tokenHash: string; userId: number; expiresAt: Date },
	): Promise<boolean>;

	/**
	 * Revoca un token específico por su ID.
	 */
	revokeById(id: number): Promise<void>;

	/**
	 * Revoca todos los refresh tokens de un usuario (logout global / compromiso de cuenta).
	 */
	revokeAllByUserId(userId: number): Promise<void>;

	/**
	 * Elimina los tokens expirados (limpieza periódica). Los revocados se conservan hasta
	 * que expiran para poder detectar su reuso.
	 */
	deleteExpired(): Promise<void>;
}

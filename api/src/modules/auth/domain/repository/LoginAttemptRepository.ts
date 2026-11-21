/** Contador de intentos de login fallidos y bloqueo temporal de la cuenta. */
export interface LoginAttemptRepository {
	/** Fecha hasta la que la cuenta está bloqueada, o null si no lo está. */
	obtenerBloqueo(userId: number): Promise<Date | null>;
	/**
	 * Suma un fallo; al llegar a `maxIntentos` bloquea la cuenta `minutosBloqueo`
	 * y reinicia el contador.
	 */
	registrarFallo(
		userId: number,
		maxIntentos: number,
		minutosBloqueo: number,
	): Promise<void>;
	reiniciar(userId: number): Promise<void>;
}

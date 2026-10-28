/** Debe coincidir con ALLOW_PUBLIC_REGISTER de la API; si no, el registro responde 403. */
export const ALLOW_PUBLIC_REGISTER =
	import.meta.env.VITE_ALLOW_PUBLIC_REGISTER === "true";

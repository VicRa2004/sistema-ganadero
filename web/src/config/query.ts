import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // Evita re-ejecutar queries al cambiar de pestaña
			retry: 1, // Reintentar fallos solo 1 vez
			staleTime: 1000 * 60 * 5, // Considerar los datos frescos por 5 minutos
		},
	},
});

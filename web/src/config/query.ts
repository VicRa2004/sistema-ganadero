import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils";

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: { successMessage?: string };
	}
}

export const queryClient = new QueryClient({
	// Toasts uniformes para toda mutación: éxito con meta.successMessage y error con el mensaje del backend
	mutationCache: new MutationCache({
		onSuccess: (_data, _vars, _ctx, mutation) => {
			const message = mutation.meta?.successMessage;
			if (message) toast.success(message);
		},
		onError: (error) => {
			toast.error(formatApiError(error));
		},
	}),
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // Evita re-ejecutar queries al cambiar de pestaña
			retry: 1, // Reintentar fallos solo 1 vez
			staleTime: 1000 * 60 * 5, // Considerar los datos frescos por 5 minutos
		},
	},
});

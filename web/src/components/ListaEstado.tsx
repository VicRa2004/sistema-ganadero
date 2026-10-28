import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface ListaEstadoProps {
	isLoading: boolean;
	isError: boolean;
}

/** Estados de carga (skeleton) y error comunes a todas las listas; el vacío lo resuelve cada tabla */
export function ListaEstado({ isLoading, isError }: ListaEstadoProps) {
	if (isLoading) {
		return (
			<output className="block space-y-3" aria-busy="true">
				{[0, 1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</output>
		);
	}

	if (isError) {
		return (
			<div
				role="alert"
				className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl"
			>
				<AlertCircle className="size-4 shrink-0" />
				No se pudieron cargar los datos. Verifica tu conexión e intenta de
				nuevo.
			</div>
		);
	}

	return null;
}

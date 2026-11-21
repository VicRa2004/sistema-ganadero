import { ArrowRight, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListarTraslados } from "@/modules/ganado/hooks/useListarTraslados";

export function HistorialTrasladosCard({ ganadoId }: { ganadoId: number }) {
	const { data, isLoading, isError } = useListarTraslados(ganadoId);

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Route className="size-4 text-primary" />
					Historial de traslados
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading && (
					<p className="text-sm text-muted-foreground">Cargando…</p>
				)}
				{isError && (
					<p className="text-sm text-destructive">
						No se pudo cargar el historial.
					</p>
				)}
				{data?.length === 0 && (
					<p className="text-sm text-muted-foreground">
						Sin traslados registrados.
					</p>
				)}
				{data && data.length > 0 && (
					<ol className="space-y-2">
						{data.map((t) => (
							<li
								key={t.id}
								className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
							>
								<time
									dateTime={t.fecha}
									className="w-full text-xs text-muted-foreground sm:w-36"
								>
									{new Date(t.fecha).toLocaleString()}
								</time>
								<span>{t.terrenoOrigen.nombre}</span>
								<ArrowRight
									className="size-3.5 text-muted-foreground"
									aria-label="hacia"
								/>
								<span className="font-medium">{t.terrenoDestino.nombre}</span>
							</li>
						))}
					</ol>
				)}
			</CardContent>
		</Card>
	);
}

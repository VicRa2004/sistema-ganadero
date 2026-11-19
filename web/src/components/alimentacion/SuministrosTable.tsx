import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useListarSuministros } from "@/modules/alimentacion/hooks/useAlimentacion";

export function SuministrosTable() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useListarSuministros({ page, limit: 10 });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
				<Loader2 className="size-4 animate-spin" />
				Cargando historial de suministros...
			</div>
		);
	}

	if (!data || data.data.length === 0) {
		return (
			<p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
				No hay suministros registrados todavía.
			</p>
		);
	}

	return (
		<div className="space-y-3 text-left">
			<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
				<table className="w-full text-sm text-left">
					<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
						<tr>
							<th className="px-4 py-3">Fecha</th>
							<th className="px-4 py-3">Ración</th>
							<th className="px-4 py-3">Insumo</th>
							<th className="px-4 py-3 text-right">Animales</th>
							<th className="px-4 py-3 text-right">Cantidad Total</th>
							<th className="px-4 py-3 text-right">Costo Estimado</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{data.data.map((s) => (
							<tr key={s.id} className="hover:bg-muted/20">
								<td className="px-4 py-3 whitespace-nowrap">
									{new Date(s.fecha).toLocaleDateString("es-MX")}
								</td>
								<td className="px-4 py-3 font-medium">{s.racionNombre}</td>
								<td className="px-4 py-3">{s.insumoNombre}</td>
								<td className="px-4 py-3 text-right tabular-nums">
									{s.cantidadAnimales}
								</td>
								<td className="px-4 py-3 text-right font-semibold tabular-nums">
									{s.cantidadTotal} {s.insumoUnidad}
								</td>
								<td className="px-4 py-3 text-right tabular-nums">
									${s.costoTotal.toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{data.totalPages > 1 && (
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						Página {data.page} de {data.totalPages}
					</span>
					<div className="flex gap-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page >= data.totalPages}
							onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

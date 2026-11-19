import { useState } from "react";
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ClipboardList,
	Loader2,
	ShieldAlert,
} from "lucide-react";
import { SELECT_FIELD_CLASS } from "@/components/CampoSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useListarKardexInsumo } from "@/modules/inventario-insumos/hooks/useListarKardexInsumo";
import type {
	InsumoDto,
	TipoMovimientoInsumo,
} from "@/modules/inventario-insumos/types";

interface KardexInsumoDialogProps {
	insumo: InsumoDto | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TIPO_BADGE: Record<TipoMovimientoInsumo, string> = {
	ENTRADA:
		"bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
	SALIDA:
		"bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
	AJUSTE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

export function KardexInsumoDialog({
	insumo,
	open,
	onOpenChange,
}: KardexInsumoDialogProps) {
	const [page, setPage] = useState(1);
	const [tipoFiltro, setTipoFiltro] = useState<string>("");

	const { data, isLoading } = useListarKardexInsumo(
		insumo?.id ?? 0,
		{ page, limit: 10, tipo: tipoFiltro || undefined },
		open && Boolean(insumo),
	);

	if (!insumo) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					setPage(1);
					setTipoFiltro("");
				}
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<ClipboardList className="size-5 text-primary" />
						Kardex de {insumo.nombre}
					</DialogTitle>
					<DialogDescription>
						Historial de movimientos e invariante de stock (
						{insumo.unidadMedida}
						).
					</DialogDescription>
				</DialogHeader>

				{data && (
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3 text-sm">
						<div className="flex flex-wrap items-center gap-4">
							<span>
								<strong>Stock actual:</strong> {data.stockActual}{" "}
								{data.unidadMedida}
							</span>
							<span>
								<strong>Suma Kardex:</strong> {data.sumaKardex}{" "}
								{data.unidadMedida}
							</span>
						</div>
						<Badge
							variant={data.consistente ? "default" : "destructive"}
							className="gap-1"
						>
							{data.consistente ? (
								<>
									<CheckCircle2 className="size-3.5" /> consistente
								</>
							) : (
								<>
									<ShieldAlert className="size-3.5" /> discrepancia
								</>
							)}
						</Badge>
					</div>
				)}

				<div className="flex items-center justify-between gap-2">
					<label htmlFor="kardex-tipo-filtro" className="text-xs font-medium">
						Filtrar movimiento
					</label>
					<select
						id="kardex-tipo-filtro"
						value={tipoFiltro}
						onChange={(e) => {
							setTipoFiltro(e.target.value);
							setPage(1);
						}}
						className={`${SELECT_FIELD_CLASS} max-w-[200px] h-8 text-xs`}
					>
						<option value="">Todos los tipos</option>
						<option value="ENTRADA">ENTRADA</option>
						<option value="SALIDA">SALIDA</option>
						<option value="AJUSTE">AJUSTE</option>
					</select>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin text-primary" />
						Cargando movimientos...
					</div>
				) : !data || data.movimientos.data.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
						No hay movimientos registrados para este criterio.
					</p>
				) : (
					<>
						<div className="overflow-x-auto rounded-lg border border-border">
							<table className="w-full text-xs text-left">
								<thead className="bg-muted/50 uppercase text-muted-foreground border-b border-border">
									<tr>
										<th className="px-3 py-2">Fecha</th>
										<th className="px-3 py-2">Tipo</th>
										<th className="px-3 py-2 text-right">Delta</th>
										<th className="px-3 py-2 text-right">Costo unit.</th>
										<th className="px-3 py-2">Motivo</th>
										<th className="px-3 py-2">Origen</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{data.movimientos.data.map((m) => (
										<tr key={m.id} className="hover:bg-muted/20">
											<td className="px-3 py-2 whitespace-nowrap">
												{new Date(m.fecha).toLocaleDateString("es-MX")}
											</td>
											<td className="px-3 py-2">
												<Badge variant="outline" className={TIPO_BADGE[m.tipo]}>
													{m.tipo}
												</Badge>
											</td>
											<td className="px-3 py-2 text-right font-semibold tabular-nums">
												{m.delta > 0 ? `+${m.delta}` : m.delta}{" "}
												{data.unidadMedida}
											</td>
											<td className="px-3 py-2 text-right tabular-nums">
												{m.costoUnitario !== null
													? `$${m.costoUnitario.toFixed(2)}`
													: "—"}
											</td>
											<td className="px-3 py-2 max-w-[220px] truncate">
												{m.motivo}
											</td>
											<td className="px-3 py-2 text-muted-foreground">
												{m.referenciaTipo ?? "MANUAL"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{data.movimientos.totalPages > 1 && (
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									Página {data.movimientos.page} de{" "}
									{data.movimientos.totalPages}
								</span>
								<div className="flex gap-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={page <= 1}
										onClick={() => setPage((p) => Math.max(1, p - 1))}
									>
										<ChevronLeft className="size-3.5" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={page >= data.movimientos.totalPages}
										onClick={() =>
											setPage((p) =>
												Math.min(data.movimientos.totalPages, p + 1),
											)
										}
									>
										<ChevronRight className="size-3.5" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

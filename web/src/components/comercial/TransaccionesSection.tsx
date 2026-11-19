import {
	ChevronLeft,
	ChevronRight,
	Eye,
	FileDown,
	Loader2,
	ShoppingBag,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { SELECT_FIELD_CLASS } from "@/components/CampoSelect";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	useEliminarTransaccion,
	useListarTransacciones,
} from "@/modules/comercial/hooks/useComercial";
import { comercialService } from "@/modules/comercial/services/comercialService";
import type {
	TipoTransaccion,
	TransaccionOutputDto,
} from "@/modules/comercial/types";
import { RegistrarCompraDialog } from "./RegistrarCompraDialog";
import { RegistrarVentaDialog } from "./RegistrarVentaDialog";
import { TransaccionDetalleDialog } from "./TransaccionDetalleDialog";

export function TransaccionesSection() {
	const { can } = usePermissions();
	const canCreate = can("comercial", "create");
	const canDelete = can("comercial", "delete");

	const [page, setPage] = useState(1);
	const [tipo, setTipo] = useState<TipoTransaccion | "">("");
	const [ventaOpen, setVentaOpen] = useState(false);
	const [compraOpen, setCompraOpen] = useState(false);
	const [detalleId, setDetalleId] = useState<number | null>(null);
	const [eliminarTarget, setEliminarTarget] =
		useState<TransaccionOutputDto | null>(null);

	const { data, isLoading } = useListarTransacciones({
		page,
		limit: 10,
		tipo: tipo || undefined,
	});
	const eliminarMutation = useEliminarTransaccion();

	return (
		<div className="space-y-4 text-left">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<select
						aria-label="Filtrar por tipo de transacción"
						value={tipo}
						onChange={(e) => {
							setTipo(e.target.value as TipoTransaccion | "");
							setPage(1);
						}}
						className={`${SELECT_FIELD_CLASS} max-w-[180px] h-9`}
					>
						<option value="">Todas (Compras / Ventas)</option>
						<option value="VENTA">Solo Ventas</option>
						<option value="COMPRA">Solo Compras</option>
					</select>
				</div>

				{canCreate && (
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCompraOpen(true)}
							className="gap-1.5"
						>
							<ShoppingCart className="size-4" />
							Registrar Compra
						</Button>
						<Button
							type="button"
							onClick={() => setVentaOpen(true)}
							className="gap-1.5"
						>
							<ShoppingBag className="size-4" />
							Registrar Venta
						</Button>
					</div>
				)}
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Cargando transacciones...
				</div>
			) : !data || data.data.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
					No hay transacciones registradas.
				</p>
			) : (
				<>
					<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
								<tr>
									<th className="px-4 py-3">Fecha</th>
									<th className="px-4 py-3">Tipo</th>
									<th className="px-4 py-3">Contraparte</th>
									<th className="px-4 py-3 text-right">Animales</th>
									<th className="px-4 py-3 text-right">Total</th>
									<th className="px-4 py-3 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{data.data.map((t) => (
									<tr key={t.id} className="hover:bg-muted/20">
										<td className="px-4 py-3 whitespace-nowrap">
											{new Date(t.fecha).toLocaleDateString("es-MX")}
										</td>
										<td className="px-4 py-3">
											<Badge
												variant={t.tipo === "VENTA" ? "default" : "secondary"}
											>
												{t.tipo}
											</Badge>
										</td>
										<td className="px-4 py-3 font-medium">
											{t.contraparte}
											{t.documento && (
												<span className="block text-xs text-muted-foreground">
													Ref: {t.documento}
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-right">
											{t.detalles.length}
										</td>
										<td className="px-4 py-3 text-right font-semibold tabular-nums">
											${t.total.toFixed(2)} {t.moneda}
										</td>
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-1">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setDetalleId(t.id)}
												>
													<Eye className="size-3.5 mr-1" />
													Ver
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() =>
														comercialService.exportarTransaccionPdf(t.id)
													}
												>
													<FileDown className="size-3.5 mr-1" />
													PDF
												</Button>
												{canDelete && (
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => setEliminarTarget(t)}
													>
														<Trash2 className="size-3.5" />
													</Button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{data.totalPages > 1 && (
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>
								Página {data.page} de {data.totalPages} ({data.totalItems}{" "}
								registros)
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
									onClick={() =>
										setPage((p) => Math.min(data.totalPages, p + 1))
									}
								>
									<ChevronRight className="size-4" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}

			<RegistrarVentaDialog open={ventaOpen} onOpenChange={setVentaOpen} />
			<RegistrarCompraDialog open={compraOpen} onOpenChange={setCompraOpen} />
			<TransaccionDetalleDialog
				transaccionId={detalleId}
				open={detalleId !== null}
				onOpenChange={(o) => !o && setDetalleId(null)}
			/>
			<ConfirmarDialog
				open={!!eliminarTarget}
				onOpenChange={(o) => !o && setEliminarTarget(null)}
				titulo="Eliminar transacción"
				descripcion={`¿Eliminar la transacción #${eliminarTarget?.id} (${eliminarTarget?.contraparte})?`}
				isPending={eliminarMutation.isPending}
				onConfirm={() => {
					if (!eliminarTarget) return;
					eliminarMutation.mutate(eliminarTarget.id, {
						onSuccess: () => setEliminarTarget(null),
					});
				}}
			/>
		</div>
	);
}

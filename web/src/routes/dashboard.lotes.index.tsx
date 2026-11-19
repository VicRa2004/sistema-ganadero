import { createFileRoute } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	Layers,
	Loader2,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { LoteDetalleDialog } from "@/components/lote/LoteDetalleDialog";
import { LoteFormDialog } from "@/components/lote/LoteFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import { useEliminarLote, useListarLotes } from "@/modules/lote/hooks/useLotes";
import type { LoteOutputDto } from "@/modules/lote/types";

export const Route = createFileRoute("/dashboard/lotes/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "lotes", "read");
	},
	component: LotesComponent,
});

function LotesComponent() {
	const { can } = usePermissions();
	const canCreate = can("lotes", "create");
	const canUpdate = can("lotes", "update");
	const canDelete = can("lotes", "delete");

	const [page, setPage] = useState(1);
	const [busqueda, setBusqueda] = useState("");
	const [crearOpen, setCrearOpen] = useState(false);
	const [editarTarget, setEditarTarget] = useState<LoteOutputDto | null>(null);
	const [detalleId, setDetalleId] = useState<number | null>(null);
	const [eliminarTarget, setEliminarTarget] = useState<LoteOutputDto | null>(
		null,
	);

	const { data, isLoading } = useListarLotes({
		page,
		limit: 10,
		nombre: busqueda.trim() || undefined,
	});
	const eliminarMutation = useEliminarLote();

	return (
		<div className="space-y-6 py-4 sm:py-6 animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 text-left">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Layers className="size-6" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Lotes / Hatos Operativos
						</h1>
						<p className="text-sm text-muted-foreground">
							Agrupa animales para pesaje, traslado y vacunación masiva.
						</p>
					</div>
				</div>
				{canCreate && (
					<Button onClick={() => setCrearOpen(true)} className="gap-1.5">
						<Plus className="size-4" />
						Nuevo Lote
					</Button>
				)}
			</div>

			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
				<Input
					placeholder="Buscar lote por nombre..."
					value={busqueda}
					onChange={(e) => {
						setBusqueda(e.target.value);
						setPage(1);
					}}
					className="pl-9"
				/>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Cargando lotes...
				</div>
			) : !data || data.data.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
					No hay lotes registrados.
				</p>
			) : (
				<>
					<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
								<tr>
									<th className="px-4 py-3">Nombre</th>
									<th className="px-4 py-3">Propósito</th>
									<th className="px-4 py-3">Terreno</th>
									<th className="px-4 py-3 text-right">Animales</th>
									<th className="px-4 py-3">Estado</th>
									<th className="px-4 py-3 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{data.data.map((l) => (
									<tr key={l.id} className="hover:bg-muted/20">
										<td className="px-4 py-3 font-semibold">{l.nombre}</td>
										<td className="px-4 py-3">
											<Badge variant="outline">{l.proposito}</Badge>
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{l.terrenoNombre ?? "Sin asignar"}
										</td>
										<td className="px-4 py-3 text-right font-semibold tabular-nums">
											{l.cantidadAnimales}
										</td>
										<td className="px-4 py-3">
											<Badge variant={l.activo ? "default" : "secondary"}>
												{l.activo ? "Activo" : "Inactivo"}
											</Badge>
										</td>
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-1">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setDetalleId(l.id)}
												>
													<Eye className="size-3.5 mr-1" />
													Gestionar
												</Button>
												{canUpdate && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setEditarTarget(l)}
													>
														<Pencil className="size-3.5" />
													</Button>
												)}
												{canDelete && (
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => setEliminarTarget(l)}
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

			<LoteFormDialog open={crearOpen} onOpenChange={setCrearOpen} />
			{editarTarget && (
				<LoteFormDialog
					open={!!editarTarget}
					onOpenChange={(o) => !o && setEditarTarget(null)}
					lote={editarTarget}
				/>
			)}
			<LoteDetalleDialog
				loteId={detalleId}
				open={detalleId !== null}
				onOpenChange={(o) => !o && setDetalleId(null)}
			/>
			<ConfirmarDialog
				open={!!eliminarTarget}
				onOpenChange={(o) => !o && setEliminarTarget(null)}
				titulo="Eliminar lote"
				descripcion={`¿Eliminar el lote "${eliminarTarget?.nombre}"?`}
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

import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { SELECT_FIELD_CLASS } from "@/components/CampoSelect";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	useEliminarGasto,
	useListarGastos,
} from "@/modules/comercial/hooks/useComercial";
import {
	CATEGORIA_GASTO_LABELS,
	CATEGORIAS_GASTO,
	type CategoriaGasto,
	type GastoOutputDto,
} from "@/modules/comercial/types";
import { GastoFormDialog } from "./GastoFormDialog";

export function GastosSection() {
	const { can } = usePermissions();
	const canCreate = can("comercial", "create");
	const canUpdate = can("comercial", "update");
	const canDelete = can("comercial", "delete");

	const [page, setPage] = useState(1);
	const [categoria, setCategoria] = useState<CategoriaGasto | "">("");
	const [crearOpen, setCrearOpen] = useState(false);
	const [editarTarget, setEditarTarget] = useState<GastoOutputDto | null>(null);
	const [eliminarTarget, setEliminarTarget] = useState<GastoOutputDto | null>(
		null,
	);

	const { data, isLoading } = useListarGastos({
		page,
		limit: 10,
		categoria: categoria || undefined,
	});
	const eliminarMutation = useEliminarGasto();

	return (
		<div className="space-y-4 text-left">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<select
					aria-label="Filtrar gastos por categoría"
					value={categoria}
					onChange={(e) => {
						setCategoria(e.target.value as CategoriaGasto | "");
						setPage(1);
					}}
					className={`${SELECT_FIELD_CLASS} max-w-[200px] h-9`}
				>
					<option value="">Todas las categorías</option>
					{CATEGORIAS_GASTO.map((c) => (
						<option key={c} value={c}>
							{CATEGORIA_GASTO_LABELS[c]}
						</option>
					))}
				</select>

				{canCreate && (
					<Button
						type="button"
						onClick={() => setCrearOpen(true)}
						className="gap-1.5"
					>
						<Plus className="size-4" />
						Registrar Gasto
					</Button>
				)}
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Cargando gastos...
				</div>
			) : !data || data.data.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
					No hay gastos operativos registrados.
				</p>
			) : (
				<>
					<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
								<tr>
									<th className="px-4 py-3">Fecha</th>
									<th className="px-4 py-3">Categoría</th>
									<th className="px-4 py-3">Concepto</th>
									<th className="px-4 py-3">Asociación</th>
									<th className="px-4 py-3 text-right">Monto</th>
									<th className="px-4 py-3 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{data.data.map((g) => (
									<tr key={g.id} className="hover:bg-muted/20">
										<td className="px-4 py-3 whitespace-nowrap">
											{new Date(g.fecha).toLocaleDateString("es-MX")}
										</td>
										<td className="px-4 py-3">
											<Badge variant="outline">
												{CATEGORIA_GASTO_LABELS[g.categoria]}
											</Badge>
										</td>
										<td className="px-4 py-3 font-medium">{g.concepto}</td>
										<td className="px-4 py-3 text-xs text-muted-foreground">
											{[
												g.terrenoNombre && `Terreno: ${g.terrenoNombre}`,
												g.ganadoIdentificador &&
													`Arete: ${g.ganadoIdentificador}`,
												g.loteNombre && `Lote: ${g.loteNombre}`,
											]
												.filter(Boolean)
												.join(" · ") || "General"}
										</td>
										<td className="px-4 py-3 text-right font-semibold tabular-nums">
											${g.monto.toFixed(2)}
										</td>
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-1">
												{canUpdate && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setEditarTarget(g)}
													>
														<Pencil className="size-3.5" />
													</Button>
												)}
												{canDelete && (
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => setEliminarTarget(g)}
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

			<GastoFormDialog open={crearOpen} onOpenChange={setCrearOpen} />
			{editarTarget && (
				<GastoFormDialog
					open={!!editarTarget}
					onOpenChange={(o) => !o && setEditarTarget(null)}
					gasto={editarTarget}
				/>
			)}
			<ConfirmarDialog
				open={!!eliminarTarget}
				onOpenChange={(o) => !o && setEliminarTarget(null)}
				titulo="Eliminar gasto"
				descripcion={`¿Eliminar el gasto "${eliminarTarget?.concepto}"?`}
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

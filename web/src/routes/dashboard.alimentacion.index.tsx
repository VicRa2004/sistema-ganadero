import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2, Utensils, Wheat } from "lucide-react";
import { useState } from "react";
import { AutonomiaCards } from "@/components/alimentacion/AutonomiaCards";
import { RacionFormDialog } from "@/components/alimentacion/RacionFormDialog";
import { RegistrarSuministroDialog } from "@/components/alimentacion/RegistrarSuministroDialog";
import { SuministrosTable } from "@/components/alimentacion/SuministrosTable";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	useEliminarRacion,
	useListarRaciones,
	useObtenerAutonomiaAlimento,
} from "@/modules/alimentacion/hooks/useAlimentacion";
import type { RacionOutputDto } from "@/modules/alimentacion/types";

export const Route = createFileRoute("/dashboard/alimentacion/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "alimentacion", "read");
	},
	component: AlimentacionComponent,
});

function AlimentacionComponent() {
	const { can } = usePermissions();
	const canCreate = can("alimentacion", "create");
	const canUpdate = can("alimentacion", "update");
	const canDelete = can("alimentacion", "delete");

	const [crearOpen, setCrearOpen] = useState(false);
	const [editarTarget, setEditarTarget] = useState<RacionOutputDto | null>(
		null,
	);
	const [suministrarTarget, setSuministrarTarget] =
		useState<RacionOutputDto | null>(null);
	const [eliminarTarget, setEliminarTarget] = useState<RacionOutputDto | null>(
		null,
	);

	const { data: autonomia = [], isLoading: loadingAutonomia } =
		useObtenerAutonomiaAlimento();
	const { data: racionesData, isLoading: loadingRaciones } = useListarRaciones({
		page: 1,
		limit: 50,
	});
	const eliminarMutation = useEliminarRacion();

	return (
		<div className="space-y-8 py-4 sm:py-6 animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 text-left">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Wheat className="size-6" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Alimentación, Raciones y Autonomía
						</h1>
						<p className="text-sm text-muted-foreground">
							Configura dietas diarias por lote o terreno, registra suministros
							y vigila los días de autonomía.
						</p>
					</div>
				</div>
				{canCreate && (
					<Button onClick={() => setCrearOpen(true)} className="gap-1.5">
						<Plus className="size-4" />
						Nueva Ración
					</Button>
				)}
			</div>

			<section className="space-y-3 text-left">
				<h2 className="text-base font-bold">Autonomía de Alimentos</h2>
				{loadingAutonomia ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Calculando autonomía...
					</div>
				) : (
					<AutonomiaCards items={autonomia} />
				)}
			</section>

			<section className="space-y-3 text-left">
				<h2 className="text-base font-bold">Raciones Configuradas</h2>
				{loadingRaciones ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Cargando raciones...
					</div>
				) : !racionesData || racionesData.data.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
						No hay raciones registradas todavía.
					</p>
				) : (
					<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
								<tr>
									<th className="px-4 py-3">Ración</th>
									<th className="px-4 py-3">Alimento</th>
									<th className="px-4 py-3">Destino</th>
									<th className="px-4 py-3 text-right">Dosis/animal</th>
									<th className="px-4 py-3">Estado</th>
									<th className="px-4 py-3 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{racionesData.data.map((r) => (
									<tr key={r.id} className="hover:bg-muted/20">
										<td className="px-4 py-3 font-semibold">{r.nombre}</td>
										<td className="px-4 py-3">{r.insumoNombre}</td>
										<td className="px-4 py-3 text-xs text-muted-foreground">
											{r.loteNombre
												? `Lote: ${r.loteNombre}`
												: r.terrenoNombre
													? `Terreno: ${r.terrenoNombre}`
													: "—"}
										</td>
										<td className="px-4 py-3 text-right tabular-nums">
											{r.cantidadDiariaPorAnimal} {r.insumoUnidad}
										</td>
										<td className="px-4 py-3">
											<Badge variant={r.activo ? "default" : "secondary"}>
												{r.activo ? "Activa" : "Inactiva"}
											</Badge>
										</td>
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-1">
												{canCreate && r.activo && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setSuministrarTarget(r)}
														className="gap-1 text-emerald-700 dark:text-emerald-400"
													>
														<Utensils className="size-3.5" />
														Suministrar
													</Button>
												)}
												{canUpdate && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setEditarTarget(r)}
													>
														<Pencil className="size-3.5" />
													</Button>
												)}
												{canDelete && (
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => setEliminarTarget(r)}
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
				)}
			</section>

			<section className="space-y-3 text-left">
				<h2 className="text-base font-bold">Historial de Suministros</h2>
				<SuministrosTable />
			</section>

			<RacionFormDialog open={crearOpen} onOpenChange={setCrearOpen} />
			{editarTarget && (
				<RacionFormDialog
					open={!!editarTarget}
					onOpenChange={(o) => !o && setEditarTarget(null)}
					racion={editarTarget}
				/>
			)}
			<RegistrarSuministroDialog
				racion={suministrarTarget}
				open={!!suministrarTarget}
				onOpenChange={(o) => !o && setSuministrarTarget(null)}
			/>
			<ConfirmarDialog
				open={!!eliminarTarget}
				onOpenChange={(o) => !o && setEliminarTarget(null)}
				titulo="Eliminar ración"
				descripcion={`¿Eliminar la ración "${eliminarTarget?.nombre}"?`}
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

import { useState } from "react";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { InsumoDto } from "@/modules/inventario-insumos/types";
import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	PlusCircle,
	MinusCircle,
	Pencil,
	Trash2,
	Calendar,
	Package,
} from "lucide-react";
import { AbastecerInsumoDialog } from "./AbastecerInsumoDialog";
import { ConsumirInsumoDialog } from "./ConsumirInsumoDialog";
import { EliminarInsumoDialog } from "./EliminarInsumoDialog";
import { InsumoFormDialog } from "./InsumoFormDialog";

interface InsumosTableProps {
	insumos: InsumoDto[];
}

export function InsumosTable({ insumos }: InsumosTableProps) {
	const permissions = useAuthStore((state) => state.permissions) || [];
	const canUpdate = permissions.includes("inventario-insumos:update");
	const canDelete = permissions.includes("inventario-insumos:delete");

	const [editarInsumo, setEditarInsumo] = useState<InsumoDto | null>(null);
	const [abastecerInsumo, setAbastecerInsumo] = useState<InsumoDto | null>(
		null,
	);
	const [consumirInsumo, setConsumirInsumo] = useState<InsumoDto | null>(null);
	const [eliminarInsumo, setEliminarInsumo] = useState<InsumoDto | null>(null);

	const getTipoBadgeClass = (tipo: string) => {
		switch (tipo) {
			case "MEDICAMENTO":
				return "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-800";
			case "VACUNA":
				return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
			case "ALIMENTO":
				return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-800";
			default:
				return "bg-secondary text-secondary-foreground border-border";
		}
	};

	if (insumos.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
				<div className="p-4 rounded-full bg-primary/10 mb-4">
					<Package className="h-8 w-8 text-primary" />
				</div>
				<h3 className="text-lg font-semibold mb-1">
					No hay insumos registrados
				</h3>
				<p className="text-sm text-muted-foreground max-w-sm">
					No se encontraron insumos de inventario que coincidan con los
					criterios de búsqueda.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
				<table className="w-full text-sm text-left">
					<thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
						<tr>
							<th scope="col" className="px-6 py-4">
								Insumo / Lote
							</th>
							<th scope="col" className="px-6 py-4">
								Categoría
							</th>
							<th scope="col" className="px-6 py-4">
								Stock Actual
							</th>
							<th scope="col" className="px-6 py-4">
								Stock Mínimo
							</th>
							<th scope="col" className="px-6 py-4">
								Fecha Caducidad
							</th>
							<th scope="col" className="px-6 py-4 text-right">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{insumos.map((insumo) => (
							<tr
								key={insumo.id}
								className={`hover:bg-muted/30 transition-colors ${
									insumo.esBajoStock ? "bg-red-500/5 dark:bg-red-500/10" : ""
								}`}
							>
								{/* Nombre y Lote */}
								<td className="px-6 py-4">
									<div className="font-medium text-foreground">
										{insumo.nombre}
									</div>
									<div className="text-xs text-muted-foreground font-mono mt-0.5">
										Lote: {insumo.lote}
									</div>
								</td>

								{/* Categoría / Tipo */}
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTipoBadgeClass(
											insumo.tipo,
										)}`}
									>
										{insumo.tipo}
									</span>
								</td>

								{/* Stock Actual */}
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<span
											className={`font-semibold ${
												insumo.esBajoStock
													? "text-red-600 dark:text-red-400"
													: "text-foreground"
											}`}
										>
											{insumo.stock} {insumo.unidadMedida}
										</span>
										{insumo.esBajoStock && (
											<span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-red-500/15 text-red-700 dark:text-red-300 font-medium">
												<AlertTriangle className="h-3 w-3" />
												Stock Bajo
											</span>
										)}
									</div>
								</td>

								{/* Stock Mínimo */}
								<td className="px-6 py-4 text-muted-foreground">
									{insumo.stockMinimo} {insumo.unidadMedida}
								</td>

								{/* Fecha Caducidad */}
								<td className="px-6 py-4">
									<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Calendar className="h-3.5 w-3.5" />
										<span>
											{new Date(insumo.fechaCaducidad).toLocaleDateString(
												"es-MX",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
												},
											)}
										</span>
									</div>
								</td>

								{/* Acciones */}
								<td className="px-6 py-4 text-right">
									<div className="flex items-center justify-end gap-1">
										{canUpdate && (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setAbastecerInsumo(insumo)}
													title="Abastecer stock"
													className="cursor-pointer text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/10"
												>
													<PlusCircle className="h-4 w-4 mr-1" />
													Abastecer
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() => setConsumirInsumo(insumo)}
													title="Consumir stock"
													className="cursor-pointer text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/10"
												>
													<MinusCircle className="h-4 w-4 mr-1" />
													Consumir
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() => setEditarInsumo(insumo)}
													title="Editar insumo"
													className="cursor-pointer hover:bg-muted"
												>
													<Pencil className="h-4 w-4 mr-1" />
													Editar
												</Button>
											</>
										)}

										{canDelete && (
											<Button
												variant="destructive"
												size="sm"
												onClick={() => setEliminarInsumo(insumo)}
												title="Eliminar insumo"
												className="cursor-pointer"
											>
												<Trash2 className="h-4 w-4 mr-1" />
												Eliminar
											</Button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Diálogos modales de acción */}
			{editarInsumo && (
				<InsumoFormDialog
					open={!!editarInsumo}
					onOpenChange={(open) => !open && setEditarInsumo(null)}
					insumo={editarInsumo}
				/>
			)}

			{abastecerInsumo && (
				<AbastecerInsumoDialog
					open={!!abastecerInsumo}
					onOpenChange={(open) => !open && setAbastecerInsumo(null)}
					insumo={abastecerInsumo}
				/>
			)}

			{consumirInsumo && (
				<ConsumirInsumoDialog
					open={!!consumirInsumo}
					onOpenChange={(open) => !open && setConsumirInsumo(null)}
					insumo={consumirInsumo}
				/>
			)}

			{eliminarInsumo && (
				<EliminarInsumoDialog
					open={!!eliminarInsumo}
					onOpenChange={(open) => !open && setEliminarInsumo(null)}
					insumo={eliminarInsumo}
				/>
			)}
		</>
	);
}

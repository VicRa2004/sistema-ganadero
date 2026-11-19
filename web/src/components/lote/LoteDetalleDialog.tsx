import {
	ArrowRightLeft,
	Layers,
	Loader2,
	Plus,
	Scale,
	Syringe,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { GanadoSelectorModal } from "@/components/ganado/GanadoSelectorModal";
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
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	useAgregarMiembrosLote,
	useObtenerDetalleLote,
	useQuitarMiembroLote,
} from "@/modules/lote/hooks/useLotes";
import { PesajeMasivoDialog } from "./PesajeMasivoDialog";
import { TrasladoMasivoDialog } from "./TrasladoMasivoDialog";
import { VacunacionMasivaDialog } from "./VacunacionMasivaDialog";

interface LoteDetalleDialogProps {
	loteId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LoteDetalleDialog({
	loteId,
	open,
	onOpenChange,
}: LoteDetalleDialogProps) {
	const { can } = usePermissions();
	const canUpdate = can("lotes", "update");

	const [selectorOpen, setSelectorOpen] = useState(false);
	const [pesajeOpen, setPesajeOpen] = useState(false);
	const [trasladoOpen, setTrasladoOpen] = useState(false);
	const [vacunacionOpen, setVacunacionOpen] = useState(false);

	const id = loteId ?? 0;
	const { data: lote, isLoading } = useObtenerDetalleLote(
		id,
		open && Boolean(loteId),
	);
	const agregarMiembros = useAgregarMiembrosLote(id);
	const quitarMiembro = useQuitarMiembroLote(id);

	const miembrosActivos = (lote?.miembros ?? []).filter((m) => !m.fechaBaja);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-lg font-bold">
							<Layers className="size-5 text-primary" />
							{lote ? lote.nombre : "Detalle del Lote"}
						</DialogTitle>
						<DialogDescription>
							Administra los miembros del lote y ejecuta acciones masivas.
						</DialogDescription>
					</DialogHeader>

					{isLoading ? (
						<div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Cargando detalle...
						</div>
					) : !lote ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							No se pudo cargar el lote.
						</p>
					) : (
						<div className="space-y-4 text-left">
							<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
								<div className="flex flex-wrap items-center gap-2">
									<Badge>{lote.proposito}</Badge>
									<Badge variant="outline">
										{lote.miembros.length} miembro(s)
									</Badge>
									{lote.terrenoNombre && (
										<span className="text-muted-foreground">
											Terreno: <strong>{lote.terrenoNombre}</strong>
										</span>
									)}
								</div>
								{canUpdate && (
									<div className="flex flex-wrap gap-1.5">
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={miembrosActivos.length === 0}
											onClick={() => setPesajeOpen(true)}
											className="gap-1"
										>
											<Scale className="size-3.5" />
											Pesaje Masivo
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={miembrosActivos.length === 0}
											onClick={() => setTrasladoOpen(true)}
											className="gap-1"
										>
											<ArrowRightLeft className="size-3.5" />
											Traslado Masivo
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={miembrosActivos.length === 0}
											onClick={() => setVacunacionOpen(true)}
											className="gap-1"
										>
											<Syringe className="size-3.5" />
											Vacunación Masiva
										</Button>
									</div>
								)}
							</div>

							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold">Miembros del lote</h3>
								{canUpdate && (
									<Button
										type="button"
										size="sm"
										onClick={() => setSelectorOpen(true)}
										className="gap-1"
									>
										<Plus className="size-3.5" />
										Agregar animal
									</Button>
								)}
							</div>

							{lote.miembros.length === 0 ? (
								<p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
									Este lote aún no tiene animales asignados.
								</p>
							) : (
								<div className="overflow-x-auto rounded-lg border border-border">
									<table className="w-full text-xs text-left">
										<thead className="bg-muted/50 text-muted-foreground border-b border-border">
											<tr>
												<th className="px-3 py-2">Arete</th>
												<th className="px-3 py-2">Sexo</th>
												<th className="px-3 py-2">Raza</th>
												<th className="px-3 py-2">Terreno</th>
												<th className="px-3 py-2 text-right">Peso</th>
												{canUpdate && (
													<th className="px-3 py-2 text-right">Quitar</th>
												)}
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{lote.miembros.map((m) => (
												<tr key={m.ganadoId}>
													<td className="px-3 py-2 font-semibold">
														{m.identificador}
													</td>
													<td className="px-3 py-2">{m.sexo}</td>
													<td className="px-3 py-2">{m.razaNombre}</td>
													<td className="px-3 py-2">{m.terrenoNombre}</td>
													<td className="px-3 py-2 text-right tabular-nums">
														{m.peso} kg
													</td>
													{canUpdate && (
														<td className="px-3 py-2 text-right">
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																disabled={quitarMiembro.isPending}
																aria-label={`Quitar ${m.identificador}`}
																onClick={() => quitarMiembro.mutate(m.ganadoId)}
															>
																<Trash2 className="size-3.5 text-destructive" />
															</Button>
														</td>
													)}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
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

			<GanadoSelectorModal
				open={selectorOpen}
				onOpenChange={setSelectorOpen}
				title="Agregar Animal al Lote"
				description="Selecciona un animal activo para incorporarlo al lote."
				onSelect={(ganado) => {
					setSelectorOpen(false);
					if (ganado) agregarMiembros.mutate([ganado.id]);
				}}
			/>
			{lote && (
				<>
					<PesajeMasivoDialog
						loteId={lote.id}
						miembros={miembrosActivos}
						open={pesajeOpen}
						onOpenChange={setPesajeOpen}
					/>
					<TrasladoMasivoDialog
						loteId={lote.id}
						cantidadAnimales={miembrosActivos.length}
						open={trasladoOpen}
						onOpenChange={setTrasladoOpen}
					/>
					<VacunacionMasivaDialog
						loteId={lote.id}
						cantidadAnimales={miembrosActivos.length}
						open={vacunacionOpen}
						onOpenChange={setVacunacionOpen}
					/>
				</>
			)}
		</>
	);
}

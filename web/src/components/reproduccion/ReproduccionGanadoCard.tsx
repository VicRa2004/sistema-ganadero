import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import type { GanadoDetalleDto } from "@/modules/ganado/types";
import {
	useEliminarEventoReproductivo,
	useListarEventosReproductivos,
} from "@/modules/reproduccion/hooks/useReproduccion";
import { TIPO_EVENTO_LABELS } from "@/modules/reproduccion/types";
import { EventoReproductivoFormDialog } from "./EventoReproductivoFormDialog";

export function ReproduccionGanadoCard({
	ganado,
}: {
	ganado: GanadoDetalleDto;
}) {
	const [openDialog, setOpenDialog] = useState(false);
	const { can } = usePermissions();
	const canCreate = can("reproduccion", "create");
	const canDelete = can("reproduccion", "delete");

	const { data, isLoading, isError } = useListarEventosReproductivos({
		page: 1,
		limit: 20,
		ganadoId: ganado.id,
	});
	const eliminar = useEliminarEventoReproductivo();

	const eventos = data?.data ?? [];

	return (
		<>
			<Card className="border border-border bg-card/60 shadow-sm">
				<CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Heart className="size-4 text-primary" />
						Historial reproductivo
					</CardTitle>
					{canCreate && ganado.sexo === "HEMBRA" && !ganado.fechaBaja && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => setOpenDialog(true)}
						>
							<Plus className="size-3.5 mr-1" />
							Registrar evento
						</Button>
					)}
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Cargando eventos...
						</div>
					)}
					{isError && (
						<p className="text-sm text-destructive">
							No se pudo cargar el historial reproductivo.
						</p>
					)}
					{!isLoading && !isError && eventos.length === 0 && (
						<p className="text-sm text-muted-foreground">
							Sin eventos reproductivos registrados.
						</p>
					)}
					{eventos.length > 0 && (
						<Table className="min-w-[520px]">
							<TableHeader>
								<TableRow>
									<TableHead>Fecha</TableHead>
									<TableHead>Evento</TableHead>
									<TableHead>Pareja</TableHead>
									<TableHead>Parto probable / Resultado</TableHead>
									<TableHead>Crías / Observaciones</TableHead>
									{canDelete && <TableHead className="w-12" />}
								</TableRow>
							</TableHeader>
							<TableBody>
								{eventos.map((ev) => (
									<TableRow key={ev.id}>
										<TableCell>{ev.fecha}</TableCell>
										<TableCell>
											<Badge variant="outline">
												{TIPO_EVENTO_LABELS[ev.tipo]}
											</Badge>
										</TableCell>
										<TableCell>
											{ganado.sexo === "HEMBRA" ? (
												ev.machoId ? (
													<Link
														to="/dashboard/ganado/$id"
														params={{ id: String(ev.machoId) }}
														className="text-primary hover:underline font-medium"
													>
														{ev.machoIdentificador ?? `#${ev.machoId}`}
													</Link>
												) : (
													"—"
												)
											) : (
												<Link
													to="/dashboard/ganado/$id"
													params={{ id: String(ev.hembraId) }}
													className="text-primary hover:underline font-medium"
												>
													{ev.hembraIdentificador ?? `#${ev.hembraId}`}
												</Link>
											)}
										</TableCell>
										<TableCell>
											{ev.resultado && (
												<Badge
													variant={
														ev.resultado === "POSITIVO"
															? "default"
															: "secondary"
													}
													className="mr-1.5"
												>
													{ev.resultado}
												</Badge>
											)}
											{ev.fechaProbableParto && (
												<span className="text-xs text-muted-foreground">
													Est. {ev.fechaProbableParto}
												</span>
											)}
											{!ev.resultado && !ev.fechaProbableParto && "—"}
										</TableCell>
										<TableCell className="text-xs">
											{ev.crias.length > 0 && (
												<div className="flex flex-wrap gap-1 mb-1">
													{ev.crias.map((c) => (
														<Link
															key={c.id}
															to="/dashboard/ganado/$id"
															params={{ id: String(c.id) }}
															className="underline text-primary"
														>
															{c.identificador}
														</Link>
													))}
												</div>
											)}
											<span className="text-muted-foreground">
												{ev.observaciones ?? ""}
											</span>
										</TableCell>
										{canDelete && (
											<TableCell>
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label="Eliminar evento"
													onClick={() => eliminar.mutate(ev.id)}
												>
													<Trash2 className="size-4 text-destructive" />
												</Button>
											</TableCell>
										)}
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<EventoReproductivoFormDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				hembraInicial={
					ganado.sexo === "HEMBRA"
						? { id: ganado.id, identificador: ganado.identificador }
						: null
				}
			/>
		</>
	);
}

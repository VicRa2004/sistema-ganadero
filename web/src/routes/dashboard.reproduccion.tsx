import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	Baby,
	Calendar,
	Heart,
	Loader2,
	Percent,
	Plus,
	Trash2,
} from "lucide-react";
import { EventoReproductivoFormDialog } from "@/components/reproduccion/EventoReproductivoFormDialog";
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
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
	useEliminarEventoReproductivo,
	useIndicadoresReproductivos,
	useListarEventosReproductivos,
} from "@/modules/reproduccion/hooks/useReproduccion";
import {
	TIPO_EVENTO_LABELS,
	type TipoEventoReproductivo,
} from "@/modules/reproduccion/types";

export const Route = createFileRoute("/dashboard/reproduccion")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("reproduccion:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: ReproduccionPage,
});

function ReproduccionPage() {
	const permissions = useAuthStore((s) => s.permissions) ?? [];
	const canCreate = permissions.includes("reproduccion:create");
	const canDelete = permissions.includes("reproduccion:delete");

	const [page, setPage] = useState(1);
	const [tipoFiltro, setTipoFiltro] = useState<TipoEventoReproductivo | "">("");
	const [openDialog, setOpenDialog] = useState(false);

	const indicadoresQuery = useIndicadoresReproductivos();
	const eventosQuery = useListarEventosReproductivos({
		page,
		limit: 15,
		tipo: tipoFiltro || undefined,
	});
	const eliminar = useEliminarEventoReproductivo();

	const ind = indicadoresQuery.data;
	const eventos = eventosQuery.data?.data ?? [];
	const totalPages = eventosQuery.data?.totalPages ?? 1;

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Heart className="size-6 text-primary" />
						Reproducción
					</h1>
					<p className="text-sm text-muted-foreground">
						Seguimiento de montas, inseminaciones, gestación, partos e
						indicadores del hato.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => setOpenDialog(true)}>
						<Plus className="size-4 mr-1.5" />
						Registrar evento
					</Button>
				)}
			</div>

			{/* Indicadores */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
							<Percent className="size-3.5 text-primary" />
							Tasa de preñez
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{ind?.tasaPrenez !== null && ind?.tasaPrenez !== undefined
								? `${ind.tasaPrenez}%`
								: "—"}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{ind
								? `${ind.diagnosticosPositivos} positivos / ${ind.diagnosticosPositivos + ind.diagnosticosNegativos} diagnósticos`
								: ""}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
							<Calendar className="size-3.5 text-primary" />
							Intervalo entre partos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{ind?.intervaloEntrePartosDias !== null &&
							ind?.intervaloEntrePartosDias !== undefined
								? `${ind.intervaloEntrePartosDias} d`
								: "—"}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Promedio histórico entre partos
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
							<Heart className="size-3.5 text-primary" />
							Servicios (Monta / IA)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{ind?.montasEInseminaciones ?? 0}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{ind?.proximosPartos.length ?? 0} gestación(es) activa(s)
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
							<Baby className="size-3.5 text-primary" />
							Partos registrados
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{ind?.partosEnPeriodo ?? 0}</p>
						<p className="text-xs text-muted-foreground mt-1">
							{ind?.abortosEnPeriodo ?? 0} aborto(s)
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Próximos partos estimados */}
			{ind && ind.proximosPartos.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Baby className="size-4 text-primary" />
							Próximos partos estimados (≈ 283 días)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Hembra</TableHead>
									<TableHead>Semental</TableHead>
									<TableHead>Fecha probable</TableHead>
									<TableHead className="text-right">Días restantes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{ind.proximosPartos.map((p) => (
									<TableRow key={p.eventoId}>
										<TableCell>
											<Link
												to="/dashboard/ganado/$id"
												params={{ id: String(p.hembraId) }}
												className="font-semibold text-primary hover:underline"
											>
												{p.hembraIdentificador}
											</Link>
										</TableCell>
										<TableCell>
											{p.machoIdentificador ?? "No especificado"}
										</TableCell>
										<TableCell>{p.fechaProbableParto}</TableCell>
										<TableCell className="text-right">
											<Badge
												variant={
													p.diasRestantes <= 14 ? "destructive" : "outline"
												}
											>
												{p.diasRestantes <= 0
													? "En fecha"
													: `${p.diasRestantes} días`}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Historial de eventos */}
			<Card>
				<CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<CardTitle className="text-base">Eventos reproductivos</CardTitle>
					<select
						value={tipoFiltro}
						onChange={(e) => {
							setTipoFiltro(e.target.value as TipoEventoReproductivo | "");
							setPage(1);
						}}
						aria-label="Filtrar por tipo de evento"
						className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
					>
						<option value="">Todos los tipos</option>
						{(Object.keys(TIPO_EVENTO_LABELS) as TipoEventoReproductivo[]).map(
							(t) => (
								<option key={t} value={t}>
									{TIPO_EVENTO_LABELS[t]}
								</option>
							),
						)}
					</select>
				</CardHeader>
				<CardContent>
					{eventosQuery.isLoading ? (
						<div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Cargando eventos...
						</div>
					) : eventos.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							No hay eventos reproductivos registrados.
						</p>
					) : (
						<>
							<Table className="min-w-[600px]">
								<TableHeader>
									<TableRow>
										<TableHead>Fecha</TableHead>
										<TableHead>Evento</TableHead>
										<TableHead>Hembra</TableHead>
										<TableHead>Macho</TableHead>
										<TableHead>Parto probable / Resultado</TableHead>
										<TableHead>Crías / Notas</TableHead>
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
												<Link
													to="/dashboard/ganado/$id"
													params={{ id: String(ev.hembraId) }}
													className="font-semibold text-primary hover:underline"
												>
													{ev.hembraIdentificador ?? `#${ev.hembraId}`}
												</Link>
											</TableCell>
											<TableCell>
												{ev.machoId ? (
													<Link
														to="/dashboard/ganado/$id"
														params={{ id: String(ev.machoId) }}
														className="text-primary hover:underline"
													>
														{ev.machoIdentificador ?? `#${ev.machoId}`}
													</Link>
												) : (
													"—"
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
													<div className="flex flex-wrap gap-1 mb-0.5">
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

							{totalPages > 1 && (
								<div className="flex items-center justify-end gap-2 mt-4">
									<Button
										variant="outline"
										size="sm"
										disabled={page <= 1}
										onClick={() => setPage((p) => p - 1)}
									>
										Anterior
									</Button>
									<span className="text-xs text-muted-foreground">
										Página {page} de {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										disabled={page >= totalPages}
										onClick={() => setPage((p) => p + 1)}
									>
										Siguiente
									</Button>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<EventoReproductivoFormDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
			/>
		</div>
	);
}

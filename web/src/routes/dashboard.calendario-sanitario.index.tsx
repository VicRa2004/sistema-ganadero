import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
	Activity,
	AlertTriangle,
	Calendar as CalendarIcon,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Play,
	Plus,
	RefreshCw,
	Stethoscope,
	Trash2,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanSanitarioFormDialog } from "@/components/sesion-sanitaria/PlanSanitarioFormDialog";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import {
	useCancelarSesionSanitaria,
	useEliminarPlanSanitario,
	useGenerarSesionesPlanes,
	useListarPlanesSanitarios,
	useObtenerCalendarioSanitario,
	useRealizarSesionSanitaria,
} from "@/modules/sesion-sanitaria/hooks/useCalendarioYPlanes";
import type { CalendarioEventoDto } from "@/modules/sesion-sanitaria/types";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/calendario-sanitario/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "sesiones-sanitarias", "read");
	},
	component: CalendarioSanitarioPage,
});

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const SELECT_CLASS =
	"flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer";

function CalendarioSanitarioPage() {
	const hoy = new Date();
	const [mesActual, setMesActual] = useState(
		() => new Date(hoy.getFullYear(), hoy.getMonth(), 1),
	);
	const [terrenoId, setTerrenoId] = useState<number | undefined>(undefined);
	const [ganadoId, setGanadoId] = useState<number | undefined>(undefined);
	const [planDialogOpen, setPlanDialogOpen] = useState(false);

	const { can } = usePermissions();
	const canCreate = can("sesiones-sanitarias", "create");
	const canUpdate = can("sesiones-sanitarias", "update");
	const canDelete = can("sesiones-sanitarias", "delete");

	const desde = useMemo(
		() =>
			new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).toISOString(),
		[mesActual],
	);
	const hasta = useMemo(
		() =>
			new Date(
				mesActual.getFullYear(),
				mesActual.getMonth() + 1,
				0,
				23,
				59,
				59,
				999,
			).toISOString(),
		[mesActual],
	);

	const { data: calendario, isLoading } = useObtenerCalendarioSanitario({
		desde,
		hasta,
		terrenoId,
		ganadoId,
	});
	const { data: planes = [], isLoading: isLoadingPlanes } =
		useListarPlanesSanitarios();
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: ganadosData } = useListarGanado({
		page: 1,
		limit: 100,
		soloActivos: true,
	});

	const realizarMutation = useRealizarSesionSanitaria();
	const cancelarMutation = useCancelarSesionSanitaria();
	const generarMutation = useGenerarSesionesPlanes();
	const eliminarPlanMutation = useEliminarPlanSanitario();

	const eventos = calendario?.eventos ?? [];

	// Construir celdas del calendario mensual (empezando lunes)
	const celdasMes = useMemo(() => {
		const year = mesActual.getFullYear();
		const month = mesActual.getMonth();
		const primerDia = new Date(year, month, 1);
		const ultimoDia = new Date(year, month + 1, 0).getDate();
		const offsetLunes = (primerDia.getDay() + 6) % 7;

		const eventosPorDia = new Map<string, CalendarioEventoDto[]>();
		for (const ev of eventos) {
			const clave = ev.fecha.slice(0, 10);
			const lista = eventosPorDia.get(clave) ?? [];
			lista.push(ev);
			eventosPorDia.set(clave, lista);
		}

		const celdas: Array<{
			dia: number | null;
			fechaStr: string;
			eventos: CalendarioEventoDto[];
		}> = [];

		for (let i = 0; i < offsetLunes; i++) {
			celdas.push({ dia: null, fechaStr: `empty-prev-${i}`, eventos: [] });
		}
		for (let d = 1; d <= ultimoDia; d++) {
			const fechaStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			celdas.push({
				dia: d,
				fechaStr,
				eventos: eventosPorDia.get(fechaStr) ?? [],
			});
		}
		return celdas;
	}, [mesActual, eventos]);

	const mesLabel = mesActual.toLocaleDateString("es-MX", {
		month: "long",
		year: "numeric",
	});

	const badgeColor = (ev: CalendarioEventoDto) => {
		if (ev.tipo === "CADUCIDAD_INSUMO") {
			return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
		}
		if (ev.tipo === "TRATAMIENTO_MEDICO") {
			return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
		}
		if (ev.estado === "PROGRAMADA") {
			return "bg-primary/15 text-primary border-primary/30";
		}
		if (ev.estado === "CANCELADA") {
			return "bg-muted text-muted-foreground border-border line-through";
		}
		return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
	};

	const hoyStr = hoy.toISOString().slice(0, 10);

	return (
		<div className="space-y-8 py-4 animate-fade-in text-left">
			{/* Header */}
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<CalendarIcon className="size-5" />
					</div>
					<div>
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
							Calendario Sanitario y Planes
						</h1>
						<p className="text-sm text-muted-foreground">
							Sesiones programadas, vencimiento de tratamientos, caducidades y
							planes de vacunación recurrentes.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<select
						aria-label="Filtrar por terreno"
						value={terrenoId ?? ""}
						onChange={(e) =>
							setTerrenoId(e.target.value ? Number(e.target.value) : undefined)
						}
						className={SELECT_CLASS}
					>
						<option value="">Todos los terrenos</option>
						{(terrenosData?.data ?? []).map((t) => (
							<option key={t.id} value={t.id}>
								{t.nombre}
							</option>
						))}
					</select>

					<select
						aria-label="Filtrar por animal"
						value={ganadoId ?? ""}
						onChange={(e) =>
							setGanadoId(e.target.value ? Number(e.target.value) : undefined)
						}
						className={SELECT_CLASS}
					>
						<option value="">Todos los animales</option>
						{(ganadosData?.data ?? []).map((g) => (
							<option key={g.id} value={g.id}>
								{g.identificador}
							</option>
						))}
					</select>
				</div>
			</section>

			{/* Vista Mensual */}
			<Card className="border border-border bg-card shadow-xs">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle className="text-lg capitalize">{mesLabel}</CardTitle>
					<div className="flex items-center gap-1.5">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								setMesActual(
									(prev) =>
										new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
								)
							}
							className="h-8 w-8 p-0 cursor-pointer"
							aria-label="Mes anterior"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								setMesActual(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
							}
							className="h-8 px-2.5 text-xs cursor-pointer"
						>
							Hoy
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								setMesActual(
									(prev) =>
										new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
								)
							}
							className="h-8 w-8 p-0 cursor-pointer"
							aria-label="Mes siguiente"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
							<Loader2 className="size-5 animate-spin text-primary" />
							Cargando calendario...
						</div>
					) : (
						<div className="overflow-x-auto">
							<div className="min-w-[680px]">
								<div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs font-semibold text-muted-foreground">
									{DIAS_SEMANA.map((d) => (
										<div key={d} className="py-1.5">
											{d}
										</div>
									))}
								</div>
								<div className="grid grid-cols-7 gap-1">
									{celdasMes.map((celda) => (
										<div
											key={celda.fechaStr}
											className={cn(
												"min-h-[92px] p-1.5 rounded-lg border text-xs flex flex-col gap-1",
												celda.dia === null
													? "bg-muted/20 border-transparent"
													: celda.fechaStr === hoyStr
														? "border-primary bg-primary/5"
														: "border-border bg-card/50",
											)}
										>
											{celda.dia !== null && (
												<span
													className={cn(
														"text-[11px] font-bold self-end",
														celda.fechaStr === hoyStr
															? "text-primary"
															: "text-muted-foreground",
													)}
												>
													{celda.dia}
												</span>
											)}
											<div className="space-y-1 overflow-y-auto max-h-20">
												{celda.eventos.slice(0, 3).map((ev) => (
													<div
														key={ev.id}
														title={`${ev.titulo} — ${ev.subtitulo}`}
														className={cn(
															"px-1.5 py-0.5 rounded border text-[10px] font-medium truncate",
															badgeColor(ev),
														)}
													>
														{ev.titulo}
													</div>
												))}
												{celda.eventos.length > 3 && (
													<div className="text-[10px] text-muted-foreground pl-1">
														+{celda.eventos.length - 3} más
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Agenda del Mes */}
			<Card className="border border-border bg-card shadow-xs">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Activity className="size-4 text-primary" />
						Eventos del Mes ({eventos.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{eventos.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							No hay eventos sanitarios registrados para los filtros
							seleccionados.
						</p>
					) : (
						<div className="divide-y divide-border">
							{eventos.map((ev) => (
								<div
									key={ev.id}
									className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
								>
									<div className="flex items-start gap-3">
										<div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
											{ev.tipo === "CADUCIDAD_INSUMO" ? (
												<AlertTriangle className="size-4 text-amber-500" />
											) : ev.tipo === "TRATAMIENTO_MEDICO" ? (
												<Stethoscope className="size-4 text-blue-500" />
											) : (
												<Activity className="size-4 text-primary" />
											)}
										</div>
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-semibold text-sm text-foreground">
													{ev.titulo}
												</span>
												<Badge
													variant="outline"
													className={cn("text-[10px]", badgeColor(ev))}
												>
													{ev.estado}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground">
												{new Date(ev.fecha).toLocaleDateString("es-MX")} ·{" "}
												{ev.subtitulo}
											</p>
										</div>
									</div>

									{canUpdate &&
										ev.tipo === "SESION_SANITARIA" &&
										ev.estado === "PROGRAMADA" && (
											<div className="flex items-center gap-1.5 shrink-0">
												<Button
													type="button"
													size="sm"
													variant="outline"
													onClick={() =>
														realizarMutation.mutate(ev.referenciaId)
													}
													disabled={realizarMutation.isPending}
													className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
												>
													<CheckCircle2 className="size-3.5" />
													Realizar
												</Button>
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() =>
														cancelarMutation.mutate(ev.referenciaId)
													}
													disabled={cancelarMutation.isPending}
													className="h-7 text-xs gap-1 text-amber-600 cursor-pointer"
												>
													<XCircle className="size-3.5" />
													Cancelar
												</Button>
											</div>
										)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Planes de Vacunación Recurrentes */}
			<Card className="border border-border bg-card shadow-xs">
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
					<div>
						<CardTitle className="text-base">
							Planes de Vacunación Recurrentes
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-0.5">
							Generan sesiones sanitarias programadas automáticamente al
							acercarse su fecha de ejecución.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{canCreate && (
							<>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => generarMutation.mutate()}
									disabled={generarMutation.isPending}
									className="gap-1.5 text-xs cursor-pointer"
								>
									{generarMutation.isPending ? (
										<Loader2 className="size-3.5 animate-spin" />
									) : (
										<Play className="size-3.5" />
									)}
									Generar próximas
								</Button>
								<Button
									type="button"
									size="sm"
									onClick={() => setPlanDialogOpen(true)}
									className="gap-1.5 text-xs cursor-pointer"
								>
									<Plus className="size-3.5" />
									Nuevo Plan
								</Button>
							</>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{isLoadingPlanes ? (
						<div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
							<RefreshCw className="size-4 animate-spin" />
							Cargando planes...
						</div>
					) : planes.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							No tienes planes sanitarios configurados todavía.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{planes.map((plan) => (
								<div
									key={plan.id}
									className="p-4 rounded-xl border border-border bg-card/50 flex flex-col justify-between gap-3"
								>
									<div className="space-y-1">
										<div className="flex items-center justify-between gap-2">
											<h3 className="font-bold text-sm text-foreground">
												{plan.nombre}
											</h3>
											<Badge
												variant={plan.activo ? "default" : "secondary"}
												className="text-[10px]"
											>
												{plan.activo ? "Activo" : "Pausado"}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											{plan.descripcion}
										</p>
										<div className="flex flex-wrap gap-2 pt-2 text-[11px] text-muted-foreground">
											<span>Cada {plan.frecuenciaDias} días</span>
											<span>·</span>
											<span>
												{plan.dosisPorAnimal} {plan.unidadMedidaInsumo ?? "u"} /
												animal
											</span>
											<span>·</span>
											<span>
												Próxima:{" "}
												{new Date(plan.proximaEjecucion).toLocaleDateString(
													"es-MX",
												)}
											</span>
										</div>
									</div>

									{canDelete && (
										<div className="flex justify-end">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => eliminarPlanMutation.mutate(plan.id)}
												className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer gap-1"
											>
												<Trash2 className="size-3.5" />
												Eliminar
											</Button>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<PlanSanitarioFormDialog
				open={planDialogOpen}
				onOpenChange={setPlanDialogOpen}
			/>
		</div>
	);
}

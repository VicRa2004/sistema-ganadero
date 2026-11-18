import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	BarChart3,
	Calendar,
	PieChart,
	Stethoscope,
	TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardResumenDto } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";

interface DashboardChartsProps {
	resumen: DashboardResumenDto;
}

const CHART_COLORS = [
	"bg-emerald-500",
	"bg-blue-500",
	"bg-amber-500",
	"bg-violet-500",
	"bg-rose-500",
	"bg-cyan-500",
];

export function DashboardCharts({ resumen }: DashboardChartsProps) {
	const maxRaza = Math.max(1, ...resumen.porRaza.map((r) => r.cantidad));
	const maxEdad = Math.max(1, ...resumen.porRangoEdad.map((e) => e.cantidad));
	const maxMes = Math.max(
		1,
		...resumen.altasYBajasPorMes.flatMap((m) => [m.altas, m.bajas]),
	);
	const machos = resumen.porSexo.find((s) => s.sexo === "MACHO")?.cantidad ?? 0;
	const hembras =
		resumen.porSexo.find((s) => s.sexo === "HEMBRA")?.cantidad ?? 0;
	const totalSexo = Math.max(1, machos + hembras);
	const pctMachos = Math.round((machos / totalSexo) * 100);
	const pctHembras = 100 - pctMachos;

	return (
		<div className="space-y-6 text-left">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Ocupación por Terreno */}
				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<BarChart3 className="size-4 text-primary" />
							Ocupación por Terreno
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{resumen.porTerreno.length === 0 ? (
							<p className="text-xs text-muted-foreground py-4 text-center">
								Sin terrenos registrados.
							</p>
						) : (
							resumen.porTerreno.map((t) => {
								const width = Math.min(100, t.porcentajeOcupacion);
								return (
									<div key={t.terrenoId} className="space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="font-medium text-foreground truncate">
												{t.nombre}
											</span>
											<span className="text-muted-foreground tabular-nums">
												{t.cabezas} / {t.capacidadMaxima} (
												{t.porcentajeOcupacion}
												%)
											</span>
										</div>
										<div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
											<div
												className={cn(
													"h-full rounded-full transition-all duration-500",
													width >= 90
														? "bg-red-500"
														: width >= 70
															? "bg-amber-500"
															: "bg-primary",
												)}
												style={{ width: `${width}%` }}
											/>
										</div>
									</div>
								);
							})
						)}
					</CardContent>
				</Card>

				{/* Altas y Bajas por Mes (Gráfica de Barras SVG) */}
				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<TrendingUp className="size-4 text-primary" />
							Altas y Bajas (Últimos 6 meses)
						</CardTitle>
						<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
							<span className="flex items-center gap-1">
								<span className="size-2.5 rounded-xs bg-emerald-500 inline-block" />
								Altas
							</span>
							<span className="flex items-center gap-1">
								<span className="size-2.5 rounded-xs bg-rose-500 inline-block" />
								Bajas
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-6 gap-2 items-end h-44 pt-4">
							{resumen.altasYBajasPorMes.map((m) => {
								const hAltas = Math.round((m.altas / maxMes) * 100);
								const hBajas = Math.round((m.bajas / maxMes) * 100);
								return (
									<div
										key={m.mes}
										className="flex flex-col items-center gap-1.5 h-full justify-end"
									>
										<div className="flex items-end gap-1 h-32 w-full justify-center">
											<div
												title={`Altas ${m.mes}: ${m.altas}`}
												className="w-3 sm:w-4 rounded-t bg-emerald-500/85 transition-all duration-500 min-h-[2px]"
												style={{ height: `${Math.max(4, hAltas)}%` }}
											/>
											<div
												title={`Bajas ${m.mes}: ${m.bajas}`}
												className="w-3 sm:w-4 rounded-t bg-rose-500/85 transition-all duration-500 min-h-[2px]"
												style={{ height: `${Math.max(4, hBajas)}%` }}
											/>
										</div>
										<span className="text-[10px] text-muted-foreground font-mono">
											{m.mes.slice(2)}
										</span>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Distribución por Raza y Sexo */}
				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<PieChart className="size-4 text-primary" />
							Composición por Raza y Sexo
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						{/* Barra de Sexo */}
						<div className="space-y-2">
							<div className="flex justify-between text-xs font-medium">
								<span className="text-blue-600 dark:text-blue-400">
									Machos: {machos} ({pctMachos}%)
								</span>
								<span className="text-pink-600 dark:text-pink-400">
									Hembras: {hembras} ({pctHembras}%)
								</span>
							</div>
							<div className="h-3 w-full rounded-full overflow-hidden flex bg-muted">
								<div
									className="bg-blue-500 transition-all duration-500"
									style={{ width: `${machos + hembras > 0 ? pctMachos : 50}%` }}
								/>
								<div
									className="bg-pink-500 transition-all duration-500"
									style={{
										width: `${machos + hembras > 0 ? pctHembras : 50}%`,
									}}
								/>
							</div>
						</div>

						{/* Razas */}
						<div className="space-y-2.5">
							{resumen.porRaza.length === 0 ? (
								<p className="text-xs text-muted-foreground text-center py-2">
									Sin animales activos.
								</p>
							) : (
								resumen.porRaza.map((r, i) => (
									<div key={r.razaId} className="space-y-1">
										<div className="flex justify-between text-xs">
											<span className="font-medium text-foreground">
												{r.nombre}
											</span>
											<span className="text-muted-foreground tabular-nums">
												{r.cantidad} cabezas
											</span>
										</div>
										<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
											<div
												className={cn(
													"h-full rounded-full",
													CHART_COLORS[i % CHART_COLORS.length],
												)}
												style={{
													width: `${Math.round((r.cantidad / maxRaza) * 100)}%`,
												}}
											/>
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Rangos de Edad y Motivos de Baja */}
				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<BarChart3 className="size-4 text-primary" />
							Distribución por Edad y Bajas
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2.5">
							{resumen.porRangoEdad.map((e) => (
								<div key={e.rango} className="space-y-1">
									<div className="flex justify-between text-xs">
										<span className="font-medium text-foreground">
											{e.rango}
										</span>
										<span className="text-muted-foreground tabular-nums">
											{e.cantidad}
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
										<div
											className="h-full rounded-full bg-primary/80"
											style={{
												width: `${Math.round((e.cantidad / maxEdad) * 100)}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>

						{resumen.motivosBaja.length > 0 && (
							<div className="pt-3 border-t border-border">
								<p className="text-xs font-semibold text-muted-foreground mb-2">
									Motivos de baja registrados
								</p>
								<div className="flex flex-wrap gap-2">
									{resumen.motivosBaja.map((mb) => (
										<Badge
											key={mb.motivo}
											variant="secondary"
											className="text-xs"
										>
											{mb.motivo}: {mb.cantidad}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Paneles de Alertas Rápidas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<AlertTriangle className="size-4 text-amber-500" />
							Insumos en Alerta
						</CardTitle>
						<Link
							to="/dashboard/insumos"
							className="text-xs text-primary hover:underline font-medium"
						>
							Ir a inventario
						</Link>
					</CardHeader>
					<CardContent className="space-y-2">
						{resumen.insumosAlerta.criticos.length === 0 &&
						resumen.insumosAlerta.porCaducar.length === 0 ? (
							<p className="text-xs text-muted-foreground py-4 text-center">
								Todos los insumos están en niveles óptimos y vigentes.
							</p>
						) : (
							<>
								{resumen.insumosAlerta.criticos.slice(0, 4).map((i) => (
									<div
										key={`crit-${i.id}`}
										className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-xs"
									>
										<span className="font-medium text-foreground">
											{i.nombre}
										</span>
										<Badge variant="destructive" className="text-[10px]">
											{i.stock} / {i.stockMinimo} {i.unidadMedida}
										</Badge>
									</div>
								))}
								{resumen.insumosAlerta.porCaducar.slice(0, 4).map((i) => (
									<div
										key={`cad-${i.id}`}
										className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs"
									>
										<span className="font-medium text-foreground">
											{i.nombre}
										</span>
										<Badge
											variant="outline"
											className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400"
										>
											Caduca: {i.fechaCaducidad.slice(0, 10)}
										</Badge>
									</div>
								))}
							</>
						)}
					</CardContent>
				</Card>

				<Card className="border border-border bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Stethoscope className="size-4 text-primary" />
							Sanidad Próxima
						</CardTitle>
						<Link
							to="/dashboard/calendario-sanitario"
							className="text-xs text-primary hover:underline font-medium"
						>
							Ver calendario
						</Link>
					</CardHeader>
					<CardContent className="space-y-2">
						{resumen.sanidadProxima.sesionesProgramadas.length === 0 &&
						resumen.sanidadProxima.tratamientosPorVencer.length === 0 ? (
							<p className="text-xs text-muted-foreground py-4 text-center">
								No hay sesiones programadas ni tratamientos activos próximos.
							</p>
						) : (
							<>
								{resumen.sanidadProxima.sesionesProgramadas
									.slice(0, 4)
									.map((s) => (
										<div
											key={`ses-${s.id}`}
											className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs gap-2"
										>
											<div className="min-w-0">
												<p className="font-medium text-foreground truncate">
													{s.descripcion}
												</p>
												<p className="text-[11px] text-muted-foreground truncate">
													{s.insumoNombre} · {s.veterinarioNombre}
												</p>
											</div>
											<Badge variant="outline" className="text-[10px] shrink-0">
												<Calendar className="size-3 mr-1" />
												{s.fecha.slice(0, 10)}
											</Badge>
										</div>
									))}
								{resumen.sanidadProxima.tratamientosPorVencer
									.slice(0, 4)
									.map((t) => (
										<div
											key={`trt-${t.id}`}
											className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs gap-2"
										>
											<div className="min-w-0">
												<p className="font-medium text-foreground truncate">
													{t.identificador}: {t.diagnostico}
												</p>
											</div>
											<Badge
												variant="secondary"
												className="text-[10px] shrink-0"
											>
												Fin: {t.fechaFin.slice(0, 10)}
											</Badge>
										</div>
									))}
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

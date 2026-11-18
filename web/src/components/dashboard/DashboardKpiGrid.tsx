import {
	Activity,
	AlertTriangle,
	Scale,
	ShieldAlert,
	Sprout,
	Warehouse,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardTotalesDto } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";

interface DashboardKpiGridProps {
	totales: DashboardTotalesDto;
}

export function DashboardKpiGrid({ totales }: DashboardKpiGridProps) {
	const cards = [
		{
			label: "Cabezas Activas",
			value: String(totales.cabezasActivas),
			subtext: `${totales.cabezasTotales} totales registradas`,
			icon: Sprout,
			tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
		},
		{
			label: "Ocupación Terrenos",
			value: `${totales.ocupacionPorcentaje}%`,
			subtext: `${totales.cabezasActivas} / ${totales.capacidadTotal} cupos (${totales.terrenosCount} terrenos)`,
			icon: Warehouse,
			tone: "text-primary bg-primary/10",
		},
		{
			label: "Peso Promedio y GDP",
			value: `${totales.pesoPromedioKg} kg`,
			subtext:
				totales.gdpPromedioKgDia !== null
					? `GDP promedio: ${totales.gdpPromedioKgDia.toFixed(3)} kg/día`
					: "Sin suficientes pesajes para GDP",
			icon: Scale,
			tone: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
		},
		{
			label: "Alertas de Insumos",
			value: String(
				totales.insumosCriticosCount + totales.insumosPorCaducarCount,
			),
			subtext: `${totales.insumosCriticosCount} bajo mínimo · ${totales.insumosPorCaducarCount} por caducar`,
			icon: AlertTriangle,
			tone:
				totales.insumosCriticosCount > 0
					? "text-red-600 dark:text-red-400 bg-red-500/10"
					: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
		},
		{
			label: "Sanidad Activa",
			value: String(
				totales.tratamientosActivosCount + totales.sesionesProgramadasCount,
			),
			subtext: `${totales.tratamientosActivosCount} tratamientos · ${totales.sesionesProgramadasCount} sesiones prog.`,
			icon: Activity,
			tone: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
		},
		{
			label: "Animales en Retiro",
			value: String(totales.animalesEnRetiroCount),
			subtext: "Con restricción temporal de venta/faena",
			icon: ShieldAlert,
			tone:
				totales.animalesEnRetiroCount > 0
					? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
					: "text-muted-foreground bg-muted",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card
						key={card.label}
						className="border border-border bg-card/60 shadow-xs"
					>
						<CardContent className="p-4 flex items-center gap-3.5 text-left">
							<div
								className={cn(
									"size-11 rounded-xl flex items-center justify-center shrink-0",
									card.tone,
								)}
							>
								<Icon className="size-5" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-medium text-muted-foreground">
									{card.label}
								</p>
								<p className="text-2xl font-extrabold tracking-tight text-foreground">
									{card.value}
								</p>
								<p className="text-[11px] text-muted-foreground truncate">
									{card.subtext}
								</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

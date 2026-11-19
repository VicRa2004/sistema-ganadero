import { useState } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useObtenerRentabilidad } from "@/modules/comercial/hooks/useComercial";

const mxn = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
});

export function RentabilidadSection() {
	const [desde, setDesde] = useState("");
	const [hasta, setHasta] = useState("");

	const { data, isLoading } = useObtenerRentabilidad({
		desde: desde || undefined,
		hasta: hasta || undefined,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
				<Loader2 className="size-5 animate-spin text-primary" />
				Cargando reporte financiero...
			</div>
		);
	}

	const resumen = data?.resumen;

	return (
		<div className="space-y-6 text-left">
			<div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
				<div className="space-y-1">
					<Label htmlFor="rent-desde" className="text-xs">
						Desde
					</Label>
					<Input
						id="rent-desde"
						type="date"
						value={desde}
						onChange={(e) => setDesde(e.target.value)}
						className="h-9 text-xs"
					/>
				</div>
				<div className="space-y-1">
					<Label htmlFor="rent-hasta" className="text-xs">
						Hasta
					</Label>
					<Input
						id="rent-hasta"
						type="date"
						value={hasta}
						onChange={(e) => setHasta(e.target.value)}
						className="h-9 text-xs"
					/>
				</div>
				{(desde || hasta) && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setDesde("");
							setHasta("");
						}}
					>
						Limpiar fechas
					</Button>
				)}
			</div>

			{resumen && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
					<KpiBox
						label="Ingresos por Ventas"
						valor={mxn.format(resumen.ingresosVenta)}
						tone="positive"
					/>
					<KpiBox
						label="Compras de Ganado"
						valor={mxn.format(resumen.costoCompra)}
					/>
					<KpiBox
						label="Gastos Operativos"
						valor={mxn.format(resumen.gastosOperativos)}
					/>
					<KpiBox
						label="Costo de Insumos"
						valor={mxn.format(resumen.costoInsumos)}
					/>
					<KpiBox label="Costo Total" valor={mxn.format(resumen.costoTotal)} />
					<KpiBox
						label="Ganancia Neta"
						valor={mxn.format(resumen.gananciaNeta)}
						sub={
							resumen.margenPorcentaje !== null
								? `Margen ${resumen.margenPorcentaje.toFixed(1)}%`
								: undefined
						}
						tone={resumen.gananciaNeta >= 0 ? "positive" : "negative"}
					/>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-bold">
							Rentabilidad por Terreno
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						{(data?.porTerreno ?? []).length === 0 ? (
							<p className="text-xs text-muted-foreground py-4">
								Sin movimientos por terreno en el período.
							</p>
						) : (
							<table className="w-full text-xs text-left">
								<thead className="bg-muted/50 text-muted-foreground border-b border-border">
									<tr>
										<th className="px-2 py-2">Terreno</th>
										<th className="px-2 py-2 text-right">Ingresos</th>
										<th className="px-2 py-2 text-right">Costo Total</th>
										<th className="px-2 py-2 text-right">Ganancia</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{data?.porTerreno.map((t) => (
										<tr key={t.terrenoId}>
											<td className="px-2 py-2 font-medium">
												{t.terrenoNombre}
											</td>
											<td className="px-2 py-2 text-right tabular-nums">
												{mxn.format(t.ingresosVenta)}
											</td>
											<td className="px-2 py-2 text-right tabular-nums">
												{mxn.format(t.costoTotal)}
											</td>
											<td className="px-2 py-2 text-right font-semibold tabular-nums">
												{mxn.format(t.gananciaNeta)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-bold">
							Flujo por Período Mensual
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						{(data?.porPeriodo ?? []).length === 0 ? (
							<p className="text-xs text-muted-foreground py-4">
								Sin períodos registrados.
							</p>
						) : (
							<table className="w-full text-xs text-left">
								<thead className="bg-muted/50 text-muted-foreground border-b border-border">
									<tr>
										<th className="px-2 py-2">Mes</th>
										<th className="px-2 py-2 text-right">Ingresos</th>
										<th className="px-2 py-2 text-right">Costos</th>
										<th className="px-2 py-2 text-right">Ganancia</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{data?.porPeriodo.map((p) => (
										<tr key={p.periodo}>
											<td className="px-2 py-2 font-medium">{p.periodo}</td>
											<td className="px-2 py-2 text-right tabular-nums">
												{mxn.format(p.ingresosVenta)}
											</td>
											<td className="px-2 py-2 text-right tabular-nums">
												{mxn.format(p.costoTotal)}
											</td>
											<td className="px-2 py-2 text-right font-semibold tabular-nums">
												{mxn.format(p.gananciaNeta)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-bold">
						Rentabilidad por Animal ({data?.porAnimal.length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{(data?.porAnimal ?? []).length === 0 ? (
						<p className="text-xs text-muted-foreground py-4">
							Sin costos o ingresos registrados por animal.
						</p>
					) : (
						<table className="w-full text-xs text-left">
							<thead className="bg-muted/50 text-muted-foreground border-b border-border">
								<tr>
									<th className="px-2 py-2">Arete</th>
									<th className="px-2 py-2 text-right">Compra</th>
									<th className="px-2 py-2 text-right">Gastos</th>
									<th className="px-2 py-2 text-right">Insumos</th>
									<th className="px-2 py-2 text-right">Ingresos</th>
									<th className="px-2 py-2 text-right">Ganancia</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{data?.porAnimal.map((a) => (
									<tr key={a.ganadoId}>
										<td className="px-2 py-2 font-semibold">
											{a.identificador}
										</td>
										<td className="px-2 py-2 text-right tabular-nums">
											{mxn.format(a.costoCompra)}
										</td>
										<td className="px-2 py-2 text-right tabular-nums">
											{mxn.format(a.gastosDirectos)}
										</td>
										<td className="px-2 py-2 text-right tabular-nums">
											{mxn.format(a.costoInsumosAplicados)}
										</td>
										<td className="px-2 py-2 text-right tabular-nums">
											{mxn.format(a.ingresosVenta)}
										</td>
										<td className="px-2 py-2 text-right font-bold tabular-nums">
											{mxn.format(a.gananciaNeta)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function KpiBox({
	label,
	valor,
	sub,
	tone = "neutral",
}: {
	label: string;
	valor: string;
	sub?: string;
	tone?: "neutral" | "positive" | "negative";
}) {
	return (
		<div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
			<p className="text-[11px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
				{tone === "positive" && (
					<TrendingUp className="size-3.5 text-emerald-500" />
				)}
				{tone === "negative" && (
					<TrendingDown className="size-3.5 text-destructive" />
				)}
				{label}
			</p>
			<p
				className={`text-base font-bold mt-1 tabular-nums ${
					tone === "positive"
						? "text-emerald-600 dark:text-emerald-400"
						: tone === "negative"
							? "text-destructive"
							: "text-foreground"
				}`}
			>
				{valor}
			</p>
			{sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
		</div>
	);
}

import { DollarSign, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import { useRentabilidadGanado } from "@/modules/comercial/hooks/useComercial";

interface RentabilidadGanadoCardProps {
	ganadoId: number;
}

const mxn = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
});

export function RentabilidadGanadoCard({
	ganadoId,
}: RentabilidadGanadoCardProps) {
	const { can } = usePermissions();
	const canReadComercial = can("comercial", "read");

	const { data, isLoading } = useRentabilidadGanado(
		ganadoId,
		canReadComercial && ganadoId > 0,
	);

	if (!canReadComercial) return null;

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg font-bold">
					<DollarSign className="size-5 text-primary" />
					Rentabilidad Individual del Animal
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
						<Loader2 className="size-4 animate-spin" />
						Calculando rentabilidad...
					</div>
				) : !data ? (
					<p className="text-sm text-muted-foreground">
						Sin datos financieros disponibles para este animal.
					</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold">
								Compra
							</p>
							<p className="text-sm font-bold tabular-nums">
								{mxn.format(data.costoCompra)}
							</p>
						</div>
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold">
								Gastos Directos
							</p>
							<p className="text-sm font-bold tabular-nums">
								{mxn.format(data.gastosDirectos)}
							</p>
						</div>
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold">
								Insumos Aplicados
							</p>
							<p className="text-sm font-bold tabular-nums">
								{mxn.format(data.costoInsumosAplicados)}
							</p>
						</div>
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold">
								Costo Total
							</p>
							<p className="text-sm font-bold tabular-nums">
								{mxn.format(data.costoTotal)}
							</p>
						</div>
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold">
								Ingresos Venta
							</p>
							<p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
								{mxn.format(data.ingresosVenta)}
							</p>
						</div>
						<div className="p-3 rounded-lg border border-border bg-muted/20">
							<p className="text-[11px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
								{data.gananciaNeta >= 0 ? (
									<TrendingUp className="size-3.5 text-emerald-500" />
								) : (
									<TrendingDown className="size-3.5 text-destructive" />
								)}
								Ganancia Neta
							</p>
							<p
								className={`text-sm font-bold tabular-nums ${
									data.gananciaNeta >= 0
										? "text-emerald-600 dark:text-emerald-400"
										: "text-destructive"
								}`}
							>
								{mxn.format(data.gananciaNeta)}
								{data.margenPorcentaje !== null && (
									<span className="block text-[11px] font-normal text-muted-foreground">
										Margen: {data.margenPorcentaje.toFixed(1)}%
									</span>
								)}
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

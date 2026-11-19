import { AlertTriangle, CheckCircle2, Wheat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AutonomiaAlimentoDto } from "@/modules/alimentacion/types";

interface AutonomiaCardsProps {
	items: AutonomiaAlimentoDto[];
}

export function AutonomiaCards({ items }: AutonomiaCardsProps) {
	if (items.length === 0) {
		return (
			<p className="text-xs text-muted-foreground rounded-lg border border-dashed p-4 text-center">
				No hay raciones activas para calcular autonomía alimentaria.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
			{items.map((item) => (
				<div
					key={item.insumoId}
					className={`rounded-xl border p-4 space-y-2 ${
						item.enAlerta
							? "border-amber-500/50 bg-amber-500/10"
							: "border-border bg-card"
					}`}
				>
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 font-bold text-sm">
							<Wheat className="size-4 text-primary" />
							{item.insumoNombre}
						</div>
						<Badge variant={item.enAlerta ? "destructive" : "outline"}>
							{item.enAlerta ? (
								<span className="flex items-center gap-1">
									<AlertTriangle className="size-3" /> Alerta
								</span>
							) : (
								<span className="flex items-center gap-1">
									<CheckCircle2 className="size-3" /> OK
								</span>
							)}
						</Badge>
					</div>

					<div className="text-xs space-y-1 text-muted-foreground">
						<p>
							Stock:{" "}
							<strong className="text-foreground">
								{item.stock} {item.unidadMedida}
							</strong>
						</p>
						<p>
							Consumo esperado/día:{" "}
							<strong className="text-foreground">
								{item.consumoDiarioEsperado} {item.unidadMedida}
							</strong>
						</p>
						<p>
							Autonomía:{" "}
							<strong className="text-foreground">
								{item.diasAutonomia !== null
									? `${item.diasAutonomia.toFixed(1)} días`
									: "Sin consumo activo"}
							</strong>{" "}
							(umbral: {item.umbralAlertaDias}d)
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

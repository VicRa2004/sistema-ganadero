import { Scale, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useListarPesajes } from "@/modules/ganado/hooks/useListarPesajes";
import type { PesajeDto } from "@/modules/ganado/types";
import { cn } from "@/lib/utils";

const W = 600;
const H = 160;
const PAD = 24;

function Grafica({ pesajes }: { pesajes: PesajeDto[] }) {
	const tiempos = pesajes.map((p) => new Date(p.fecha).getTime());
	const pesos = pesajes.map((p) => p.peso);
	const [t0, t1] = [Math.min(...tiempos), Math.max(...tiempos)];
	const [p0, p1] = [Math.min(...pesos), Math.max(...pesos)];
	const x = (t: number) =>
		t1 === t0 ? W / 2 : PAD + ((t - t0) / (t1 - t0)) * (W - 2 * PAD);
	const y = (p: number) =>
		p1 === p0 ? H / 2 : H - PAD - ((p - p0) / (p1 - p0)) * (H - 2 * PAD);
	const puntos = pesajes.map((p, i) => [x(tiempos[i]), y(p.peso)] as const);

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className="w-full h-40 text-primary"
			role="img"
			aria-label="Evolución del peso"
		>
			<polyline
				points={puntos.map(([px, py]) => `${px},${py}`).join(" ")}
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
			/>
			{puntos.map(([px, py], i) => (
				<circle key={pesajes[i].id} cx={px} cy={py} r={3.5} fill="currentColor">
					<title>{`${pesajes[i].peso} kg · ${new Date(pesajes[i].fecha).toLocaleDateString()}`}</title>
				</circle>
			))}
		</svg>
	);
}

export function HistorialPesajesCard({ ganadoId }: { ganadoId: number }) {
	const { data, isLoading, isError } = useListarPesajes(ganadoId);
	const pesajes = data?.pesajes ?? [];
	const comp = data?.comparacionRazaEdad;

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Scale className="size-4 text-primary" />
					Historial de pesajes
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading && (
					<p className="text-sm text-muted-foreground">Cargando…</p>
				)}
				{isError && (
					<p className="text-sm text-destructive">
						No se pudo cargar el historial.
					</p>
				)}
				{data && pesajes.length === 0 && (
					<p className="text-sm text-muted-foreground">Sin pesajes todavía.</p>
				)}
				{data && pesajes.length > 0 && (
					<>
						{data.perdidaDePeso && (
							<p className="flex items-center gap-2 text-sm font-medium text-destructive">
								<TrendingDown className="size-4" />
								El último pesaje es menor que el anterior.
							</p>
						)}
						<div className="flex flex-wrap gap-3">
							{data.gananciaDiariaAcumulada !== null && (
								<div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
									<span className="text-muted-foreground">
										Ganancia diaria acumulada:{" "}
									</span>
									<span className="font-semibold text-foreground">
										{data.gananciaDiariaAcumulada.toFixed(2)} kg/día
									</span>
								</div>
							)}
							{comp && (
								<div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex items-center gap-2">
									<Users className="size-4 text-muted-foreground shrink-0" />
									{comp.promedioRazaEdad !== null &&
									comp.diferenciaKg !== null ? (
										<span>
											Promedio {comp.razaNombre} ({comp.edadMeses} m ±3):{" "}
											<strong className="text-foreground">
												{comp.promedioRazaEdad} kg
											</strong>{" "}
											<span
												className={cn(
													"inline-flex items-center gap-0.5 font-semibold",
													comp.diferenciaKg >= 0
														? "text-emerald-600 dark:text-emerald-400"
														: "text-amber-600 dark:text-amber-400",
												)}
											>
												{comp.diferenciaKg >= 0 ? (
													<TrendingUp className="size-3.5" />
												) : (
													<TrendingDown className="size-3.5" />
												)}
												{comp.diferenciaKg >= 0 ? "+" : ""}
												{comp.diferenciaKg} kg (
												{comp.porcentajeDiferencia !== null
													? `${comp.porcentajeDiferencia >= 0 ? "+" : ""}${comp.porcentajeDiferencia}%`
													: ""}
												)
											</span>{" "}
											<span className="text-xs text-muted-foreground">
												· muestra: {comp.cantidadMuestra}
											</span>
										</span>
									) : (
										<span className="text-muted-foreground">
											Sin pares de {comp.razaNombre} ({comp.edadMeses} m ±3)
											para comparar
										</span>
									)}
								</div>
							)}
						</div>
						<Grafica pesajes={pesajes} />
						<Table className="min-w-[420px]">
							<TableHeader>
								<TableRow>
									<TableHead>Fecha</TableHead>
									<TableHead className="text-right">Peso (kg)</TableHead>
									<TableHead className="text-right">GDP (kg/día)</TableHead>
									<TableHead>Observaciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...pesajes].reverse().map((p) => (
									<TableRow key={p.id}>
										<TableCell>
											{new Date(p.fecha).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">{p.peso}</TableCell>
										<TableCell className="text-right">
											{p.gananciaDiaria === null
												? "—"
												: p.gananciaDiaria.toFixed(2)}
										</TableCell>
										<TableCell>{p.observaciones ?? ""}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</>
				)}
			</CardContent>
		</Card>
	);
}

import { Scale, TrendingDown } from "lucide-react";
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
						{data.gananciaDiariaAcumulada !== null && (
							<p className="text-sm text-muted-foreground">
								Ganancia diaria acumulada:{" "}
								<span className="font-semibold text-foreground">
									{data.gananciaDiariaAcumulada.toFixed(2)} kg/día
								</span>
							</p>
						)}
						<Grafica pesajes={pesajes} />
						<Table>
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

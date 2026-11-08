import { Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useObtenerTratamientosGanado } from "@/modules/tratamiento-medico/hooks/useObtenerTratamientosGanado";
import type { TratamientoMedicoDto } from "@/modules/tratamiento-medico/types";

export interface HistorialTratamientosCardProps {
	ganadoId: number;
	tratamientos?: TratamientoMedicoDto[];
	isLoading?: boolean;
	isError?: boolean;
}

export function HistorialTratamientosCard({
	ganadoId,
	tratamientos: tratamientosProp,
	isLoading: isLoadingProp,
	isError: isErrorProp,
}: HistorialTratamientosCardProps) {
	const hasProvidedState =
		tratamientosProp !== undefined ||
		isLoadingProp !== undefined ||
		isErrorProp !== undefined;

	const query = useObtenerTratamientosGanado(hasProvidedState ? 0 : ganadoId);

	const tratamientos = tratamientosProp ?? query.data ?? [];
	const isLoading = isLoadingProp ?? query.isLoading;
	const isError = isErrorProp ?? query.isError;

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Stethoscope className="size-4 text-primary" />
					Tratamientos médicos
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading && (
					<p className="text-sm text-muted-foreground">Cargando…</p>
				)}
				{isError && (
					<p className="text-sm text-destructive">
						No se pudo cargar los tratamientos médicos.
					</p>
				)}
				{!isLoading && !isError && tratamientos.length === 0 && (
					<p className="text-sm text-muted-foreground">
						Sin tratamientos médicos registrados.
					</p>
				)}
				{!isLoading && !isError && tratamientos.length > 0 && (
					<Table className="min-w-[640px]">
						<TableHeader>
							<TableRow>
								<TableHead>Diagnóstico</TableHead>
								<TableHead>Medicamento &amp; Dosis</TableHead>
								<TableHead>Periodo</TableHead>
								<TableHead>Veterinario</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-right">Detalle</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tratamientos.map((t) => (
								<TableRow key={t.id}>
									<TableCell className="font-medium text-foreground">
										{t.diagnostico}
									</TableCell>
									<TableCell>
										<div className="font-medium text-foreground">
											{t.insumoNombre ?? `Insumo #${t.insumoId}`}
										</div>
										<div className="text-xs text-muted-foreground">
											{t.dosisDiaria} {t.insumoUnidad ?? "unidades"}
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{new Date(t.fechaInicio).toLocaleDateString("es-MX")} –{" "}
										{new Date(t.fechaFin).toLocaleDateString("es-MX")}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{t.veterinarioNombre ?? "—"}
									</TableCell>
									<TableCell>
										{t.activo ? (
											<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2 py-0.5 text-xs font-semibold">
												Activo
											</Badge>
										) : (
											<Badge
												variant="secondary"
												className="bg-muted text-muted-foreground gap-1 px-2 py-0.5 text-xs"
											>
												<CheckCircle2 className="size-3" />
												Concluido
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-right">
										<Link
											to="/dashboard/tratamientos-medicos/$id"
											params={{ id: String(t.id) }}
											className={cn(
												buttonVariants({ variant: "ghost", size: "sm" }),
												"h-7 px-2 text-xs gap-1 cursor-pointer",
											)}
										>
											<Eye className="size-3.5" />
											Ver
										</Link>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}

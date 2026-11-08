import { Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useObtenerHistorialSanitarioGanado } from "@/modules/sesion-sanitaria/hooks/useObtenerHistorialSanitarioGanado";
import type { HistorialSanitarioGanadoDto } from "@/modules/sesion-sanitaria/types";

export interface HistorialSanitarioCardProps {
	ganadoId: number;
	historial?: HistorialSanitarioGanadoDto[];
	isLoading?: boolean;
	isError?: boolean;
}

export function HistorialSanitarioCard({
	ganadoId,
	historial: historialProp,
	isLoading: isLoadingProp,
	isError: isErrorProp,
}: HistorialSanitarioCardProps) {
	const hasProvidedState =
		historialProp !== undefined ||
		isLoadingProp !== undefined ||
		isErrorProp !== undefined;

	const query = useObtenerHistorialSanitarioGanado(
		hasProvidedState ? null : ganadoId,
	);

	const historial = historialProp ?? query.data ?? [];
	const isLoading = isLoadingProp ?? query.isLoading;
	const isError = isErrorProp ?? query.isError;

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Syringe className="size-4 text-primary" />
					Historial sanitario
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading && (
					<p className="text-sm text-muted-foreground">Cargando…</p>
				)}
				{isError && (
					<p className="text-sm text-destructive">
						No se pudo cargar el historial sanitario.
					</p>
				)}
				{!isLoading && !isError && historial.length === 0 && (
					<p className="text-sm text-muted-foreground">
						Sin aplicaciones sanitarias registradas.
					</p>
				)}
				{!isLoading && !isError && historial.length > 0 && (
					<Table className="min-w-[600px]">
						<TableHeader>
							<TableRow>
								<TableHead>Fecha</TableHead>
								<TableHead>Sesión / Motivo</TableHead>
								<TableHead>Insumo</TableHead>
								<TableHead>Dosis</TableHead>
								<TableHead>Veterinario</TableHead>
								<TableHead>Observaciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{historial.map((h) => (
								<TableRow key={h.aplicacionId}>
									<TableCell>
										{new Date(h.fechaSesion).toLocaleDateString("es-MX")}
									</TableCell>
									<TableCell className="font-medium text-foreground">
										{h.descripcionSesion}
									</TableCell>
									<TableCell>{h.nombreInsumo ?? "—"}</TableCell>
									<TableCell>
										{h.dosisAplicada} {h.unidadMedidaInsumo ?? "dosis"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{h.nombreVeterinario ?? "—"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{h.observaciones ?? "—"}
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

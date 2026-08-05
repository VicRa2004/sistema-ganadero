import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useObtenerDetalleTratamiento } from "@/modules/tratamiento-medico/hooks/useObtenerDetalleTratamiento";
import {
	Activity,
	Calendar,
	CheckCircle2,
	Clock,
	Database,
	Loader2,
	Pill,
	Sprout,
	Stethoscope,
	UserCheck,
} from "lucide-react";

interface DetalleTratamientoModalProps {
	tratamientoId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DetalleTratamientoModal({
	tratamientoId,
	open,
	onOpenChange,
}: DetalleTratamientoModalProps) {
	const { data: tratamiento, isLoading } = useObtenerDetalleTratamiento(
		tratamientoId ?? 0,
	);

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "-";
		const d = new Date(dateStr);
		return d.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground text-lg">
						<Stethoscope className="size-5 text-primary" />
						Ficha de Tratamiento Médico #{tratamientoId}
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground text-xs">
						<Loader2 className="size-6 animate-spin text-primary" />
						<span>Cargando detalle del tratamiento...</span>
					</div>
				) : !tratamiento ? (
					<div className="py-6 text-center text-xs text-muted-foreground">
						No se encontró la información de este tratamiento.
					</div>
				) : (
					<div className="space-y-4 py-2">
						{/* Header de Estado y Padecimiento */}
						<div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
							<div>
								<span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
									Diagnóstico
								</span>
								<h3 className="text-base font-bold text-foreground">
									{tratamiento.diagnostico}
								</h3>
							</div>

							<div className="shrink-0">
								{tratamiento.activo ? (
									<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1 font-semibold">
										<span className="relative flex h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
										</span>
										Tratamiento Activo
									</Badge>
								) : (
									<Badge
										variant="secondary"
										className="bg-muted text-muted-foreground gap-1.5 px-3 py-1"
									>
										<CheckCircle2 className="size-3.5" />
										Concluido
									</Badge>
								)}
							</div>
						</div>

						{/* Grid de Información Principal */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							{/* Animal Paciente */}
							<div className="bg-muted/40 p-3 rounded-lg border border-border flex items-start gap-2.5">
								<Sprout className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
								<div>
									<p className="font-semibold text-foreground">
										Paciente (Ganado)
									</p>
									<p className="text-muted-foreground font-medium">
										{tratamiento.ganadoIdentificador ??
											`Animal #${tratamiento.ganadoId}`}
									</p>
								</div>
							</div>

							{/* Medicamento Recetado */}
							<div className="bg-muted/40 p-3 rounded-lg border border-border flex items-start gap-2.5">
								<Pill className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
								<div>
									<p className="font-semibold text-foreground">
										Medicamento Recetado
									</p>
									<p className="text-muted-foreground font-medium">
										{tratamiento.insumoNombre ??
											`Insumo #${tratamiento.insumoId}`}
									</p>
									<p className="text-[11px] text-muted-foreground/70">
										Dosis diaria: {tratamiento.dosisDiaria}{" "}
										{tratamiento.insumoUnidad ?? "unidades"}
									</p>
								</div>
							</div>

							{/* Periodo de Administración */}
							<div className="bg-muted/40 p-3 rounded-lg border border-border flex items-start gap-2.5">
								<Calendar className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
								<div>
									<p className="font-semibold text-foreground">
										Duración del Tratamiento
									</p>
									<p className="text-muted-foreground font-medium">
										Del {formatDate(tratamiento.fechaInicio)} al{" "}
										{formatDate(tratamiento.fechaFin)}
									</p>
								</div>
							</div>

							{/* Veterinario Prescriptor */}
							<div className="bg-muted/40 p-3 rounded-lg border border-border flex items-start gap-2.5">
								<UserCheck className="size-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
								<div>
									<p className="font-semibold text-foreground">
										Médico Veterinario
									</p>
									<p className="text-muted-foreground font-medium">
										{tratamiento.veterinarioNombre ?? "Sin asignar"}
									</p>
								</div>
							</div>
						</div>

						{/* Pie de modal */}
						<div className="flex justify-end pt-3 border-t border-border">
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="cursor-pointer text-xs"
							>
								Cerrar
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

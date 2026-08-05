import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useObtenerDetalleTratamiento } from "@/modules/tratamiento-medico/hooks/useObtenerDetalleTratamiento";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Loader2,
	Pill,
	Sprout,
	Stethoscope,
	UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/tratamientos-medicos/$id")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("tratamientos-medicos:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: TratamientoDetalleRouteComponent,
});

function TratamientoDetalleRouteComponent() {
	const { id } = Route.useParams();
	const tratamientoId = Number.parseInt(id, 10);
	const { data: tratamiento, isLoading } =
		useObtenerDetalleTratamiento(tratamientoId);

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
		<div className="space-y-4 py-6 max-w-3xl mx-auto">
			<Link
				to="/dashboard/tratamientos-medicos"
				className={cn(
					buttonVariants({ variant: "ghost", size: "sm" }),
					"gap-2 -ml-2 mb-2 cursor-pointer",
				)}
			>
				<ArrowLeft className="size-4" />
				Volver a Tratamientos Médicos
			</Link>

			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-xs gap-2">
					<Loader2 className="size-6 animate-spin text-primary" />
					<span>Cargando detalle del tratamiento #{id}...</span>
				</div>
			) : !tratamiento ? (
				<div className="bg-card p-8 rounded-xl border border-border text-center text-xs text-muted-foreground">
					No se encontró el tratamiento médico especificado.
				</div>
			) : (
				<div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-6">
					<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-border">
						<div>
							<div className="flex items-center gap-2">
								<Stethoscope className="size-5 text-primary" />
								<h1 className="text-xl font-bold text-foreground">
									Tratamiento Médico #{tratamiento.id}
								</h1>
							</div>
							<p className="text-xs text-muted-foreground mt-0.5">
								Receta médica e intervención de salud individualizada.
							</p>
						</div>

						<div>
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

					<div className="space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
							Diagnóstico Prescripto
						</span>
						<p className="text-base font-semibold text-foreground bg-muted/30 p-3 rounded-lg border border-border">
							{tratamiento.diagnostico}
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div className="p-3 bg-muted/20 rounded-lg border border-border flex items-start gap-3">
							<Sprout className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
							<div>
								<p className="font-semibold text-foreground">Animal Paciente</p>
								<p className="text-muted-foreground font-medium">
									{tratamiento.ganadoIdentificador ??
										`Animal #${tratamiento.ganadoId}`}
								</p>
							</div>
						</div>

						<div className="p-3 bg-muted/20 rounded-lg border border-border flex items-start gap-3">
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

						<div className="p-3 bg-muted/20 rounded-lg border border-border flex items-start gap-3">
							<Calendar className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
							<div>
								<p className="font-semibold text-foreground">
									Vigencia del Tratamiento
								</p>
								<p className="text-muted-foreground font-medium">
									Del {formatDate(tratamiento.fechaInicio)} al{" "}
									{formatDate(tratamiento.fechaFin)}
								</p>
							</div>
						</div>

						<div className="p-3 bg-muted/20 rounded-lg border border-border flex items-start gap-3">
							<UserCheck className="size-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
							<div>
								<p className="font-semibold text-foreground">
									Veterinario Responsable
								</p>
								<p className="text-muted-foreground font-medium">
									{tratamiento.veterinarioNombre ?? "Sin asignar"}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

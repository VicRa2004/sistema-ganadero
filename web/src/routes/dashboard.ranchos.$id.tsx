import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useObtenerDetalleRancho } from "@/modules/rancho/hooks/useObtenerDetalleRancho";
import { useObtenerCapacidadRancho } from "@/modules/rancho/hooks/useObtenerCapacidadRancho";
import { RanchoFormDialog } from "@/components/rancho/RanchoFormDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Pencil,
	Warehouse,
	MapPin,
	Maximize2,
	Users,
	Loader2,
	Percent,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/ranchos/$id")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("rancho:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: DetalleRanchoComponent,
});

function DetalleRanchoComponent() {
	const { id } = Route.useParams();
	const ranchoId = Number(id);

	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canUpdate = permissions.includes("rancho:update");

	const {
		data: rancho,
		isLoading: isLoadingDetalle,
		isError: isErrorDetalle,
	} = useObtenerDetalleRancho(ranchoId);

	const {
		data: capacidad,
		isLoading: isLoadingCapacidad,
		isError: isErrorCapacidad,
	} = useObtenerCapacidadRancho(ranchoId);

	const [isEditOpen, setIsEditOpen] = useState(false);

	const isLoading = isLoadingDetalle || isLoadingCapacidad;
	const isError = isErrorDetalle || isErrorCapacidad;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
				<Loader2 className="size-5 animate-spin" />
				<span className="text-sm">Cargando información del rancho...</span>
			</div>
		);
	}

	if (isError || !rancho || !capacidad) {
		return (
			<div className="space-y-4 py-6 animate-fade-in">
				<Link
					to="/dashboard/ranchos"
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"gap-2 -ml-2 mb-4 cursor-pointer",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Ranchos
				</Link>
				<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
					No se pudo cargar la información del rancho. Verifica que exista o
					regresa a la lista.
				</div>
			</div>
		);
	}

	// Calcular porcentaje de ocupación
	const ocupacionPorcentaje = Math.min(
		100,
		Math.round(
			(capacidad.cabezasGanadoActuales / capacidad.capacidadMaxima) * 100,
		),
	);

	// Determinar color de la barra de progreso
	let progressColor = "bg-emerald-500";
	let badgeVariant: "default" | "secondary" | "destructive" = "default";
	if (ocupacionPorcentaje >= 90) {
		progressColor = "bg-rose-500";
		badgeVariant = "destructive";
	} else if (ocupacionPorcentaje >= 70) {
		progressColor = "bg-amber-500";
		badgeVariant = "secondary";
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado con navegación */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<Link
					to="/dashboard/ranchos"
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"gap-2 -ml-2 w-fit cursor-pointer",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Ranchos
				</Link>

				{canUpdate && (
					<Button
						onClick={() => setIsEditOpen(true)}
						variant="outline"
						className="gap-2 cursor-pointer"
					>
						<Pencil className="size-4" />
						Editar Rancho
					</Button>
				)}
			</div>

			{/* Tarjeta principal del rancho */}
			<Card className="border border-border bg-card/60 shadow-sm relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-primary/60" />
				<CardHeader className="flex flex-row items-start gap-4 pb-4">
					<div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
						<Warehouse className="size-7" />
					</div>
					<div className="text-left space-y-1">
						<CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
							{rancho.nombre}
						</CardTitle>
						<div className="flex flex-wrap gap-2 pt-1">
							<Badge variant="secondary" className="gap-1.5">
								<Maximize2 className="size-3" />
								{rancho.extensionHectareas} Hectáreas
							</Badge>
							<Badge variant={badgeVariant} className="gap-1.5">
								<Percent className="size-3" />
								{ocupacionPorcentaje}% Ocupado
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
							<MapPin className="size-4 text-muted-foreground shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground">Ubicación</p>
								<p className="text-sm font-medium">{rancho.ubicacion}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
							<Users className="size-4 text-muted-foreground shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground">
									Capacidad Máxima
								</p>
								<p className="text-sm font-medium">
									{rancho.capacidadMaxima} cabezas
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Sección de Capacidad y Ocupación */}
			<Card className="border border-border bg-card/40 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg font-bold text-foreground">
						Estado de Capacidad
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Estadísticas rápidas */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="p-4 rounded-xl bg-background border border-border/50 text-left">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Cabezas Actuales
							</p>
							<p className="text-2xl font-extrabold mt-1 text-foreground">
								{capacidad.cabezasGanadoActuales}
							</p>
						</div>
						<div className="p-4 rounded-xl bg-background border border-border/50 text-left">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Capacidad Límite
							</p>
							<p className="text-2xl font-extrabold mt-1 text-foreground">
								{capacidad.capacidadMaxima}
							</p>
						</div>
						<div className="p-4 rounded-xl bg-background border border-border/50 text-left">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Espacio Disponible
							</p>
							<p
								className={cn(
									"text-2xl font-extrabold mt-1",
									capacidad.espacioDisponible <= 0
										? "text-destructive"
										: "text-emerald-500",
								)}
							>
								{capacidad.espacioDisponible}
							</p>
						</div>
					</div>

					{/* Barra de progreso de capacidad */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								Progreso de ocupación
							</span>
							<span className="font-semibold text-foreground">
								{ocupacionPorcentaje}%
							</span>
						</div>
						<div className="w-full h-3 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-500 ease-out",
									progressColor,
								)}
								style={{ width: `${ocupacionPorcentaje}%` }}
							/>
						</div>
						{ocupacionPorcentaje >= 90 ? (
							<p className="text-xs text-rose-500 font-medium">
								⚠️ El rancho está al límite de su capacidad máxima permitida.
								Evita ingresar más ganado.
							</p>
						) : ocupacionPorcentaje >= 70 ? (
							<p className="text-xs text-amber-500 font-medium">
								💡 La capacidad se está acercando al límite recomendado.
							</p>
						) : (
							<p className="text-xs text-emerald-500 font-medium">
								✅ Capacidad adecuada. Hay suficiente espacio disponible.
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Dialog de edición */}
			<RanchoFormDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				rancho={rancho}
			/>
		</div>
	);
}

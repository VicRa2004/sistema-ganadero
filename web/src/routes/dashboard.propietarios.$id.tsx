import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useObtenerDetallePropietario } from "@/modules/propietario/hooks/useObtenerDetallePropietario";
import { PropietarioFormDialog } from "@/components/propietario/PropietarioFormDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft,
	Pencil,
	User,
	Phone,
	Mail,
	Sprout,
	Warehouse,
	Loader2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/propietarios/$id")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("propietario:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: DetallePropietarioComponent,
});

function DetallePropietarioComponent() {
	const { id } = Route.useParams();
	const propietarioId = Number(id);

	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canUpdate = permissions.includes("propietario:update");

	const {
		data: propietario,
		isLoading,
		isError,
	} = useObtenerDetallePropietario(propietarioId);

	const [isEditOpen, setIsEditOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
				<Loader2 className="size-5 animate-spin" />
				<span className="text-sm">Cargando información del propietario...</span>
			</div>
		);
	}

	if (isError || !propietario) {
		return (
			<div className="space-y-4 py-6 animate-fade-in">
				<Link
					to="/dashboard/propietarios"
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"gap-2 -ml-2 mb-4",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Propietarios
				</Link>
				<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
					No se pudo cargar la información del propietario. Verifica que exista
					o regresa a la lista.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado con navegación */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<Link
					to="/dashboard/propietarios"
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"gap-2 -ml-2 w-fit",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Propietarios
				</Link>

				{canUpdate && (
					<Button
						onClick={() => setIsEditOpen(true)}
						variant="outline"
						className="gap-2"
					>
						<Pencil className="size-4" />
						Editar Propietario
					</Button>
				)}
			</div>

			{/* Tarjeta principal del propietario */}
			<Card className="border border-border bg-card/60 shadow-sm relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-primary/60" />
				<CardHeader className="flex flex-row items-start gap-4 pb-4">
					{propietario.imagenMarca ? (
						<div className="size-14 rounded-xl border border-border bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-sm">
							<img
								src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}${propietario.imagenMarca}`}
								alt={`Marca de ${propietario.nombre}`}
								className="size-full object-contain"
							/>
						</div>
					) : (
						<div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
							<User className="size-7" />
						</div>
					)}
					<div className="text-left space-y-1">
						<CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
							{propietario.nombre}
						</CardTitle>
						<div className="flex flex-wrap gap-2 pt-1">
							<Badge variant="secondary" className="gap-1.5">
								<Sprout className="size-3" />
								{propietario.cantidadGanado} cabezas de ganado
							</Badge>
							<Badge variant="secondary" className="gap-1.5">
								<Warehouse className="size-3" />
								{propietario.cantidadTerrenos} terrenos
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
							<Phone className="size-4 text-muted-foreground shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground">Teléfono</p>
								<p className="text-sm font-medium">
									{propietario.telefono ?? (
										<span className="text-muted-foreground italic">
											No registrado
										</span>
									)}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
							<Mail className="size-4 text-muted-foreground shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground">Correo</p>
								<p className="text-sm font-medium break-all">
									{propietario.correo ?? (
										<span className="text-muted-foreground italic">
											No registrado
										</span>
									)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de Ganado Asociado */}
			<section className="space-y-4">
				<h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
					<Sprout className="size-5 text-primary" />
					Ganado Asociado
					<Badge variant="outline" className="ml-1">
						{propietario.cantidadGanado}
					</Badge>
				</h2>

				{propietario.ganados.length === 0 ? (
					<p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
						Este propietario no tiene ganado registrado.
					</p>
				) : (
					<div className="rounded-xl border border-border overflow-hidden shadow-sm">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40 hover:bg-muted/40">
									<TableHead className="font-semibold text-foreground">
										ID
									</TableHead>
									<TableHead className="font-semibold text-foreground">
										Identificador
									</TableHead>
									<TableHead className="font-semibold text-foreground">
										Sexo
									</TableHead>
									<TableHead className="font-semibold text-foreground text-right">
										Peso (kg)
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{propietario.ganados.map((g) => (
									<TableRow
										key={g.id}
										className="hover:bg-muted/20 transition-colors"
									>
										<TableCell className="text-muted-foreground text-sm">
											#{g.id}
										</TableCell>
										<TableCell className="font-medium">
											{g.identificador}
										</TableCell>
										<TableCell>
											<Badge
												variant={g.sexo === "MACHO" ? "default" : "secondary"}
												className="text-xs"
											>
												{g.sexo}
											</Badge>
										</TableCell>
										<TableCell className="text-right font-medium">
											{g.peso.toLocaleString("es-MX")} kg
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</section>

			{/* Tabla de Terrenos Asociados */}
			<section className="space-y-4">
				<h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
					<Warehouse className="size-5 text-primary" />
					Terrenos Asociados
					<Badge variant="outline" className="ml-1">
						{propietario.cantidadTerrenos}
					</Badge>
				</h2>

				{propietario.terrenos.length === 0 ? (
					<p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
						Este propietario no tiene terrenos asignados.
					</p>
				) : (
					<div className="rounded-xl border border-border overflow-hidden shadow-sm">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40 hover:bg-muted/40">
									<TableHead className="font-semibold text-foreground text-left">
										ID
									</TableHead>
									<TableHead className="font-semibold text-foreground text-left">
										Nombre
									</TableHead>
									<TableHead className="font-semibold text-foreground text-left">
										Ubicación
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{propietario.terrenos.map((r) => (
									<TableRow
										key={r.id}
										className="hover:bg-muted/20 transition-colors"
									>
										<TableCell className="text-muted-foreground text-sm text-left">
											#{r.id}
										</TableCell>
										<TableCell className="font-medium text-left">
											{r.nombre}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm text-left">
											{r.ubicacion}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</section>

			{/* Dialog de edición */}
			<PropietarioFormDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				propietario={propietario}
			/>
		</div>
	);
}

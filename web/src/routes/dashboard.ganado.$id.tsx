import { useState } from "react";
import {
	createFileRoute,
	redirect,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useObtenerFichaGanado } from "@/modules/ganado/hooks/useObtenerFichaGanado";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { useListarPropietarios } from "@/modules/propietario/hooks/useListarPropietarios";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { GanadoFormDialog } from "@/components/ganado/GanadoFormDialog";
import { GanadoPesajeDialog } from "@/components/ganado/GanadoPesajeDialog";
import { GanadoTrasladoDialog } from "@/components/ganado/GanadoTrasladoDialog";
import { EliminarGanadoDialog } from "@/components/ganado/EliminarGanadoDialog";
import { GanadoBajaDialog } from "@/components/ganado/GanadoBajaDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Pencil,
	Scale,
	TrendingUp,
	Trash2,
	Calendar,
	User,
	Warehouse,
	Loader2,
	Dna,
	Sparkles,
	GitBranch,
	AlertTriangle,
} from "lucide-react";
import type { GanadoDto } from "@/modules/ganado/types";

export const Route = createFileRoute("/dashboard/ganado/$id")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("ganado:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: DetalleGanadoComponent,
});

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") ||
	"http://localhost:3000";

/** Calcula la edad legible en meses desde la fecha de nacimiento */
function calcularEdad(fechaNacimiento: string): string {
	const nacimiento = new Date(fechaNacimiento);
	const hoy = new Date();
	let totalMeses =
		(hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
		(hoy.getMonth() - nacimiento.getMonth());
	if (hoy.getDate() < nacimiento.getDate()) {
		totalMeses--;
	}
	if (totalMeses < 0) totalMeses = 0;
	return totalMeses === 1 ? "1 mes" : `${totalMeses} meses`;
}

function DetalleGanadoComponent() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canUpdate = permissions.includes("ganado:update");
	const canDelete = permissions.includes("ganado:delete");

	const { data: ganado, isLoading, isError } = useObtenerFichaGanado(id);

	// Controles de modales
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isPesajeOpen, setIsPesajeOpen] = useState(false);
	const [isTrasladoOpen, setIsTrasladoOpen] = useState(false);
	const [isEliminarOpen, setIsEliminarOpen] = useState(false);
	const [isBajaOpen, setIsBajaOpen] = useState(false);

	// Catálogos para el modal de edición
	const { data: razasData = [] } = useListarRazas();
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: propietariosData } = useListarPropietarios(1, 100);
	const { data: todosGanados } = useListarGanado({
		page: 1,
		limit: 1000,
		soloActivos: true,
	});

	const razas = razasData;
	const terrenos = terrenosData?.data ?? [];
	const propietarios = propietariosData?.data ?? [];
	const ganadosList = todosGanados?.data ?? [];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
				<Loader2 className="size-5 animate-spin" />
				<span className="text-sm">Cargando información del ganado...</span>
			</div>
		);
	}

	if (isError || !ganado) {
		return (
			<div className="space-y-4 py-6 animate-fade-in">
				<Link
					to="/dashboard/ganado"
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"gap-2 -ml-2 mb-4 cursor-pointer",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Ganado
				</Link>
				<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
					No se pudo cargar la ficha técnica del ganado. Verifica que exista o
					regresa a la lista.
				</div>
			</div>
		);
	}

	const estaActivo = !ganado.fechaBaja;

	// Adaptar DTO de detalle a GanadoDto para el formulario de edición
	const ganadoSimple: GanadoDto = {
		id: ganado.id,
		identificador: ganado.identificador,
		peso: ganado.peso,
		fechaNacimiento: ganado.fechaNacimiento,
		sexo: ganado.sexo,
		imagenGanado: ganado.imagenGanado,
		razaId: ganado.raza.id,
		terrenoId: ganado.terreno.id,
		propietarioId: ganado.propietario.id,
		padreId: ganado.padre?.id ?? null,
		madreId: ganado.madre?.id ?? null,
		fechaBaja: ganado.fechaBaja,
		motivoBajaId: ganado.motivoBaja?.id ?? null,
	};

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado con navegación */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<Link
					to="/dashboard/ganado"
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"gap-2 -ml-2 w-fit cursor-pointer",
					)}
				>
					<ArrowLeft className="size-4" />
					Volver a Ganado
				</Link>

				<div className="flex flex-wrap gap-2">
					{canUpdate && estaActivo && (
						<>
							<Button
								onClick={() => setIsPesajeOpen(true)}
								variant="outline"
								className="gap-2 cursor-pointer border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
							>
								<Scale className="size-4" />
								Registrar Peso
							</Button>
							<Button
								onClick={() => setIsTrasladoOpen(true)}
								variant="outline"
								className="gap-2 cursor-pointer border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500"
							>
								<TrendingUp className="size-4" />
								Trasladar Terreno
							</Button>
							<Button
								onClick={() => setIsEditOpen(true)}
								variant="outline"
								className="gap-2 cursor-pointer"
							>
								<Pencil className="size-4" />
								Editar Ficha
							</Button>
							<Button
								onClick={() => setIsBajaOpen(true)}
								variant="outline"
								className="gap-2 cursor-pointer border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600"
							>
								<AlertTriangle className="size-4" />
								Dar de Baja
							</Button>
						</>
					)}
					{canDelete && (
						<Button
							onClick={() => setIsEliminarOpen(true)}
							variant="destructive"
							className="gap-2 cursor-pointer"
						>
							<Trash2 className="size-4" />
							Eliminar
						</Button>
					)}
				</div>
			</div>

			{/* Banner de baja */}
			{!estaActivo && (
				<div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-400">
					<AlertTriangle className="size-5 shrink-0" />
					<div className="text-sm">
						<span className="font-semibold">Este ganado está dado de baja</span>
						{ganado.fechaBaja && (
							<span className="ml-2 text-amber-600 dark:text-amber-500">
								— Fecha de baja:{" "}
								{new Date(ganado.fechaBaja).toLocaleDateString("es-MX")}
							</span>
						)}
						{ganado.motivoBaja && (
							<span className="ml-2 text-amber-600 dark:text-amber-500">
								· Motivo: {ganado.motivoBaja.nombre}
							</span>
						)}
					</div>
				</div>
			)}

			{/* Ficha Principal */}
			<Card className="border border-border bg-card/60 shadow-sm relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-primary/60" />
				<CardHeader className="flex flex-row items-start gap-4 pb-4">
					{/* Imagen o icono */}
					{ganado.imagenGanado ? (
						<img
							src={`${baseApiUrl}${ganado.imagenGanado}`}
							alt={`Ganado ${ganado.identificador}`}
							className="size-24 rounded-xl object-cover border border-border shrink-0"
						/>
					) : (
						<div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<Sparkles className="size-7 animate-pulse" />
						</div>
					)}
					<div className="text-left space-y-1 flex-1">
						<CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
							Arete: {ganado.identificador}
						</CardTitle>
						<div className="flex flex-wrap gap-2 pt-1">
							<Badge
								className={cn(
									ganado.sexo === "MACHO"
										? "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
										: "bg-pink-500/10 text-pink-700 dark:text-pink-400 hover:bg-pink-500/10",
								)}
							>
								{ganado.sexo}
							</Badge>
							<Badge variant="secondary" className="gap-1.5">
								<Scale className="size-3" />
								{ganado.peso} kg (Peso Actual)
							</Badge>
							<Badge variant="outline" className="gap-1.5">
								<Calendar className="size-3" />
								{calcularEdad(ganado.fechaNacimiento)} de edad
							</Badge>
							<Badge
								variant="outline"
								className="gap-1.5 text-muted-foreground"
							>
								<Calendar className="size-3" />
								Nacimiento:{" "}
								{new Date(ganado.fechaNacimiento).toLocaleDateString("es-MX")}
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-4 border-t border-border/40">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Raza */}
						<div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
							<Dna className="size-5 text-primary shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground uppercase font-semibold">
									Raza
								</p>
								<p className="text-base font-bold text-foreground">
									{ganado.raza.nombre}
								</p>
							</div>
						</div>

						{/* Terreno */}
						<div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
							<Warehouse className="size-5 text-primary shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground uppercase font-semibold">
									Terreno Actual
								</p>
								<p className="text-base font-bold text-foreground">
									{ganado.terreno.nombre}
								</p>
								<p className="text-xs text-muted-foreground">
									{ganado.terreno.ubicacion}
								</p>
							</div>
						</div>

						{/* Propietario */}
						<div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
							<User className="size-5 text-primary shrink-0" />
							<div>
								<p className="text-xs text-muted-foreground uppercase font-semibold">
									Propietario
								</p>
								<p className="text-base font-bold text-foreground">
									{ganado.propietario.nombre}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Linaje */}
			{(ganado.padre || ganado.madre) && (
				<Card className="border border-border bg-card/60 shadow-sm">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base font-semibold">
							<GitBranch className="size-4 text-primary" />
							Linaje
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{ganado.padre && (
								<Link
									to="/dashboard/ganado/$id"
									params={{ id: String(ganado.padre.id) }}
									className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors cursor-pointer"
								>
									<div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
										<GitBranch className="size-4" />
									</div>
									<div className="text-left">
										<p className="text-xs text-muted-foreground uppercase font-semibold">
											Padre (MACHO)
										</p>
										<p className="text-sm font-bold text-foreground">
											{ganado.padre.identificador}
										</p>
									</div>
								</Link>
							)}
							{ganado.madre && (
								<Link
									to="/dashboard/ganado/$id"
									params={{ id: String(ganado.madre.id) }}
									className="flex items-center gap-3 p-4 rounded-xl bg-pink-500/5 border border-pink-500/20 hover:bg-pink-500/10 transition-colors cursor-pointer"
								>
									<div className="size-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
										<GitBranch className="size-4" />
									</div>
									<div className="text-left">
										<p className="text-xs text-muted-foreground uppercase font-semibold">
											Madre (HEMBRA)
										</p>
										<p className="text-sm font-bold text-foreground">
											{ganado.madre.identificador}
										</p>
									</div>
								</Link>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Diálogos */}
			<GanadoFormDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				ganado={ganadoSimple}
				razas={razas}
				terrenos={terrenos}
				propietarios={propietarios}
				ganadosList={ganadosList}
			/>

			{isPesajeOpen && (
				<GanadoPesajeDialog
					open={isPesajeOpen}
					onOpenChange={setIsPesajeOpen}
					ganadoId={ganado.id}
					arete={ganado.identificador}
					ultimoPeso={ganado.peso}
				/>
			)}

			{isTrasladoOpen && (
				<GanadoTrasladoDialog
					open={isTrasladoOpen}
					onOpenChange={setIsTrasladoOpen}
					ganadoId={ganado.id}
					arete={ganado.identificador}
					terrenoActualId={ganado.terreno.id}
					terrenos={terrenos}
				/>
			)}

			{isBajaOpen && (
				<GanadoBajaDialog
					open={isBajaOpen}
					onOpenChange={setIsBajaOpen}
					ganadoId={ganado.id}
					ganadoIdentificador={ganado.identificador}
				/>
			)}

			{isEliminarOpen && (
				<EliminarGanadoDialog
					open={isEliminarOpen}
					onOpenChange={setIsEliminarOpen}
					ganadoId={ganado.id}
					arete={ganado.identificador}
					onDeleted={() => navigate({ to: "/dashboard/ganado" })}
				/>
			)}
		</div>
	);
}

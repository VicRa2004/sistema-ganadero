import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import { useObtenerFichaGanado } from "@/modules/ganado/hooks/useObtenerFichaGanado";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { useListarPropietarios } from "@/modules/propietario/hooks/useListarPropietarios";
import { useObtenerHistorialSanitarioGanado } from "@/modules/sesion-sanitaria/hooks/useObtenerHistorialSanitarioGanado";
import { useObtenerTratamientosGanado } from "@/modules/tratamiento-medico/hooks/useObtenerTratamientosGanado";
import { GanadoFormDialog } from "@/components/ganado/GanadoFormDialog";
import { GanadoPesajeDialog } from "@/components/ganado/GanadoPesajeDialog";
import { GanadoTrasladoDialog } from "@/components/ganado/GanadoTrasladoDialog";
import { EliminarGanadoDialog } from "@/components/ganado/EliminarGanadoDialog";
import { HistorialPesajesCard } from "@/components/ganado/HistorialPesajesCard";
import { HistorialSanitarioCard } from "@/components/ganado/HistorialSanitarioCard";
import { HistorialTratamientosCard } from "@/components/ganado/HistorialTratamientosCard";
import { GenealogiaCard } from "@/components/ganado/GenealogiaCard";
import { RentabilidadGanadoCard } from "@/components/comercial/RentabilidadGanadoCard";
import { ReproduccionGanadoCard } from "@/components/reproduccion/ReproduccionGanadoCard";
import { GanadoBajaDialog } from "@/components/ganado/GanadoBajaDialog";
import { ganadoService } from "@/modules/ganado/services/ganadoService";
import { sesionSanitariaService } from "@/modules/sesion-sanitaria/services/sesionSanitariaService";
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
	AlertTriangle,
	FileText,
	ShieldAlert,
} from "lucide-react";
import type { GanadoDto } from "@/modules/ganado/types";

export const Route = createFileRoute("/dashboard/ganado/$id")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "ganado", "read");
	},
	component: DetalleGanadoComponent,
});

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";

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

	const { can } = usePermissions();
	const canUpdate = can("ganado", "update");
	const canDelete = can("ganado", "delete");

	const { data: ganado, isLoading, isError } = useObtenerFichaGanado(id);
	const ganadoNumericId = ganado?.id ?? (Number(id) || 0);
	const tratamientosQuery = useObtenerTratamientosGanado(ganadoNumericId);
	const historialSanitarioQuery = useObtenerHistorialSanitarioGanado(
		ganadoNumericId > 0 ? ganadoNumericId : null,
	);

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

	const razas = razasData;
	const terrenos = terrenosData?.data ?? [];
	const propietarios = propietariosData?.data ?? [];

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
		procedencia: ganado.procedencia ?? null,
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
					<Button
						onClick={() => ganadoService.exportarFichaPdf(ganado.id)}
						variant="outline"
						size="sm"
						className="gap-2 cursor-pointer text-xs sm:text-sm"
					>
						<FileText className="size-4" />
						Ficha PDF
					</Button>
					<Button
						onClick={() =>
							sesionSanitariaService.exportarHistorialGanadoPdf(ganado.id)
						}
						variant="outline"
						size="sm"
						className="gap-2 cursor-pointer text-xs sm:text-sm"
					>
						<FileText className="size-4" />
						Historial PDF
					</Button>
					{canUpdate && estaActivo && (
						<>
							<Button
								onClick={() => setIsPesajeOpen(true)}
								variant="outline"
								size="sm"
								className="gap-2 cursor-pointer border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 text-xs sm:text-sm"
							>
								<Scale className="size-4" />
								Registrar Peso
							</Button>
							<Button
								onClick={() => setIsTrasladoOpen(true)}
								variant="outline"
								size="sm"
								className="gap-2 cursor-pointer border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 text-xs sm:text-sm"
							>
								<TrendingUp className="size-4" />
								Trasladar Terreno
							</Button>
							<Button
								onClick={() => setIsBajaOpen(true)}
								variant="outline"
								size="sm"
								className="gap-2 cursor-pointer border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 text-xs sm:text-sm"
							>
								<AlertTriangle className="size-4" />
								Dar de Baja
							</Button>
						</>
					)}
					{canUpdate && (
						<Button
							onClick={() => setIsEditOpen(true)}
							variant="outline"
							size="sm"
							className="gap-2 cursor-pointer text-xs sm:text-sm"
						>
							<Pencil className="size-4" />
							Editar Ficha
						</Button>
					)}
					{canDelete && (
						<Button
							onClick={() => setIsEliminarOpen(true)}
							variant="destructive"
							size="sm"
							className="gap-2 cursor-pointer text-xs sm:text-sm"
						>
							<Trash2 className="size-4" />
							Eliminar
						</Button>
					)}
				</div>
			</div>

			{/* Banner de período de retiro */}
			{ganado.enPeriodoRetiro && ganado.retiroHasta && (
				<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-700 dark:text-red-400">
					<ShieldAlert className="size-5 shrink-0" />
					<div className="text-sm text-left">
						<span className="font-semibold">
							Animal en período de retiro hasta el{" "}
							{new Date(ganado.retiroHasta).toLocaleDateString("es-MX")}
						</span>
						{ganado.retiroMotivo && (
							<span className="ml-2 text-red-600 dark:text-red-300">
								· {ganado.retiroMotivo}
							</span>
						)}
					</div>
				</div>
			)}

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
				<CardHeader className="flex flex-col sm:flex-row items-start gap-4 pb-4">
					{/* Imagen o icono */}
					{ganado.imagenGanado ? (
						<img
							src={`${baseApiUrl}${ganado.imagenGanado}`}
							alt={`Ganado ${ganado.identificador}`}
							className="size-20 sm:size-24 rounded-xl object-cover border border-border shrink-0"
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
							{ganado.procedencia && (
								<Badge variant="outline" className="gap-1.5">
									Procedencia: {ganado.procedencia}
								</Badge>
							)}
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

			<HistorialPesajesCard ganadoId={ganado.id} />

			<HistorialTratamientosCard
				ganadoId={ganado.id}
				tratamientos={tratamientosQuery.data}
				isLoading={tratamientosQuery.isLoading}
				isError={tratamientosQuery.isError}
			/>

			<HistorialSanitarioCard
				ganadoId={ganado.id}
				historial={historialSanitarioQuery.data}
				isLoading={historialSanitarioQuery.isLoading}
				isError={historialSanitarioQuery.isError}
			/>

			<ReproduccionGanadoCard ganado={ganado} />

			<GenealogiaCard ganadoId={ganado.id} />

			<RentabilidadGanadoCard ganadoId={ganado.id} />

			{/* Diálogos */}
			<GanadoFormDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				ganado={ganadoSimple}
				razas={razas}
				terrenos={terrenos}
				propietarios={propietarios}
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

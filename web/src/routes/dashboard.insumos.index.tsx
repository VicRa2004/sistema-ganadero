import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useObtenerInsumosCriticos } from "@/modules/inventario-insumos/hooks/useObtenerInsumosCriticos";
import { InsumosTable } from "@/components/insumo/InsumosTable";
import { InsumoFormDialog } from "@/components/insumo/InsumoFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Plus,
	Search,
	AlertTriangle,
	Package,
	Pill,
	Syringe,
	ChevronLeft,
	ChevronRight,
	Loader2,
	RefreshCw,
	X,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/insumos/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("inventario-insumos:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: InsumosPage,
});

function InsumosPage() {
	const permissions = useAuthStore((state) => state.permissions) || [];
	const canCreate = permissions.includes("inventario-insumos:create");

	const [page, setPage] = useState(1);
	const limit = 10;
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTipo, setSelectedTipo] = useState<string>("");
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [isAlertDismissed, setIsAlertDismissed] = useState(false);

	const {
		data: paginatedResponse,
		isLoading,
		isError,
		refetch,
	} = useListarInsumos(page, limit, searchTerm, selectedTipo || undefined);

	const { data: insumosCriticos } = useObtenerInsumosCriticos();

	const insumos = paginatedResponse?.data ?? [];
	const totalPages = paginatedResponse?.totalPages ?? 1;
	const totalItems = paginatedResponse?.totalItems ?? 0;
	const criticosCount = insumosCriticos?.length ?? 0;

	return (
		<div className="space-y-6">
			{/* Encabezado y botón de acción */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						Inventario de Insumos
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Gestiona los medicamentos, vacunas y alimento para la operación de
						la finca ganadera.
					</p>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsRegisterOpen(true)}
						className="cursor-pointer shadow-xs gap-2 shrink-0"
					>
						<Plus className="h-4 w-4" />
						Registrar Insumo
					</Button>
				)}
			</div>

			{/* Tarjetas de Métricas / Resumen */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="p-4 rounded-xl border border-border bg-card shadow-xs">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-primary/10 text-primary">
							<Package className="h-5 w-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								Total Insumos
							</p>
							<h3 className="text-xl font-bold text-foreground">
								{totalItems}
							</h3>
						</div>
					</div>
				</div>

				<div className="p-4 rounded-xl border border-border bg-card shadow-xs">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
							<AlertTriangle className="h-5 w-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								Stock Crítico
							</p>
							<h3 className="text-xl font-bold text-red-600 dark:text-red-400">
								{criticosCount}
							</h3>
						</div>
					</div>
				</div>

				<div className="p-4 rounded-xl border border-border bg-card shadow-xs">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<Pill className="h-5 w-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								Medicamentos
							</p>
							<h3 className="text-xl font-bold text-foreground">
								{insumos.filter((i) => i.tipo === "MEDICAMENTO").length}
							</h3>
						</div>
					</div>
				</div>

				<div className="p-4 rounded-xl border border-border bg-card shadow-xs">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Syringe className="h-5 w-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								Vacunas
							</p>
							<h3 className="text-xl font-bold text-foreground">
								{insumos.filter((i) => i.tipo === "VACUNA").length}
							</h3>
						</div>
					</div>
				</div>
			</div>

			{/* Banner de alerta cerrable para insumos críticos */}
			{criticosCount > 0 && !isAlertDismissed && (
				<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 dark:bg-red-500/15 text-red-700 dark:text-red-300 flex items-start sm:items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
						<div>
							<h4 className="font-semibold text-sm">
								Alerta de Reabastecimiento Crítico
							</h4>
							<p className="text-xs text-red-600/90 dark:text-red-400/90">
								Hay {criticosCount} insumo(s) cuyo stock actual ha alcanzado o
								caído por debajo del nivel mínimo de seguridad.
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsAlertDismissed(true)}
						title="Cerrar alerta"
						className="cursor-pointer hover:bg-red-500/20 text-red-700 dark:text-red-300 h-8 w-8 p-0 shrink-0"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Barra de Filtros */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar por nombre de insumo..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
						className="pl-9"
					/>
				</div>

				<select
					value={selectedTipo}
					onChange={(e) => {
						setSelectedTipo(e.target.value);
						setPage(1);
					}}
					className="h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring sm:w-48"
				>
					<option value="">Todas las categorías</option>
					<option value="MEDICAMENTO">MEDICAMENTO</option>
					<option value="VACUNA">VACUNA</option>
					<option value="ALIMENTO">ALIMENTO</option>
				</select>
			</div>

			{/* Estado de Carga / Error / Tabla */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-card">
					<Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
					<p className="text-sm text-muted-foreground">
						Cargando inventario de insumos...
					</p>
				</div>
			) : isError ? (
				<div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400">
					<AlertTriangle className="h-8 w-8 mb-2" />
					<h3 className="text-lg font-semibold">Error al cargar inventario</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Ocurrió un problema al obtener los datos del servidor.
					</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw className="h-4 w-4 mr-2" /> Reintentar
					</Button>
				</div>
			) : (
				<>
					<InsumosTable insumos={insumos} />

					{/* Control de Paginación */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between pt-2">
							<p className="text-xs text-muted-foreground">
								Mostrando página <span className="font-semibold">{page}</span>{" "}
								de <span className="font-semibold">{totalPages}</span> (
								{totalItems} insumos en total)
							</p>

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page <= 1}
									className="cursor-pointer"
								>
									<ChevronLeft className="h-4 w-4 mr-1" />
									Anterior
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
									disabled={page >= totalPages}
									className="cursor-pointer"
								>
									Siguiente
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}

			{/* Modal Formulario para Crear Insumo */}
			{isRegisterOpen && (
				<InsumoFormDialog
					open={isRegisterOpen}
					onOpenChange={setIsRegisterOpen}
				/>
			)}
		</div>
	);
}

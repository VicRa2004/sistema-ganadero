import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { useListarPropietarios } from "@/modules/propietario/hooks/useListarPropietarios";
import { GanadoTable } from "@/components/ganado/GanadoTable";
import { GanadoFormDialog } from "@/components/ganado/GanadoFormDialog";
import { GanadoPesajeDialog } from "@/components/ganado/GanadoPesajeDialog";
import { GanadoTrasladoDialog } from "@/components/ganado/GanadoTrasladoDialog";
import { EliminarGanadoDialog } from "@/components/ganado/EliminarGanadoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Plus,
	Sprout,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Search,
	RotateCcw,
	Filter,
} from "lucide-react";
import type { GanadoDto } from "@/modules/ganado/types";

export const Route = createFileRoute("/dashboard/ganado/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("ganado:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: GanadosComponent,
});

const PAGE_SIZE = 10;

function GanadosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const hasPermission = (resource: string, action: string) =>
		permissions.includes(`${resource}:${action}`);

	const [page, setPage] = useState(1);

	// Filtros locales
	const [filterIdentificador, setFilterIdentificador] = useState("");
	const [filterRazaId, setFilterRazaId] = useState<number | undefined>(
		undefined,
	);
	const [filterTerrenoId, setFilterTerrenoId] = useState<number | undefined>(
		undefined,
	);
	const [filterPropietarioId, setFilterPropietarioId] = useState<
		number | undefined
	>(undefined);

	// Controles de modales
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [ganadoEditar, setGanadoEditar] = useState<GanadoDto | null>(null);
	const [ganadoEliminar, setGanadoEliminar] = useState<GanadoDto | null>(null);
	const [ganadoPesaje, setGanadoPesaje] = useState<GanadoDto | null>(null);
	const [ganadoTraslado, setGanadoTraslado] = useState<GanadoDto | null>(null);

	// Cargar catálogos
	const { data: razasData = [] } = useListarRazas();
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: propietariosData } = useListarPropietarios(1, 100);

	const razas = razasData;
	const terrenos = terrenosData?.data ?? [];
	const propietarios = propietariosData?.data ?? [];

	// Query principal con filtros aplicados
	const {
		data: paginado,
		isLoading,
		isError,
	} = useListarGanado({
		page,
		limit: PAGE_SIZE,
		identificador: filterIdentificador,
		razaId: filterRazaId,
		terrenoId: filterTerrenoId,
		propietarioId: filterPropietarioId,
	});

	const canCreate = hasPermission("ganado", "create");
	const canUpdate = hasPermission("ganado", "update");
	const canDelete = hasPermission("ganado", "delete");

	function handleEdit(g: GanadoDto) {
		setGanadoEditar(g);
		setIsFormOpen(true);
	}

	function handleCloseForm(open: boolean) {
		setIsFormOpen(open);
		if (!open) {
			setGanadoEditar(null);
		}
	}

	function handleResetFilters() {
		setFilterIdentificador("");
		setFilterRazaId(undefined);
		setFilterTerrenoId(undefined);
		setFilterPropietarioId(undefined);
		setPage(1);
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado */}
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Sprout className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
							Ganado
						</h1>
						<p className="text-sm text-muted-foreground">
							Control, pesaje e historial de traslados de cabezas de ganado
							bovino
						</p>
					</div>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsFormOpen(true)}
						className="gap-2 shrink-0 shadow-sm shadow-primary/20 cursor-pointer"
					>
						<Plus className="size-4" />
						Registrar Ganado
					</Button>
				)}
			</section>

			{/* Panel de Filtros */}
			<section className="p-4 rounded-xl border border-border bg-card/40 space-y-4">
				<div className="flex items-center gap-2 text-foreground font-semibold text-sm">
					<Filter className="size-4 text-primary" />
					Filtrar ganado
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
					<div className="space-y-1.5">
						<Label htmlFor="buscar-arete">Buscar Arete / Identificador</Label>
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="buscar-arete"
								type="text"
								placeholder="Ej: AR-0982"
								value={filterIdentificador}
								onChange={(e) => {
									setFilterIdentificador(e.target.value);
									setPage(1);
								}}
								className="pl-9"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="filtro-raza">Filtrar por Raza</Label>
						<select
							id="filtro-raza"
							value={filterRazaId ?? ""}
							onChange={(e) => {
								const val = e.target.value;
								setFilterRazaId(val === "" ? undefined : Number(val));
								setPage(1);
							}}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Todas las razas</option>
							{razas.map((r) => (
								<option key={r.id} value={r.id}>
									{r.nombre}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5 text-left">
						<Label htmlFor="filtro-terreno">Filtrar por Terreno</Label>
						<select
							id="filtro-terreno"
							value={filterTerrenoId ?? ""}
							onChange={(e) => {
								const val = e.target.value;
								setFilterTerrenoId(val === "" ? undefined : Number(val));
								setPage(1);
							}}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
						>
							<option value="">Todos los terrenos</option>
							{terrenos.map((r) => (
								<option key={r.id} value={r.id}>
									{r.nombre}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="filtro-propietario">Filtrar por Propietario</Label>
						<select
							id="filtro-propietario"
							value={filterPropietarioId ?? ""}
							onChange={(e) => {
								const val = e.target.value;
								setFilterPropietarioId(val === "" ? undefined : Number(val));
								setPage(1);
							}}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Todos los propietarios</option>
							{propietarios.map((p) => (
								<option key={p.id} value={p.id}>
									{p.nombre}
								</option>
							))}
						</select>
					</div>
				</div>
				{(filterIdentificador ||
					filterRazaId ||
					filterTerrenoId ||
					filterPropietarioId) && (
					<div className="flex justify-end pt-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleResetFilters}
							className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
						>
							<RotateCcw className="size-3.5" />
							Limpiar filtros
						</Button>
					</div>
				)}
			</section>

			{/* Contenido principal */}
			<section>
				{isLoading && (
					<div className="flex items-center justify-center py-16 gap-3 text-muted-foreground animate-pulse">
						<Loader2 className="size-5 animate-spin text-primary" />
						<span className="text-sm">Cargando ganado registrado...</span>
					</div>
				)}

				{isError && (
					<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
						No se pudieron cargar los datos de ganado. Verifica tu conexión e
						intenta de nuevo.
					</div>
				)}

				{!isLoading && !isError && paginado && (
					<GanadoTable
						ganados={paginado.data}
						razas={razas}
						terrenos={terrenos}
						propietarios={propietarios}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleEdit}
						onDelete={(g) => setGanadoEliminar(g)}
						onPesaje={(g) => setGanadoPesaje(g)}
						onTraslado={(g) => setGanadoTraslado(g)}
					/>
				)}
			</section>

			{/* Paginación */}
			{!isLoading && paginado && paginado.data.length > 0 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-muted-foreground">
						Página <span className="font-semibold text-foreground">{page}</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">
							{paginado.totalPages}
						</span>
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="gap-1 cursor-pointer"
						>
							<ChevronLeft className="size-4" />
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= paginado.totalPages}
							className="gap-1 cursor-pointer"
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Formulario Dialog */}
			<GanadoFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				ganado={ganadoEditar ?? undefined}
				razas={razas}
				terrenos={terrenos}
				propietarios={propietarios}
			/>

			{/* Registrar Pesaje Dialog */}
			{ganadoPesaje && (
				<GanadoPesajeDialog
					open={!!ganadoPesaje}
					onOpenChange={(open) => {
						if (!open) setGanadoPesaje(null);
					}}
					ganadoId={ganadoPesaje.id}
					arete={ganadoPesaje.identificador}
					ultimoPeso={ganadoPesaje.peso}
				/>
			)}

			{/* Trasladar Ganado Dialog */}
			{ganadoTraslado && (
				<GanadoTrasladoDialog
					open={!!ganadoTraslado}
					onOpenChange={(open) => {
						if (!open) setGanadoTraslado(null);
					}}
					ganadoId={ganadoTraslado.id}
					arete={ganadoTraslado.identificador}
					terrenoActualId={ganadoTraslado.terrenoId}
					terrenos={terrenos}
				/>
			)}

			{/* Eliminar Ganado Dialog */}
			{ganadoEliminar && (
				<EliminarGanadoDialog
					open={!!ganadoEliminar}
					onOpenChange={(open) => {
						if (!open) setGanadoEliminar(null);
					}}
					ganadoId={ganadoEliminar.id}
					arete={ganadoEliminar.identificador}
				/>
			)}
		</div>
	);
}

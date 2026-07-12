import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import { VeterinariosTable } from "@/components/veterinario/VeterinariosTable";
import { VeterinarioFormDialog } from "@/components/veterinario/VeterinarioFormDialog";
import { EliminarVeterinarioDialog } from "@/components/veterinario/EliminarVeterinarioDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Plus,
	UserCheck,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Search,
	Briefcase,
} from "lucide-react";
import type { VeterinarioDto } from "@/modules/veterinario/types";

export const Route = createFileRoute("/dashboard/veterinarios/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("veterinarios:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: VeterinariosComponent,
});

const PAGE_SIZE = 10;

function VeterinariosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const hasPermission = (resource: string, action: string) =>
		permissions.includes(`${resource}:${action}`);

	const [page, setPage] = useState(1);
	const [nombreFiltro, setNombreFiltro] = useState("");
	const [especialidadFiltro, setEspecialidadFiltro] = useState("");

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [veterinarioEditar, setVeterinarioEditar] =
		useState<VeterinarioDto | null>(null);
	const [veterinarioEliminar, setVeterinarioEliminar] =
		useState<VeterinarioDto | null>(null);

	const {
		data: listado,
		isLoading,
		isError,
	} = useListarVeterinarios(page, PAGE_SIZE, nombreFiltro, especialidadFiltro);

	const canCreate = hasPermission("veterinarios", "create");
	const canUpdate = hasPermission("veterinarios", "update");
	const canDelete = hasPermission("veterinarios", "delete");

	function handleEdit(v: VeterinarioDto) {
		setVeterinarioEditar(v);
		setIsFormOpen(true);
	}

	function handleCloseForm(open: boolean) {
		setIsFormOpen(open);
		if (!open) {
			setVeterinarioEditar(null);
		}
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado */}
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<UserCheck className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
							Veterinarios
						</h1>
						<p className="text-sm text-muted-foreground">
							Gestión y listado de los médicos veterinarios del rancho
						</p>
					</div>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsFormOpen(true)}
						className="gap-2 shrink-0 shadow-sm shadow-primary/20 cursor-pointer"
					>
						<Plus className="size-4" />
						Registrar Veterinario
					</Button>
				)}
			</section>

			{/* Filtros de Búsqueda */}
			<section className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
				<div className="space-y-1.5 text-left">
					<Label htmlFor="buscar-nombre" className="text-sm font-semibold">
						Buscar por nombre
					</Label>
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="buscar-nombre"
							type="text"
							placeholder="Escribe el nombre del veterinario..."
							value={nombreFiltro}
							onChange={(e) => {
								setNombreFiltro(e.target.value);
								setPage(1); // Resetear a página 1 al buscar
							}}
							className="pl-9 bg-background"
						/>
					</div>
				</div>

				<div className="space-y-1.5 text-left">
					<Label
						htmlFor="buscar-especialidad"
						className="text-sm font-semibold"
					>
						Buscar por especialidad
					</Label>
					<div className="relative">
						<Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="buscar-especialidad"
							type="text"
							placeholder="Ej: Cirugía, Reproducción..."
							value={especialidadFiltro}
							onChange={(e) => {
								setEspecialidadFiltro(e.target.value);
								setPage(1); // Resetear a página 1 al buscar
							}}
							className="pl-9 bg-background"
						/>
					</div>
				</div>
			</section>

			{/* Contenido Principal */}
			<section>
				{isLoading && (
					<div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
						<Loader2 className="size-5 animate-spin" />
						<span className="text-sm">Cargando veterinarios...</span>
					</div>
				)}

				{isError && (
					<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
						No se pudieron cargar los veterinarios. Verifica tu conexión e
						intenta de nuevo.
					</div>
				)}

				{!isLoading && !isError && listado && (
					<VeterinariosTable
						veterinarios={listado.data}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleEdit}
						onDelete={(v) => setVeterinarioEliminar(v)}
					/>
				)}
			</section>

			{/* Paginación */}
			{!isLoading && listado && listado.data.length > 0 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-muted-foreground">
						Página <span className="font-semibold text-foreground">{page}</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">
							{listado.totalPages}
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
							disabled={page >= listado.totalPages}
							className="gap-1 cursor-pointer"
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Diálogos */}
			<VeterinarioFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				veterinario={veterinarioEditar ?? undefined}
			/>

			{veterinarioEliminar && (
				<EliminarVeterinarioDialog
					open={!!veterinarioEliminar}
					onOpenChange={(open) => {
						if (!open) setVeterinarioEliminar(null);
					}}
					veterinarioId={veterinarioEliminar.id}
					veterinarioNombre={veterinarioEliminar.nombre}
				/>
			)}
		</div>
	);
}

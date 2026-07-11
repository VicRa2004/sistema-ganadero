import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarPropietarios } from "@/modules/propietario/hooks/useListarPropietarios";
import { PropietariosTable } from "@/components/propietario/PropietariosTable";
import { PropietarioFormDialog } from "@/components/propietario/PropietarioFormDialog";
import { EliminarPropietarioDialog } from "@/components/propietario/EliminarPropietarioDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { PropietarioDto } from "@/modules/propietario/types";

export const Route = createFileRoute("/dashboard/propietarios/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		// Los permisos se leen del store de Zustand directamente (getState es seguro fuera de React)
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("propietario:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: PropietariosComponent,
});

const PAGE_SIZE = 10;

function PropietariosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const hasPermission = (resource: string, action: string) =>
		permissions.includes(`${resource}:${action}`);

	const [page, setPage] = useState(1);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [propietarioEditar, setPropietarioEditar] =
		useState<PropietarioDto | null>(null);
	const [propietarioEliminar, setPropietarioEliminar] =
		useState<PropietarioDto | null>(null);

	const {
		data: propietarios,
		isLoading,
		isError,
	} = useListarPropietarios(page, PAGE_SIZE);

	const canCreate = hasPermission("propietario", "create");
	const canUpdate = hasPermission("propietario", "update");
	const canDelete = hasPermission("propietario", "delete");

	function handleEdit(p: PropietarioDto) {
		setPropietarioEditar(p);
		setIsFormOpen(true);
	}

	function handleCloseForm(open: boolean) {
		setIsFormOpen(open);
		if (!open) {
			setPropietarioEditar(null);
		}
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado */}
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Users className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
							Propietarios
						</h1>
						<p className="text-sm text-muted-foreground">
							Gestión de propietarios de ganado y ranchos
						</p>
					</div>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsFormOpen(true)}
						className="gap-2 shrink-0 shadow-sm shadow-primary/20"
					>
						<Plus className="size-4" />
						Registrar Propietario
					</Button>
				)}
			</section>

			{/* Contenido principal */}
			<section>
				{isLoading && (
					<div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
						<Loader2 className="size-5 animate-spin" />
						<span className="text-sm">Cargando propietarios...</span>
					</div>
				)}

				{isError && (
					<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
						No se pudieron cargar los propietarios. Verifica tu conexión e
						intenta de nuevo.
					</div>
				)}

				{!isLoading && !isError && propietarios && (
					<PropietariosTable
						propietarios={propietarios.data}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleEdit}
						onDelete={(p) => setPropietarioEliminar(p)}
					/>
				)}
			</section>

			{/* Paginación */}
			{!isLoading && propietarios && propietarios.data.length > 0 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-muted-foreground">
						Página <span className="font-semibold text-foreground">{page}</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">
							{propietarios.totalPages}
						</span>
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="gap-1"
						>
							<ChevronLeft className="size-4" />
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= propietarios.totalPages}
							className="gap-1"
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Dialogs */}
			<PropietarioFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				propietario={propietarioEditar ?? undefined}
			/>

			{propietarioEliminar && (
				<EliminarPropietarioDialog
					open={!!propietarioEliminar}
					onOpenChange={(open) => {
						if (!open) setPropietarioEliminar(null);
					}}
					propietarioId={propietarioEliminar.id}
					propietarioNombre={propietarioEliminar.nombre}
				/>
			)}
		</div>
	);
}

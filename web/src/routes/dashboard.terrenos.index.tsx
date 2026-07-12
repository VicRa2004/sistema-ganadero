import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { TerrenosTable } from "@/components/terreno/TerrenosTable";
import { TerrenoFormDialog } from "@/components/terreno/TerrenoFormDialog";
import { EliminarTerrenoDialog } from "@/components/terreno/EliminarTerrenoDialog";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Warehouse,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import type { TerrenoDto } from "@/modules/terreno/types";

export const Route = createFileRoute("/dashboard/terrenos/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("terreno:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: TerrenosComponent,
});

const PAGE_SIZE = 10;

function TerrenosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const hasPermission = (resource: string, action: string) =>
		permissions.includes(`${resource}:${action}`);

	const [page, setPage] = useState(1);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [terrenoEditar, setTerrenoEditar] = useState<TerrenoDto | null>(null);
	const [terrenoEliminar, setTerrenoEliminar] = useState<TerrenoDto | null>(
		null,
	);

	const {
		data: terrenos,
		isLoading,
		isError,
	} = useListarTerrenos(page, PAGE_SIZE);

	const canCreate = hasPermission("terreno", "create");
	const canUpdate = hasPermission("terreno", "update");
	const canDelete = hasPermission("terreno", "delete");

	function handleEdit(r: TerrenoDto) {
		setTerrenoEditar(r);
		setIsFormOpen(true);
	}

	function handleCloseForm(open: boolean) {
		setIsFormOpen(open);
		if (!open) {
			setTerrenoEditar(null);
		}
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			{/* Encabezado */}
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Warehouse className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
							Terrenos
						</h1>
						<p className="text-sm text-muted-foreground">
							Gestión física e infraestructura de las secciones y terrenos de
							producción
						</p>
					</div>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsFormOpen(true)}
						className="gap-2 shrink-0 shadow-sm shadow-primary/20 cursor-pointer"
					>
						<Plus className="size-4" />
						Registrar Terreno
					</Button>
				)}
			</section>

			{/* Contenido principal */}
			<section>
				{isLoading && (
					<div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
						<Loader2 className="size-5 animate-spin" />
						<span className="text-sm">Cargando terrenos...</span>
					</div>
				)}

				{isError && (
					<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
						No se pudieron cargar los terrenos. Verifica tu conexión e intenta
						de nuevo.
					</div>
				)}

				{!isLoading && !isError && terrenos && (
					<TerrenosTable
						terrenos={terrenos.data}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleEdit}
						onDelete={(r) => setTerrenoEliminar(r)}
					/>
				)}
			</section>

			{/* Paginación */}
			{!isLoading && terrenos && terrenos.data.length > 0 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-muted-foreground">
						Página <span className="font-semibold text-foreground">{page}</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">
							{terrenos.totalPages}
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
							disabled={page >= terrenos.totalPages}
							className="gap-1 cursor-pointer"
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Dialogs */}
			<TerrenoFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				terreno={terrenoEditar ?? undefined}
			/>

			{terrenoEliminar && (
				<EliminarTerrenoDialog
					open={!!terrenoEliminar}
					onOpenChange={(open) => {
						if (!open) setTerrenoEliminar(null);
					}}
					terrenoId={terrenoEliminar.id}
					terrenoNombre={terrenoEliminar.nombre}
				/>
			)}
		</div>
	);
}

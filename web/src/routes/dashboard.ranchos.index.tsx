import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarRanchos } from "@/modules/rancho/hooks/useListarRanchos";
import { RanchosTable } from "@/components/rancho/RanchosTable";
import { RanchoFormDialog } from "@/components/rancho/RanchoFormDialog";
import { EliminarRanchoDialog } from "@/components/rancho/EliminarRanchoDialog";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Warehouse,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import type { RanchoDto } from "@/modules/rancho/types";

export const Route = createFileRoute("/dashboard/ranchos/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("rancho:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: RanchosComponent,
});

const PAGE_SIZE = 10;

function RanchosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const hasPermission = (resource: string, action: string) =>
		permissions.includes(`${resource}:${action}`);

	const [page, setPage] = useState(1);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [ranchoEditar, setRanchoEditar] = useState<RanchoDto | null>(null);
	const [ranchoEliminar, setRanchoEliminar] = useState<RanchoDto | null>(null);

	const {
		data: ranchos,
		isLoading,
		isError,
	} = useListarRanchos(page, PAGE_SIZE);

	const canCreate = hasPermission("rancho", "create");
	const canUpdate = hasPermission("rancho", "update");
	const canDelete = hasPermission("rancho", "delete");

	function handleEdit(r: RanchoDto) {
		setRanchoEditar(r);
		setIsFormOpen(true);
	}

	function handleCloseForm(open: boolean) {
		setIsFormOpen(open);
		if (!open) {
			setRanchoEditar(null);
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
							Ranchos
						</h1>
						<p className="text-sm text-muted-foreground">
							Gestión física e infraestructura de las fincas de producción
						</p>
					</div>
				</div>

				{canCreate && (
					<Button
						onClick={() => setIsFormOpen(true)}
						className="gap-2 shrink-0 shadow-sm shadow-primary/20 cursor-pointer"
					>
						<Plus className="size-4" />
						Registrar Rancho
					</Button>
				)}
			</section>

			{/* Contenido principal */}
			<section>
				{isLoading && (
					<div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
						<Loader2 className="size-5 animate-spin" />
						<span className="text-sm">Cargando ranchos...</span>
					</div>
				)}

				{isError && (
					<div className="p-4 text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-xl dark:text-red-400 dark:bg-red-500/15">
						No se pudieron cargar los ranchos. Verifica tu conexión e intenta de
						nuevo.
					</div>
				)}

				{!isLoading && !isError && ranchos && (
					<RanchosTable
						ranchos={ranchos.data}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleEdit}
						onDelete={(r) => setRanchoEliminar(r)}
					/>
				)}
			</section>

			{/* Paginación */}
			{!isLoading && ranchos && ranchos.data.length > 0 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-muted-foreground">
						Página <span className="font-semibold text-foreground">{page}</span>{" "}
						de{" "}
						<span className="font-semibold text-foreground">
							{ranchos.totalPages}
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
							disabled={page >= ranchos.totalPages}
							className="gap-1 cursor-pointer"
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Dialogs */}
			<RanchoFormDialog
				open={isFormOpen}
				onOpenChange={handleCloseForm}
				rancho={ranchoEditar ?? undefined}
			/>

			{ranchoEliminar && (
				<EliminarRanchoDialog
					open={!!ranchoEliminar}
					onOpenChange={(open) => {
						if (!open) setRanchoEliminar(null);
					}}
					ranchoId={ranchoEliminar.id}
					ranchoNombre={ranchoEliminar.nombre}
				/>
			)}
		</div>
	);
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { ListaEstado } from "@/components/ListaEstado";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarPermisos } from "@/modules/permiso/hooks/useListarPermisos";

export const Route = createFileRoute("/dashboard/permisos/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("permissions:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: PermisosComponent,
});

function PermisosComponent() {
	const { data: permisos = [], isLoading, isError } = useListarPermisos();

	const porRecurso = new Map<string, typeof permisos>();
	for (const p of permisos) {
		porRecurso.set(p.resource, [...(porRecurso.get(p.resource) ?? []), p]);
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			<section className="flex items-center gap-3 pb-6 border-b border-border">
				<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
					<KeyRound className="size-5" />
				</div>
				<div className="text-left">
					<h1 className="text-2xl font-extrabold tracking-tight">Permisos</h1>
					<p className="text-sm text-muted-foreground">
						Catálogo de permisos por recurso (solo lectura)
					</p>
				</div>
			</section>

			<ListaEstado isLoading={isLoading} isError={isError} />

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[...porRecurso].map(([recurso, items]) => (
					<div
						key={recurso}
						className="rounded-xl border border-border bg-card p-4 space-y-3 text-left"
					>
						<h2 className="font-semibold">{recurso}</h2>
						<div className="flex flex-wrap gap-1.5">
							{items.map((p) => (
								<Badge key={p.id} variant="secondary">
									{p.action}
								</Badge>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

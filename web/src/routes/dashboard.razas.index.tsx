import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dna, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { CampoTexto } from "@/components/CampoTexto";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { ListaEstado } from "@/components/ListaEstado";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useActualizarRaza } from "@/modules/raza/hooks/useActualizarRaza";
import { useEliminarRaza } from "@/modules/raza/hooks/useEliminarRaza";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useRegistrarRaza } from "@/modules/raza/hooks/useRegistrarRaza";
import type { RazaDto } from "@/modules/raza/types";

export const Route = createFileRoute("/dashboard/razas/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("razas:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: RazasComponent,
});

const razaSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(1, "El nombre es requerido")
		.max(100, "Máximo 100 caracteres"),
	descripcion: z.string().trim().max(500, "Máximo 500 caracteres"),
});

function RazaFormDialog({
	raza,
	onClose,
}: {
	raza: RazaDto | null;
	onClose: () => void;
}) {
	const { mutate: registrar, isPending: registrando } = useRegistrarRaza();
	const { mutate: actualizar, isPending: actualizando } = useActualizarRaza();
	const isPending = registrando || actualizando;

	const form = useForm({
		defaultValues: {
			nombre: raza?.nombre ?? "",
			descripcion: raza?.descripcion ?? "",
		},
		validators: { onChange: razaSchema },
		onSubmit: ({ value }) => {
			const input = {
				nombre: value.nombre.trim(),
				descripcion: value.descripcion.trim() || null,
			};
			if (raza) actualizar({ id: raza.id, input }, { onSuccess: onClose });
			else registrar(input, { onSuccess: onClose });
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4 py-2"
		>
			<form.Field name="nombre">
				{(field) => (
					<CampoTexto
						id="nombre"
						label="Nombre"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						errors={field.state.meta.isTouched ? field.state.meta.errors : []}
						disabled={isPending}
					/>
				)}
			</form.Field>
			<form.Field name="descripcion">
				{(field) => (
					<CampoTexto
						id="descripcion"
						label="Descripción (opcional)"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						errors={field.state.meta.isTouched ? field.state.meta.errors : []}
						disabled={isPending}
					/>
				)}
			</form.Field>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isPending}>
					{raza ? "Guardar cambios" : "Registrar"}
				</Button>
			</div>
		</form>
	);
}

function RazasComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canCreate = permissions.includes("razas:create");
	const canUpdate = permissions.includes("razas:update");
	const canDelete = permissions.includes("razas:delete");

	const [formOpen, setFormOpen] = useState(false);
	const [editar, setEditar] = useState<RazaDto | null>(null);
	const [eliminar, setEliminar] = useState<RazaDto | null>(null);

	const { data: razas = [], isLoading, isError } = useListarRazas();
	const { mutate: borrar, isPending: borrando } = useEliminarRaza();

	function cerrarForm() {
		setFormOpen(false);
		setEditar(null);
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Dna className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight">Razas</h1>
						<p className="text-sm text-muted-foreground">
							Catálogo de razas disponibles para el ganado
						</p>
					</div>
				</div>
				{canCreate && (
					<Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
						<Plus className="size-4" />
						Registrar raza
					</Button>
				)}
			</section>

			<ListaEstado isLoading={isLoading} isError={isError} />

			{!isLoading && !isError && (
				<div className="overflow-x-auto rounded-xl border border-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead className="w-24 text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{razas.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={3}
										className="py-10 text-center text-muted-foreground"
									>
										No hay razas registradas.
									</TableCell>
								</TableRow>
							)}
							{razas.map((r) => (
								<TableRow key={r.id}>
									<TableCell className="font-medium">{r.nombre}</TableCell>
									<TableCell className="text-muted-foreground">
										{r.descripcion ?? "—"}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											{canUpdate && (
												<Button
													variant="ghost"
													size="icon"
													aria-label={`Editar ${r.nombre}`}
													onClick={() => {
														setEditar(r);
														setFormOpen(true);
													}}
												>
													<Pencil className="size-4" />
												</Button>
											)}
											{canDelete && (
												<Button
													variant="ghost"
													size="icon"
													aria-label={`Eliminar ${r.nombre}`}
													onClick={() => setEliminar(r)}
												>
													<Trash2 className="size-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog open={formOpen} onOpenChange={(o) => !o && cerrarForm()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editar ? "Editar raza" : "Registrar raza"}
						</DialogTitle>
						<DialogDescription>
							El nombre de la raza debe ser único.
						</DialogDescription>
					</DialogHeader>
					{/* key reinicia el formulario al cambiar de raza */}
					{formOpen && (
						<RazaFormDialog
							key={editar?.id ?? "nueva"}
							raza={editar}
							onClose={cerrarForm}
						/>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmarDialog
				open={!!eliminar}
				onOpenChange={(o) => !o && setEliminar(null)}
				titulo="¿Eliminar raza?"
				descripcion={
					<>
						Se eliminará la raza{" "}
						<span className="font-semibold text-foreground">
							{eliminar?.nombre}
						</span>
						. No se puede eliminar si hay ganado asociado.
					</>
				}
				isPending={borrando}
				onConfirm={() =>
					eliminar &&
					borrar(eliminar.id, { onSuccess: () => setEliminar(null) })
				}
			/>
		</div>
	);
}

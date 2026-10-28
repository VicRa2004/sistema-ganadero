import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	Search,
	Shield,
	Trash2,
} from "lucide-react";
import { z } from "zod";
import { CampoTexto } from "@/components/CampoTexto";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { ListaEstado } from "@/components/ListaEstado";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { passwordSchema } from "@/modules/auth/schemas";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useActualizarUsuario } from "@/modules/usuario/hooks/useActualizarUsuario";
import { useCrearUsuario } from "@/modules/usuario/hooks/useCrearUsuario";
import { useEliminarUsuario } from "@/modules/usuario/hooks/useEliminarUsuario";
import { useListarUsuarios } from "@/modules/usuario/hooks/useListarUsuarios";
import type { UserDto } from "@/modules/usuario/types";

export const Route = createFileRoute("/dashboard/usuarios/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("users:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: UsuariosComponent,
});

const PAGE_SIZE = 10;

const baseSchema = z.object({
	name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.email("Introduce un correo válido"),
	password: z.string(),
	isActive: z.boolean(),
});
const crearSchema = baseSchema.extend({ password: passwordSchema });

function UsuarioFormDialog({
	usuario,
	onClose,
}: {
	usuario: UserDto | null;
	onClose: () => void;
}) {
	const { mutate: crear, isPending: creando } = useCrearUsuario();
	const { mutate: actualizar, isPending: actualizando } =
		useActualizarUsuario();
	const isPending = creando || actualizando;

	const form = useForm({
		defaultValues: {
			name: usuario?.name ?? "",
			email: usuario?.email ?? "",
			password: "",
			isActive: usuario?.isActive ?? true,
		},
		// En edición la contraseña no se toca desde aquí
		validators: { onChange: usuario ? baseSchema : crearSchema },
		onSubmit: ({ value }) => {
			if (usuario) {
				actualizar(
					{
						id: usuario.id,
						input: {
							name: value.name.trim(),
							email: value.email,
							isActive: value.isActive,
						},
					},
					{ onSuccess: onClose },
				);
			} else {
				crear(
					{
						name: value.name.trim(),
						email: value.email,
						password: value.password,
					},
					{ onSuccess: onClose },
				);
			}
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
			<form.Field name="name">
				{(field) => (
					<CampoTexto
						id="name"
						label="Nombre"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						errors={field.state.meta.isTouched ? field.state.meta.errors : []}
						disabled={isPending}
					/>
				)}
			</form.Field>
			<form.Field name="email">
				{(field) => (
					<CampoTexto
						id="email"
						type="email"
						label="Correo electrónico"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						errors={field.state.meta.isTouched ? field.state.meta.errors : []}
						disabled={isPending}
					/>
				)}
			</form.Field>
			{usuario ? (
				<form.Field name="isActive">
					{(field) => (
						<div className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								id="isActive"
								checked={field.state.value}
								onChange={(e) => field.handleChange(e.target.checked)}
								className="accent-primary cursor-pointer"
							/>
							<Label htmlFor="isActive" className="font-normal cursor-pointer">
								Cuenta activa (al desactivarla se cierran sus sesiones)
							</Label>
						</div>
					)}
				</form.Field>
			) : (
				<form.Field name="password">
					{(field) => (
						<CampoTexto
							id="password"
							type="password"
							autoComplete="new-password"
							label="Contraseña"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							errors={field.state.meta.isTouched ? field.state.meta.errors : []}
							disabled={isPending}
						/>
					)}
				</form.Field>
			)}
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isPending}>
					{usuario ? "Guardar cambios" : "Crear usuario"}
				</Button>
			</div>
		</form>
	);
}

function UsuariosComponent() {
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const miId = useAuthStore((state) => state.user?.id);
	const canCreate = permissions.includes("users:create");
	const canUpdate = permissions.includes("users:update");
	const canDelete = permissions.includes("users:delete");

	const [page, setPage] = useState(1);
	const [emailFiltro, setEmailFiltro] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editar, setEditar] = useState<UserDto | null>(null);
	const [eliminar, setEliminar] = useState<UserDto | null>(null);

	const {
		data: listado,
		isLoading,
		isError,
	} = useListarUsuarios(page, PAGE_SIZE, emailFiltro);
	const { mutate: borrar, isPending: borrando } = useEliminarUsuario();

	function cerrarForm() {
		setFormOpen(false);
		setEditar(null);
	}

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			<section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Shield className="size-5" />
					</div>
					<div className="text-left">
						<h1 className="text-2xl font-extrabold tracking-tight">Usuarios</h1>
						<p className="text-sm text-muted-foreground">
							Cuentas con acceso al sistema
						</p>
					</div>
				</div>
				{canCreate && (
					<Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
						<Plus className="size-4" />
						Crear usuario
					</Button>
				)}
			</section>

			<div className="space-y-1.5 text-left max-w-sm">
				<Label htmlFor="buscar-email">Buscar por correo</Label>
				<div className="relative">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="buscar-email"
						type="text"
						value={emailFiltro}
						onChange={(e) => {
							setEmailFiltro(e.target.value);
							setPage(1);
						}}
						className="pl-9"
					/>
				</div>
			</div>

			<ListaEstado isLoading={isLoading} isError={isError} />

			{listado && (
				<div className="overflow-x-auto rounded-xl border border-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Correo</TableHead>
								<TableHead>Rol</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="w-24 text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{listado.data.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-10 text-center text-muted-foreground"
									>
										No se encontraron usuarios.
									</TableCell>
								</TableRow>
							)}
							{listado.data.map((u) => (
								<TableRow key={u.id}>
									<TableCell className="font-medium">{u.name}</TableCell>
									<TableCell>{u.email}</TableCell>
									<TableCell>
										<Badge variant="secondary">{u.role}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={u.isActive ? "default" : "outline"}>
											{u.isActive ? "Activo" : "Inactivo"}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											{canUpdate && (
												<Button
													variant="ghost"
													size="icon"
													aria-label={`Editar ${u.name}`}
													onClick={() => {
														setEditar(u);
														setFormOpen(true);
													}}
												>
													<Pencil className="size-4" />
												</Button>
											)}
											{canDelete && u.id !== miId && (
												<Button
													variant="ghost"
													size="icon"
													aria-label={`Eliminar ${u.name}`}
													onClick={() => setEliminar(u)}
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

			{listado && listado.data.length > 0 && (
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
						>
							<ChevronLeft className="size-4" />
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= listado.totalPages}
						>
							Siguiente
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			<Dialog open={formOpen} onOpenChange={(o) => !o && cerrarForm()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editar ? "Editar usuario" : "Crear usuario"}
						</DialogTitle>
						<DialogDescription>
							{editar
								? "Modifica los datos de la cuenta."
								: "El usuario nuevo se crea con el rol por defecto."}
						</DialogDescription>
					</DialogHeader>
					{formOpen && (
						<UsuarioFormDialog
							key={editar?.id ?? "nuevo"}
							usuario={editar}
							onClose={cerrarForm}
						/>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmarDialog
				open={!!eliminar}
				onOpenChange={(o) => !o && setEliminar(null)}
				titulo="¿Eliminar usuario?"
				descripcion={
					<>
						Se eliminará la cuenta de{" "}
						<span className="font-semibold text-foreground">
							{eliminar?.email}
						</span>
						.
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

import { useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
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
import { useListarPermisos } from "@/modules/permiso/hooks/useListarPermisos";
import { useListarRoles } from "@/modules/permiso/hooks/useListarRoles";
import {
	useAsignarPermisosDirectosUsuario,
	useAsignarRolesUsuario,
	useObtenerAccesoUsuario,
} from "@/modules/permiso/hooks/useUsuarioAcceso";
import type { UserDto } from "@/modules/usuario/types";

interface UsuarioAccesoDialogProps {
	usuario: UserDto | null;
	onClose: () => void;
}

type EstadoOverride = "heredar" | "conceder" | "denegar";

export function UsuarioAccesoDialog({
	usuario,
	onClose,
}: UsuarioAccesoDialogProps) {
	const userId = usuario?.id ?? 0;
	const {
		data: acceso,
		isLoading: cargandoAcceso,
		isError: errorAcceso,
	} = useObtenerAccesoUsuario(userId, !!usuario);
	const { data: roles = [], isLoading: cargandoRoles } = useListarRoles();
	const { data: permisos = [], isLoading: cargandoPermisos } =
		useListarPermisos();

	const { mutate: guardarRoles, isPending: guardandoRoles } =
		useAsignarRolesUsuario(userId);
	const { mutate: guardarDirectos, isPending: guardandoDirectos } =
		useAsignarPermisosDirectosUsuario(userId);

	const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
	const [overrides, setOverrides] = useState<Map<number, EstadoOverride>>(
		() => new Map(),
	);

	useEffect(() => {
		if (!acceso) return;
		setSelectedRoleIds(acceso.roles.map((r) => r.id));
		const next = new Map<number, EstadoOverride>();
		for (const dp of acceso.directPermissions) {
			next.set(dp.permissionId, dp.granted ? "conceder" : "denegar");
		}
		setOverrides(next);
	}, [acceso]);

	const permisosPorRecurso = useMemo(() => {
		const map = new Map<string, typeof permisos>();
		for (const p of permisos) {
			map.set(p.resource, [...(map.get(p.resource) ?? []), p]);
		}
		return [...map.entries()];
	}, [permisos]);

	function toggleRole(roleId: number) {
		setSelectedRoleIds((prev) =>
			prev.includes(roleId)
				? prev.filter((id) => id !== roleId)
				: [...prev, roleId],
		);
	}

	function setEstadoPermiso(permissionId: number, estado: EstadoOverride) {
		setOverrides((prev) => {
			const next = new Map(prev);
			if (estado === "heredar") {
				next.delete(permissionId);
			} else {
				next.set(permissionId, estado);
			}
			return next;
		});
	}

	function handleGuardarRoles() {
		if (selectedRoleIds.length === 0) return;
		guardarRoles(selectedRoleIds);
	}

	function handleGuardarDirectos() {
		const payload = [...overrides.entries()].map(([permissionId, estado]) => ({
			permissionId,
			granted: estado === "conceder",
		}));
		guardarDirectos(payload);
	}

	return (
		<Dialog open={!!usuario} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ShieldCheck className="size-5 text-primary" />
						Roles y permisos de {usuario?.name}
					</DialogTitle>
					<DialogDescription>
						Asigna roles y define excepciones directas por permiso para{" "}
						{usuario?.email}.
					</DialogDescription>
				</DialogHeader>

				<ListaEstado
					isLoading={cargandoAcceso || cargandoRoles || cargandoPermisos}
					isError={errorAcceso}
				/>

				{acceso && (
					<div className="space-y-6 pt-2 text-left">
						<section className="space-y-3 rounded-lg border border-border p-4">
							<div className="flex items-center justify-between gap-2">
								<div>
									<h3 className="text-sm font-semibold">Roles asignados</h3>
									<p className="text-xs text-muted-foreground">
										Debe conservar al menos un rol activo.
									</p>
								</div>
								<Button
									type="button"
									size="sm"
									disabled={guardandoRoles || selectedRoleIds.length === 0}
									onClick={handleGuardarRoles}
								>
									{guardandoRoles ? "Guardando..." : "Guardar roles"}
								</Button>
							</div>
							<div className="grid gap-2 sm:grid-cols-2">
								{roles.map((r) => {
									const checked = selectedRoleIds.includes(r.id);
									return (
										<label
											key={r.id}
											className="flex items-start gap-2.5 rounded-md border border-border p-2.5 cursor-pointer hover:bg-muted/40"
										>
											<input
												type="checkbox"
												checked={checked}
												onChange={() => toggleRole(r.id)}
												className="mt-0.5 size-4 accent-primary cursor-pointer"
											/>
											<span className="space-y-0.5 text-sm">
												<span className="block font-medium">{r.name}</span>
												{r.description && (
													<span className="block text-xs text-muted-foreground">
														{r.description}
													</span>
												)}
											</span>
										</label>
									);
								})}
							</div>
						</section>

						<section className="space-y-3 rounded-lg border border-border p-4">
							<div className="flex items-center justify-between gap-2">
								<div>
									<h3 className="text-sm font-semibold flex items-center gap-1.5">
										<KeyRound className="size-4 text-primary" />
										Excepciones directas
									</h3>
									<p className="text-xs text-muted-foreground">
										Anulan los permisos heredados de los roles asignados.
									</p>
								</div>
								<Button
									type="button"
									size="sm"
									disabled={guardandoDirectos}
									onClick={handleGuardarDirectos}
								>
									{guardandoDirectos ? "Guardando..." : "Guardar excepciones"}
								</Button>
							</div>

							<div className="space-y-3 max-h-72 overflow-y-auto pr-1">
								{permisosPorRecurso.map(([recurso, items]) => (
									<div
										key={recurso}
										className="rounded-md border border-border/80 p-3 space-y-2"
									>
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											{recurso}
										</p>
										<div className="grid gap-2 sm:grid-cols-2">
											{items.map((p) => {
												const estado = overrides.get(p.id) ?? "heredar";
												return (
													<div
														key={p.id}
														className="flex items-center justify-between gap-2 rounded bg-muted/30 px-2.5 py-1.5"
													>
														<span className="text-xs font-medium">
															{p.action}
														</span>
														<select
															aria-label={`Permiso ${recurso}:${p.action}`}
															value={estado}
															onChange={(e) =>
																setEstadoPermiso(
																	p.id,
																	e.target.value as EstadoOverride,
																)
															}
															className="h-7 rounded border border-input bg-background px-2 text-xs cursor-pointer"
														>
															<option value="heredar">Heredar</option>
															<option value="conceder">Conceder</option>
															<option value="denegar">Denegar</option>
														</select>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</section>

						<section className="space-y-2">
							<p className="text-xs font-semibold text-muted-foreground">
								Permisos efectivos actuales (
								{acceso.effectivePermissions.length})
							</p>
							<div className="flex flex-wrap gap-1">
								{acceso.effectivePermissions.map((p) => (
									<Badge key={p.id} variant="secondary" className="text-[11px]">
										{p.resource}:{p.action}
									</Badge>
								))}
							</div>
						</section>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

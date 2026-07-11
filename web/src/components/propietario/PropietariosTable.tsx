import { Link } from "@tanstack/react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Phone, Mail, User } from "lucide-react";
import type { PropietarioDto } from "@/modules/propietario/types";

interface PropietariosTableProps {
	propietarios: PropietarioDto[];
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (propietario: PropietarioDto) => void;
	onDelete: (propietario: PropietarioDto) => void;
}

export function PropietariosTable({
	propietarios,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: PropietariosTableProps) {
	if (propietarios.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
				<div className="size-12 rounded-full bg-muted flex items-center justify-center">
					<User className="size-6 text-muted-foreground" />
				</div>
				<p className="text-muted-foreground font-medium">
					No hay propietarios registrados aún.
				</p>
				<p className="text-sm text-muted-foreground/70">
					Registra el primer propietario usando el botón de arriba.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border overflow-hidden shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="font-semibold text-foreground">
							Nombre
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Teléfono
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Correo
						</TableHead>
						<TableHead className="font-semibold text-foreground text-right">
							Acciones
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{propietarios.map((p) => (
						<TableRow
							key={p.id}
							className="hover:bg-muted/20 transition-colors duration-150"
						>
							<TableCell className="font-medium">{p.nombre}</TableCell>
							<TableCell>
								{p.telefono ? (
									<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Phone className="size-3.5 shrink-0" />
										{p.telefono}
									</span>
								) : (
									<Badge
										variant="outline"
										className="text-xs text-muted-foreground/60 font-normal"
									>
										Sin teléfono
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{p.correo ? (
									<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Mail className="size-3.5 shrink-0" />
										{p.correo}
									</span>
								) : (
									<Badge
										variant="outline"
										className="text-xs text-muted-foreground/60 font-normal"
									>
										Sin correo
									</Badge>
								)}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Link
										to="/dashboard/propietarios/$id"
										params={{ id: String(p.id) }}
										className={cn(
											buttonVariants({ variant: "ghost", size: "sm" }),
											"h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary",
										)}
									>
										<Eye className="size-4" />
										<span className="sr-only">Ver detalle</span>
									</Link>

									{canUpdate && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-500"
											onClick={() => onEdit(p)}
										>
											<Pencil className="size-4" />
											<span className="sr-only">Editar</span>
										</Button>
									)}

									{canDelete && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
											onClick={() => onDelete(p)}
										>
											<Trash2 className="size-4" />
											<span className="sr-only">Eliminar</span>
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

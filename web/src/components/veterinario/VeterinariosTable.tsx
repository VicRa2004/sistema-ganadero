import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Phone, FileText, Briefcase, User } from "lucide-react";
import type { VeterinarioDto } from "@/modules/veterinario/types";

interface VeterinariosTableProps {
	veterinarios: VeterinarioDto[];
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (veterinario: VeterinarioDto) => void;
	onDelete: (veterinario: VeterinarioDto) => void;
}

export function VeterinariosTable({
	veterinarios,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: VeterinariosTableProps) {
	if (veterinarios.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
				<div className="size-12 rounded-full bg-muted flex items-center justify-center">
					<User className="size-6 text-muted-foreground" />
				</div>
				<p className="text-muted-foreground font-medium">
					No hay veterinarios registrados aún.
				</p>
				<p className="text-sm text-muted-foreground/70">
					Registra tu primer veterinario usando el botón de arriba.
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
							Cédula Profesional
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Especialidad
						</TableHead>
						<TableHead className="font-semibold text-foreground text-right">
							Acciones
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{veterinarios.map((v) => (
						<TableRow
							key={v.id}
							className="hover:bg-muted/20 transition-colors duration-150"
						>
							<TableCell className="font-medium text-foreground">
								{v.nombre}
							</TableCell>
							<TableCell>
								<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<Phone className="size-3.5 shrink-0" />
									{v.telefono}
								</span>
							</TableCell>
							<TableCell>
								<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<FileText className="size-3.5 shrink-0 text-muted-foreground/80" />
									{v.cedulaProfesional}
								</span>
							</TableCell>
							<TableCell>
								{v.especialidad ? (
									<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Briefcase className="size-3.5 shrink-0 text-muted-foreground/70" />
										{v.especialidad}
									</span>
								) : (
									<Badge
										variant="outline"
										className="text-xs text-muted-foreground/60 font-normal"
									>
										General / Sin especialidad
									</Badge>
								)}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									{canUpdate && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer"
											onClick={() => onEdit(v)}
										>
											<Pencil className="size-4" />
											<span className="sr-only">Editar</span>
										</Button>
									)}

									{canDelete && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
											onClick={() => onDelete(v)}
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

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
import {
	Eye,
	Pencil,
	Trash2,
	Warehouse,
	MapPin,
	Maximize2,
} from "lucide-react";
import type { RanchoDto } from "@/modules/rancho/types";

interface RanchosTableProps {
	ranchos: RanchoDto[];
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (rancho: RanchoDto) => void;
	onDelete: (rancho: RanchoDto) => void;
}

export function RanchosTable({
	ranchos,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: RanchosTableProps) {
	if (ranchos.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
				<div className="size-12 rounded-full bg-muted flex items-center justify-center">
					<Warehouse className="size-6 text-muted-foreground" />
				</div>
				<p className="text-muted-foreground font-medium">
					No hay ranchos registrados aún.
				</p>
				<p className="text-sm text-muted-foreground/70">
					Registra el primer rancho usando el botón de arriba.
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
							Ubicación
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Extensión
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Capacidad Máxima
						</TableHead>
						<TableHead className="font-semibold text-foreground text-right">
							Acciones
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{ranchos.map((r) => (
						<TableRow
							key={r.id}
							className="hover:bg-muted/20 transition-colors duration-150"
						>
							<TableCell className="font-medium">{r.nombre}</TableCell>
							<TableCell>
								<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
									{r.ubicacion}
								</span>
							</TableCell>
							<TableCell>
								<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<Maximize2 className="size-3.5 shrink-0 text-muted-foreground/70" />
									{r.extensionHectareas} ha
								</span>
							</TableCell>
							<TableCell>
								<span className="font-medium text-foreground">
									{r.capacidadMaxima} cabezas
								</span>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Link
										to="/dashboard/ranchos/$id"
										params={{ id: String(r.id) }}
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
											onClick={() => onEdit(r)}
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
											onClick={() => onDelete(r)}
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

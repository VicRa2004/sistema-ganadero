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
	Scale,
	TrendingUp,
	Sprout,
	User,
	Warehouse,
	AlertTriangle,
} from "lucide-react";
import type { GanadoDto } from "@/modules/ganado/types";
import type { RazaDto } from "@/modules/raza/types";
import type { TerrenoDto } from "@/modules/terreno/types";
import type { PropietarioDto } from "@/modules/propietario/types";

interface GanadoTableProps {
	ganados: GanadoDto[];
	razas: RazaDto[];
	terrenos: TerrenoDto[];
	propietarios: PropietarioDto[];
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (g: GanadoDto) => void;
	onDelete: (g: GanadoDto) => void;
	onPesaje: (g: GanadoDto) => void;
	onTraslado: (g: GanadoDto) => void;
	onBaja: (g: GanadoDto) => void;
}

/** Calcula la edad en años/meses a partir de la fecha de nacimiento */
function calcularEdad(fechaNacimiento: string): string {
	const nacimiento = new Date(fechaNacimiento);
	const hoy = new Date();
	const totalMeses =
		(hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
		(hoy.getMonth() - nacimiento.getMonth());
	const años = Math.floor(totalMeses / 12);
	const meses = totalMeses % 12;
	if (años > 0) return meses > 0 ? `${años}a ${meses}m` : `${años} año(s)`;
	return `${meses} mes(es)`;
}

export function GanadoTable({
	ganados,
	razas,
	terrenos,
	propietarios,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
	onPesaje,
	onTraslado,
	onBaja,
}: GanadoTableProps) {
	if (ganados.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-border rounded-xl bg-muted/20 animate-fade-in">
				<div className="size-12 rounded-full bg-muted flex items-center justify-center">
					<Sprout className="size-6 text-muted-foreground" />
				</div>
				<p className="text-muted-foreground font-medium">
					No hay ganado registrado o coincide con los filtros aplicados.
				</p>
				<p className="text-sm text-muted-foreground/70">
					Registra una cabeza de ganado usando el botón superior.
				</p>
			</div>
		);
	}

	const getRazaNombre = (id: number) =>
		razas.find((r) => r.id === id)?.nombre || `Raza: ${id}`;
	const getTerrenoNombre = (id: number) =>
		terrenos.find((r) => r.id === id)?.nombre || `Terreno: ${id}`;
	const getPropietarioNombre = (id: number) =>
		propietarios.find((p) => p.id === id)?.nombre || `Prop: ${id}`;

	return (
		<div className="rounded-xl border border-border overflow-hidden shadow-sm animate-fade-in">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="font-semibold text-foreground w-20" />
						<TableHead className="font-semibold text-foreground">
							Arete / Identificador
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Sexo
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Raza
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Terreno
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Propietario
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Peso Actual
						</TableHead>
						<TableHead className="font-semibold text-foreground">
							Edad
						</TableHead>
						<TableHead className="font-semibold text-foreground text-right">
							Acciones
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{ganados.map((g) => (
						<TableRow
							key={g.id}
							className={cn(
								"hover:bg-muted/20 transition-colors duration-150",
								g.fechaBaja && "opacity-60",
							)}
						>
							{/* Thumbnail */}
							<TableCell>
								{g.imagenGanado ? (
									<img
										src={g.imagenGanado}
										alt={`Ganado ${g.identificador}`}
										className="size-10 rounded-lg object-cover border border-border"
									/>
								) : (
									<div className="size-10 rounded-lg bg-muted flex items-center justify-center border border-border">
										<Sprout className="size-5 text-muted-foreground" />
									</div>
								)}
							</TableCell>

							<TableCell>
								<div className="flex flex-col gap-0.5">
									<span className="font-extrabold text-foreground">
										{g.identificador}
									</span>
									{g.fechaBaja && (
										<span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
											<AlertTriangle className="size-3" />
											BAJA
										</span>
									)}
								</div>
							</TableCell>

							<TableCell>
								<span
									className={cn(
										"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
										g.sexo === "MACHO"
											? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
											: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
									)}
								>
									{g.sexo}
								</span>
							</TableCell>

							<TableCell>{getRazaNombre(g.razaId)}</TableCell>

							<TableCell>
								<span className="flex items-center gap-1 text-muted-foreground text-sm">
									<Warehouse className="size-3.5" />
									{getTerrenoNombre(g.terrenoId)}
								</span>
							</TableCell>

							<TableCell>
								<span className="flex items-center gap-1 text-muted-foreground text-sm">
									<User className="size-3.5" />
									{getPropietarioNombre(g.propietarioId)}
								</span>
							</TableCell>

							<TableCell className="font-semibold text-foreground">
								{g.peso} kg
							</TableCell>

							<TableCell className="text-muted-foreground text-sm">
								{calcularEdad(g.fechaNacimiento)}
							</TableCell>

							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-1.5">
									<Link
										to="/dashboard/ganado/$id"
										params={{ id: String(g.id) }}
										className={cn(
											buttonVariants({ variant: "ghost", size: "sm" }),
											"h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer",
										)}
										title="Ver ficha técnica"
									>
										<Eye className="size-4" />
										<span className="sr-only">Ver ficha</span>
									</Link>

									{canUpdate && !g.fechaBaja && (
										<>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
												onClick={() => onPesaje(g)}
												title="Registrar pesaje"
											>
												<Scale className="size-4" />
												<span className="sr-only">Pesaje</span>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
												onClick={() => onTraslado(g)}
												title="Trasladar de terreno"
											>
												<TrendingUp className="size-4" />
												<span className="sr-only">Trasladar</span>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer"
												onClick={() => onEdit(g)}
												title="Editar datos generales"
											>
												<Pencil className="size-4" />
												<span className="sr-only">Editar</span>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer"
												onClick={() => onBaja(g)}
												title="Dar de baja"
											>
												<AlertTriangle className="size-4" />
												<span className="sr-only">Dar de baja</span>
											</Button>
										</>
									)}

									{canDelete && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
											onClick={() => onDelete(g)}
											title="Eliminar ganado"
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

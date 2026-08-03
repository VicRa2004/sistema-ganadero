import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Activity,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Database,
	Eye,
	Filter,
	Loader2,
	Plus,
	Search,
	Stethoscope,
	Trash2,
	UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarSesionesSanitarias } from "@/modules/sesion-sanitaria/hooks/useListarSesionesSanitarias";
import { useEliminarSesionSanitaria } from "@/modules/sesion-sanitaria/hooks/useEliminarSesionSanitaria";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { RegistrarSesionSanitariaModal } from "./RegistrarSesionSanitariaModal";
import { SesionSanitariaDetalleModal } from "./SesionSanitariaDetalleModal";

const SELECT_CLASS =
	"flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer";

export function SesionesSanitariasTable() {
	const [page, setPage] = useState(1);
	const [busqueda, setBusqueda] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [veterinarioFilter, setVeterinarioFilter] = useState<number | "">("");
	const [insumoFilter, setInsumoFilter] = useState<number | "">("");

	const [registrarOpen, setRegistrarOpen] = useState(false);
	const [detalleSesionId, setDetalleSesionId] = useState<number | null>(null);

	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canCreate = permissions.includes("sesiones-sanitarias:create");
	const canDelete = permissions.includes("sesiones-sanitarias:delete");

	const { data: pagination, isLoading } = useListarSesionesSanitarias({
		page,
		limit: 10,
		busqueda: busqueda || undefined,
		veterinarioId: veterinarioFilter ? Number(veterinarioFilter) : undefined,
		insumoId: insumoFilter ? Number(insumoFilter) : undefined,
	});

	const { data: veterinariosData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const eliminarMutation = useEliminarSesionSanitaria();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setBusqueda(searchInput.trim());
		setPage(1);
	};

	const handleEliminar = async (id: number, descripcion: string) => {
		if (
			window.confirm(
				`¿Está seguro de eliminar la sesión sanitaria "${descripcion}"?`,
			)
		) {
			await eliminarMutation.mutateAsync(id);
		}
	};

	const sesiones = pagination?.data ?? [];
	const totalPages = pagination?.totalPages ?? 1;

	return (
		<div className="space-y-4">
			{/* Encabezado y botón de acción */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
				<div>
					<h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
						<Activity className="size-5 text-primary" />
						Sesiones Sanitarias
					</h2>
					<p className="text-xs text-muted-foreground">
						Campañas de vacunación, desparasitación y chequeos masivos aplicados
						al ganado.
					</p>
				</div>

				{canCreate && (
					<Button
						onClick={() => setRegistrarOpen(true)}
						className="gap-2 cursor-pointer shrink-0"
					>
						<Plus className="size-4" />
						Nueva Sesión Sanitaria
					</Button>
				)}
			</div>

			{/* Filtros */}
			<div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
				<form onSubmit={handleSearch} className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Buscar por descripción / motivo de la sesión..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-9 h-9 text-sm"
						/>
					</div>
					<Button
						type="submit"
						size="sm"
						className="h-9 px-4 gap-1.5 cursor-pointer"
					>
						<Search className="size-3.5" />
						Buscar
					</Button>
				</form>

				<div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
					<div className="flex items-center gap-1.5 text-muted-foreground font-medium mr-1">
						<Filter className="size-3.5 text-primary" />
						<span>Filtrar por:</span>
					</div>

					<select
						value={veterinarioFilter}
						onChange={(e) => {
							setVeterinarioFilter(
								e.target.value === "" ? "" : Number(e.target.value),
							);
							setPage(1);
						}}
						className={SELECT_CLASS}
					>
						<option value="">Todos los veterinarios</option>
						{(veterinariosData?.data ?? []).map((vet) => (
							<option key={vet.id} value={vet.id}>
								{vet.nombre}
							</option>
						))}
					</select>

					<select
						value={insumoFilter}
						onChange={(e) => {
							setInsumoFilter(
								e.target.value === "" ? "" : Number(e.target.value),
							);
							setPage(1);
						}}
						className={SELECT_CLASS}
					>
						<option value="">Vacunas y Medicamentos</option>
						{(insumosData?.data ?? [])
							.filter((ins) => ["VACUNA", "MEDICAMENTO"].includes(ins.tipo))
							.map((ins) => (
								<option key={ins.id} value={ins.id}>
									[{ins.tipo}] {ins.nombre}
								</option>
							))}
					</select>
				</div>
			</div>

			{/* Tabla de registros */}
			<div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
						<Loader2 className="size-8 animate-spin text-primary" />
						<span className="text-sm">Cargando sesiones sanitarias...</span>
					</div>
				) : sesiones.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2 text-center">
						<Activity className="size-10 text-muted-foreground/30" />
						<p className="font-semibold text-foreground">
							No se encontraron sesiones sanitarias
						</p>
						<p className="text-xs">
							Crea una nueva jornada de vacunación o modifica los filtros de
							búsqueda.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
								<tr>
									<th className="p-3.5">ID / Fecha</th>
									<th className="p-3.5">Descripción / Motivo</th>
									<th className="p-3.5">Insumo Consumido</th>
									<th className="p-3.5">Veterinario</th>
									<th className="p-3.5 text-center">Animales Atendidos</th>
									<th className="p-3.5 text-center">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{sesiones.map((s) => (
									<tr
										key={s.id}
										className="hover:bg-muted/30 transition-colors"
									>
										<td className="p-3.5 whitespace-nowrap">
											<div className="font-bold text-foreground">#{s.id}</div>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="size-3 text-primary" />
												{new Date(s.fecha).toLocaleDateString()}
											</div>
										</td>

										<td className="p-3.5 max-w-xs">
											<p className="font-semibold text-foreground truncate">
												{s.descripcion}
											</p>
										</td>

										<td className="p-3.5 whitespace-nowrap">
											<div className="flex items-center gap-1.5 font-medium text-foreground">
												<Database className="size-3.5 text-primary shrink-0" />
												<span>{s.nombreInsumo || `Insumo #${s.insumoId}`}</span>
											</div>
											<div className="text-xs text-muted-foreground">
												Total: {s.totalDosisAplicadas}{" "}
												{s.unidadMedidaInsumo || "dosis"}
											</div>
										</td>

										<td className="p-3.5 whitespace-nowrap">
											<div className="flex items-center gap-1.5 font-medium text-foreground">
												<UserCheck className="size-3.5 text-primary shrink-0" />
												<span>
													{s.nombreVeterinario || `Vet #${s.veterinarioId}`}
												</span>
											</div>
										</td>

										<td className="p-3.5 text-center">
											<Badge
												variant="secondary"
												className="font-bold px-2.5 py-0.5"
											>
												{s.totalAnimales} cabezas
											</Badge>
										</td>

										<td className="p-3.5 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setDetalleSesionId(s.id)}
													className="h-8 px-2 text-xs gap-1 cursor-pointer"
													title="Ver detalle de aplicaciones"
												>
													<Eye className="size-3.5 text-primary" />
													Ver Detalle
												</Button>

												{canDelete && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEliminar(s.id, s.descripcion)}
														className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
														title="Eliminar sesión sanitaria"
													>
														<Trash2 className="size-3.5" />
													</Button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Controles de Paginación */}
				<div className="flex items-center justify-between p-4 border-t border-border text-xs">
					<span className="text-muted-foreground font-medium">
						Página {page} de {totalPages || 1} ({pagination?.totalItems ?? 0}{" "}
						registros)
					</span>

					<div className="flex items-center gap-1.5">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page <= 1 || isLoading}
							className="h-8 px-2.5 gap-1 cursor-pointer"
						>
							<ChevronLeft className="size-3.5" />
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages || isLoading}
							className="h-8 px-2.5 gap-1 cursor-pointer"
						>
							Siguiente
							<ChevronRight className="size-3.5" />
						</Button>
					</div>
				</div>
			</div>

			{/* Modal de Registro */}
			<RegistrarSesionSanitariaModal
				open={registrarOpen}
				onOpenChange={setRegistrarOpen}
			/>

			{/* Modal de Detalle */}
			<SesionSanitariaDetalleModal
				sesionId={detalleSesionId}
				open={detalleSesionId !== null}
				onOpenChange={(open) => {
					if (!open) setDetalleSesionId(null);
				}}
			/>
		</div>
	);
}

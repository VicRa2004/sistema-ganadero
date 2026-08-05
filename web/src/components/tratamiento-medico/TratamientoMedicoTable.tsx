import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useEliminarTratamiento } from "@/modules/tratamiento-medico/hooks/useEliminarTratamiento";
import { useFinalizarTratamiento } from "@/modules/tratamiento-medico/hooks/useFinalizarTratamiento";
import { useListarTratamientosMedicos } from "@/modules/tratamiento-medico/hooks/useListarTratamientosMedicos";
import type { TratamientoMedicoDto } from "@/modules/tratamiento-medico/types";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import {
	Activity,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Eye,
	Filter,
	Loader2,
	Pill,
	Plus,
	Search,
	Sprout,
	Stethoscope,
	Trash2,
} from "lucide-react";
import { AplicarDosisDiariaModal } from "./AplicarDosisDiariaModal";
import { DetalleTratamientoModal } from "./DetalleTratamientoModal";
import { ProgramarTratamientoModal } from "./ProgramarTratamientoModal";

const SELECT_CLASS =
	"flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer";

export function TratamientoMedicoTable() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [activoFilter, setActivoFilter] = useState<string>("all");
	const [insumoFilter, setInsumoFilter] = useState<number | "">("");
	const [veterinarioFilter, setVeterinarioFilter] = useState<number | "">("");

	const [programarOpen, setProgramarOpen] = useState(false);
	const [aplicarTarget, setAplicarTarget] =
		useState<TratamientoMedicoDto | null>(null);
	const [detalleTargetId, setDetalleTargetId] = useState<number | null>(null);

	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const canCreate = permissions.includes("tratamientos-medicos:create");
	const canUpdate = permissions.includes("tratamientos-medicos:update");
	const canDelete = permissions.includes("tratamientos-medicos:delete");

	const activoParam =
		activoFilter === "active"
			? true
			: activoFilter === "finished"
				? false
				: undefined;

	const { data: pagination, isLoading } = useListarTratamientosMedicos({
		page,
		limit: 10,
		search: search || undefined,
		activo: activoParam,
		insumoId: insumoFilter ? Number(insumoFilter) : undefined,
		veterinarioId: veterinarioFilter ? Number(veterinarioFilter) : undefined,
	});

	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: veterinariosData } = useListarVeterinarios(1, 100);

	const finalizarMutation = useFinalizarTratamiento();
	const eliminarMutation = useEliminarTratamiento();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput.trim());
		setPage(1);
	};

	const handleFinalizar = async (id: number, diagnostico: string) => {
		if (
			window.confirm(
				`¿Está seguro de concluir el tratamiento para "${diagnostico}"?`,
			)
		) {
			await finalizarMutation.mutateAsync(id);
		}
	};

	const handleEliminar = async (id: number, diagnostico: string) => {
		if (
			window.confirm(
				`¿Está seguro de eliminar el registro del tratamiento "${diagnostico}"?`,
			)
		) {
			await eliminarMutation.mutateAsync(id);
		}
	};

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "-";
		const d = new Date(dateStr);
		return d.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const tratamientos = pagination?.data ?? [];
	const totalPages = pagination?.totalPages ?? 1;

	return (
		<div className="space-y-4">
			{/* Encabezado Principal */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
				<div>
					<h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
						<Stethoscope className="size-5 text-primary" />
						Tratamientos Médicos
					</h2>
					<p className="text-xs text-muted-foreground">
						Recetas individuales, control de dosis aplicadas y atención a ganado
						enfermo.
					</p>
				</div>

				{canCreate && (
					<Button
						onClick={() => setProgramarOpen(true)}
						className="gap-2 cursor-pointer shrink-0"
					>
						<Plus className="size-4" />
						Recetar Tratamiento
					</Button>
				)}
			</div>

			{/* Barra de Filtros y Búsqueda */}
			<div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
				<form onSubmit={handleSearch} className="flex gap-2 flex-1">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
						<Input
							placeholder="Buscar por diagnóstico o arete de ganado..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-9 text-xs"
						/>
					</div>
					<Button
						type="submit"
						variant="secondary"
						className="text-xs cursor-pointer"
					>
						Buscar
					</Button>
				</form>

				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Filter className="size-3.5" />
						<span>Filtros:</span>
					</div>

					{/* Filtro por Estado */}
					<select
						value={activoFilter}
						onChange={(e) => {
							setActivoFilter(e.target.value);
							setPage(1);
						}}
						className={SELECT_CLASS}
					>
						<option value="all">Todos los Estados</option>
						<option value="active">🟢 Solo Activos</option>
						<option value="finished">⚪ Concluidos</option>
					</select>

					{/* Filtro por Medicamento */}
					<select
						value={insumoFilter}
						onChange={(e) => {
							setInsumoFilter(e.target.value ? Number(e.target.value) : "");
							setPage(1);
						}}
						className={SELECT_CLASS}
					>
						<option value="">Todos los Insumos</option>
						{(insumosData?.data ?? []).map((i) => (
							<option key={i.id} value={i.id}>
								{i.nombre}
							</option>
						))}
					</select>

					{/* Filtro por Veterinario */}
					<select
						value={veterinarioFilter}
						onChange={(e) => {
							setVeterinarioFilter(
								e.target.value ? Number(e.target.value) : "",
							);
							setPage(1);
						}}
						className={SELECT_CLASS}
					>
						<option value="">Todos los Veterinarios</option>
						{(veterinariosData?.data ?? []).map((v) => (
							<option key={v.id} value={v.id}>
								{v.nombre}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Tabla de Tratamientos Médicos */}
			<div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-xs">
						<Loader2 className="size-6 animate-spin text-primary" />
						<span>Cargando tratamientos médicos...</span>
					</div>
				) : tratamientos.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground gap-2">
						<Stethoscope className="size-8 text-muted-foreground/40" />
						<p className="font-semibold text-foreground">
							No se encontraron tratamientos médicos.
						</p>
						<p>Pruebe ajustando los filtros o registre un nuevo tratamiento.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
								<tr>
									<th className="px-4 py-3">Paciente (Ganado)</th>
									<th className="px-4 py-3">Diagnóstico</th>
									<th className="px-4 py-3">Medicamento & Dosis</th>
									<th className="px-4 py-3">Periodo</th>
									<th className="px-4 py-3">Veterinario</th>
									<th className="px-4 py-3">Estado</th>
									<th className="px-4 py-3 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{tratamientos.map((t) => (
									<tr
										key={t.id}
										className="hover:bg-muted/30 transition-colors duration-150"
									>
										<td className="px-4 py-3 font-semibold text-foreground">
											<div className="flex items-center gap-1.5">
												<Sprout className="size-3.5 text-emerald-600 dark:text-emerald-400" />
												<span>
													{t.ganadoIdentificador ?? `Animal #${t.ganadoId}`}
												</span>
											</div>
										</td>

										<td className="px-4 py-3 font-medium text-foreground">
											{t.diagnostico}
										</td>

										<td className="px-4 py-3 text-muted-foreground">
											<div className="flex items-center gap-1 font-medium text-foreground">
												<Pill className="size-3.5 text-blue-500" />
												<span>{t.insumoNombre ?? `Insumo #${t.insumoId}`}</span>
											</div>
											<div className="text-[11px] text-muted-foreground/80">
												Dosis: {t.dosisDiaria} {t.insumoUnidad ?? "unidades"}
											</div>
										</td>

										<td className="px-4 py-3 text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="size-3 text-muted-foreground/70" />
												<span>
													{formatDate(t.fechaInicio)} - {formatDate(t.fechaFin)}
												</span>
											</div>
										</td>

										<td className="px-4 py-3 text-muted-foreground">
											{t.veterinarioNombre ?? (
												<span className="text-muted-foreground/50 italic">
													Sin asignar
												</span>
											)}
										</td>

										<td className="px-4 py-3">
											{t.activo ? (
												<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2 py-0.5 text-[10px] font-semibold">
													<span className="relative flex h-1.5 w-1.5">
														<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
														<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
													</span>
													Activo
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="bg-muted text-muted-foreground gap-1 px-2 py-0.5 text-[10px]"
												>
													<CheckCircle2 className="size-3" />
													Concluido
												</Badge>
											)}
										</td>

										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-1">
												{/* Botón Aplicar Dosis (si está activo y puede actualizar) */}
												{canUpdate && t.activo && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => setAplicarTarget(t)}
														title="Aplicar dosis diaria"
														className="h-7 px-2 text-[11px] gap-1 cursor-pointer text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
													>
														<Pill className="size-3" />
														Dosis
													</Button>
												)}

												{/* Botón Ver Detalle */}
												<Button
													size="icon"
													variant="ghost"
													onClick={() => setDetalleTargetId(t.id)}
													title="Ver detalle del tratamiento"
													className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
												>
													<Eye className="size-3.5" />
												</Button>

												{/* Botón Concluir (si está activo) */}
												{canUpdate && t.activo && (
													<Button
														size="icon"
														variant="ghost"
														onClick={() => handleFinalizar(t.id, t.diagnostico)}
														title="Concluir tratamiento"
														className="size-7 cursor-pointer text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
													>
														<CheckCircle2 className="size-3.5" />
													</Button>
												)}

												{/* Botón Eliminar */}
												{canDelete && (
													<Button
														size="icon"
														variant="ghost"
														onClick={() => handleEliminar(t.id, t.diagnostico)}
														title="Eliminar registro"
														className="size-7 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10"
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

				{/* Paginación */}
				<div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
					<span>
						Página {page} de {totalPages} ({pagination?.totalItems ?? 0}{" "}
						tratamientos)
					</span>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page <= 1}
							className="size-7 cursor-pointer"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages}
							className="size-7 cursor-pointer"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Modales */}
			<ProgramarTratamientoModal
				open={programarOpen}
				onOpenChange={setProgramarOpen}
			/>

			<AplicarDosisDiariaModal
				tratamiento={aplicarTarget}
				open={!!aplicarTarget}
				onOpenChange={(open) => {
					if (!open) setAplicarTarget(null);
				}}
			/>

			<DetalleTratamientoModal
				tratamientoId={detalleTargetId}
				open={!!detalleTargetId}
				onOpenChange={(open) => {
					if (!open) setDetalleTargetId(null);
				}}
			/>
		</div>
	);
}

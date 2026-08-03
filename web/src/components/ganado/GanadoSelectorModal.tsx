import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Loader2,
	ChevronLeft,
	ChevronRight,
	X,
	Check,
	Tag,
	Scale,
	Calendar,
	Filter,
	Sparkles,
} from "lucide-react";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import type { GanadoDto, SexoGanado } from "@/modules/ganado/types";
import type { RazaDto } from "@/modules/raza/types";

const SELECT_CLASS =
	"flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

interface GanadoSelectorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	/** Sexo por defecto para filtrar (MACHO para padre, HEMBRA para madre) */
	defaultSexo?: SexoGanado | "";
	/** ID del ganado actualmente seleccionado */
	selectedId?: number | null;
	/** ID del ganado que se está editando (para no permitir seleccionar a sí mismo) */
	excludeId?: number;
	razas?: RazaDto[];
	onSelect: (ganado: GanadoDto | null) => void;
}

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") ||
	"http://localhost:3000";

const getImagenUrl = (path: string | null) => {
	if (!path) return null;
	if (
		path.startsWith("blob:") ||
		path.startsWith("data:") ||
		path.startsWith("http:") ||
		path.startsWith("https:")
	) {
		return path;
	}
	return `${baseApiUrl}${path}`;
};

export function GanadoSelectorModal({
	open,
	onOpenChange,
	title,
	description,
	defaultSexo = "",
	selectedId = null,
	excludeId,
	razas = [],
	onSelect,
}: GanadoSelectorModalProps) {
	const [page, setPage] = useState(1);
	const [identificadorSearch, setIdentificadorSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [sexoFilter, setSexoFilter] = useState<SexoGanado | "">(defaultSexo);
	const [estadoFilter, setEstadoFilter] = useState<
		"todos" | "activos" | "baja"
	>("todos");
	const [razaFilter, setRazaFilter] = useState<number | "">("");

	// Resetear estados cuando cambia defaultSexo o se abre el modal
	useEffect(() => {
		if (open) {
			setPage(1);
			setSearchInput("");
			setIdentificadorSearch("");
			setSexoFilter(defaultSexo);
			setEstadoFilter("todos");
			setRazaFilter("");
		}
	}, [open, defaultSexo]);

	// Convertir estadoFilter a param soloActivos para la API
	const soloActivosParam = estadoFilter === "activos";

	const { data: pagination, isLoading } = useListarGanado(
		{
			page,
			limit: 6,
			identificador: identificadorSearch,
			sexo: sexoFilter || undefined,
			razaId: razaFilter ? Number(razaFilter) : undefined,
			soloActivos: soloActivosParam,
		},
		open,
	);

	// Aplicar filtro local si estadoFilter === 'baja' o 'activos'
	const ganadosRaw = pagination?.data ?? [];
	const ganadosList = ganadosRaw.filter((g) => {
		if (excludeId && g.id === excludeId) return false;
		if (estadoFilter === "activos") return g.fechaBaja === null;
		if (estadoFilter === "baja") return g.fechaBaja !== null;
		return true;
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setIdentificadorSearch(searchInput.trim());
		setPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setIdentificadorSearch("");
		setPage(1);
	};

	const totalPages = pagination?.totalPages ?? 1;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 gap-4">
				<DialogHeader className="space-y-1 text-left">
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						<Sparkles className="size-5 text-primary" />
						{title}
					</DialogTitle>
					{description && (
						<DialogDescription className="text-sm text-muted-foreground">
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				{/* ── Filtros y Buscador ── */}
				<div className="space-y-3 bg-muted/20 p-3.5 rounded-xl border border-border">
					<form onSubmit={handleSearch} className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Buscar por arete / identificador..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-9 pr-8 h-9 text-sm"
							/>
							{searchInput && (
								<button
									type="button"
									onClick={handleClearSearch}
									className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
								>
									<X className="size-4" />
								</button>
							)}
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
							<span>Filtros:</span>
						</div>

						{/* Filtro Sexo */}
						<select
							value={sexoFilter}
							onChange={(e) => {
								setSexoFilter(e.target.value as SexoGanado | "");
								setPage(1);
							}}
							className={SELECT_CLASS}
						>
							<option value="">Cualquier sexo</option>
							<option value="MACHO">Solo Machos (Padres)</option>
							<option value="HEMBRA">Solo Hembras (Madres)</option>
						</select>

						{/* Filtro Estado (Activos / Dados de baja) */}
						<select
							value={estadoFilter}
							onChange={(e) => {
								setEstadoFilter(e.target.value as "todos" | "activos" | "baja");
								setPage(1);
							}}
							className={SELECT_CLASS}
						>
							<option value="todos">Todos (Activos y Dados de baja)</option>
							<option value="activos">Solo Activos</option>
							<option value="baja">Solo Dados de baja</option>
						</select>

						{/* Filtro Raza */}
						{razas.length > 0 && (
							<select
								value={razaFilter}
								onChange={(e) => {
									setRazaFilter(
										e.target.value === "" ? "" : Number(e.target.value),
									);
									setPage(1);
								}}
								className={SELECT_CLASS}
							>
								<option value="">Todas las razas</option>
								{razas.map((r) => (
									<option key={r.id} value={r.id}>
										{r.nombre}
									</option>
								))}
							</select>
						)}
					</div>
				</div>

				{/* ── Lista Paginada de Ganados ── */}
				<div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] pr-1">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
							<Loader2 className="size-7 animate-spin text-primary" />
							<span className="text-sm">Cargando ganados...</span>
						</div>
					) : ganadosList.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2 text-center">
							<Tag className="size-10 text-muted-foreground/40" />
							<p className="font-medium text-foreground">
								No se encontraron ganados
							</p>
							<p className="text-xs">
								Prueba cambiando los criterios de búsqueda o filtros.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{ganadosList.map((g) => {
								const isSelected = selectedId === g.id;
								const isDadoDeBaja = g.fechaBaja !== null;
								const imagenUrl = getImagenUrl(g.imagenGanado);

								return (
									<button
										key={g.id}
										type="button"
										onClick={() => {
											onSelect(isSelected ? null : g);
											onOpenChange(false);
										}}
										className={`group relative flex items-center gap-3.5 p-3 rounded-xl border transition-all cursor-pointer text-left w-full ${
											isSelected
												? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
												: "border-border hover:border-primary/50 hover:bg-muted/30"
										}`}
									>
										{/* Foto o Avatar */}
										<div className="relative size-14 rounded-lg overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
											{imagenUrl ? (
												<img
													src={imagenUrl}
													alt={g.identificador}
													className="size-full object-cover group-hover:scale-105 transition-transform"
												/>
											) : (
												<Tag className="size-6 text-muted-foreground/50" />
											)}
										</div>

										{/* Información Esencial */}
										<div className="flex-1 min-w-0 space-y-1">
											<div className="flex items-center justify-between gap-1">
												<span className="font-bold text-sm text-foreground truncate">
													{g.identificador}
												</span>
												<div className="flex items-center gap-1 shrink-0">
													<Badge
														variant={
															g.sexo === "MACHO" ? "default" : "secondary"
														}
														className="text-[10px] px-1.5 py-0 font-semibold"
													>
														{g.sexo}
													</Badge>
												</div>
											</div>

											<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Scale className="size-3 text-muted-foreground/70" />
													{g.peso} kg
												</span>
												<span className="flex items-center gap-1">
													<Calendar className="size-3 text-muted-foreground/70" />
													{g.fechaNacimiento}
												</span>
											</div>

											{/* Badge de Estado */}
											<div className="pt-0.5">
												{isDadoDeBaja ? (
													<Badge
														variant="outline"
														className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
													>
														Dado de Baja
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
													>
														Activo
													</Badge>
												)}
											</div>
										</div>

										{/* Check icon si está seleccionado */}
										{isSelected && (
											<div className="absolute right-2 top-2 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
												<Check className="size-3.5 stroke-[3]" />
											</div>
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* ── Controles de Paginación ── */}
				<div className="flex items-center justify-between pt-3 border-t border-border text-xs">
					<div className="text-muted-foreground font-medium">
						Página {page} de {totalPages || 1} ({pagination?.totalItems ?? 0}{" "}
						ganados)
					</div>

					<div className="flex items-center gap-1.5">
						<Button
							type="button"
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
							type="button"
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

				<DialogFooter className="pt-2 border-t border-border flex justify-between sm:justify-between items-center gap-2">
					{selectedId ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
							onClick={() => {
								onSelect(null);
								onOpenChange(false);
							}}
						>
							<X className="size-3.5" />
							Quitar selección actual
						</Button>
					) : (
						<div />
					)}

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
						className="cursor-pointer"
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

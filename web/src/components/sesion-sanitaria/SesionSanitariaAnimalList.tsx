import {
	Check,
	ChevronLeft,
	ChevronRight,
	Info,
	Loader2,
	Plus,
	Search,
	Syringe,
	Tag,
	Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GanadoDto } from "@/modules/ganado/types";
import type { InsumoDto } from "@/modules/inventario-insumos/types";

export interface AplicacionItem {
	ganadoId: number;
	identificador: string;
	peso: number;
	dosisAplicada: string;
	observaciones: string;
}

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";

function getImagenUrl(path: string | null) {
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
}

interface SesionSanitariaAnimalListProps {
	insumoSeleccionado: InsumoDto | undefined;
	aplicaciones: AplicacionItem[];
	ganados: GanadoDto[];
	isLoadingGanado: boolean;
	busquedaGanado: string;
	onBusquedaChange: (value: string) => void;
	ganadoPage: number;
	totalGanadoPages: number;
	onPageChange: (nextPage: number) => void;
	onSeleccionarTodos: () => void;
	onAgregarGanado: (id: number, identificador: string, peso: number) => void;
	onQuitarGanado: (ganadoId: number) => void;
	onActualizarDosis: (ganadoId: number, dosis: string) => void;
	onActualizarObservaciones: (ganadoId: number, obs: string) => void;
}

export function SesionSanitariaAnimalList({
	insumoSeleccionado,
	aplicaciones,
	ganados,
	isLoadingGanado,
	busquedaGanado,
	onBusquedaChange,
	ganadoPage,
	totalGanadoPages,
	onPageChange,
	onSeleccionarTodos,
	onAgregarGanado,
	onQuitarGanado,
	onActualizarDosis,
	onActualizarObservaciones,
}: SesionSanitariaAnimalListProps) {
	const tieneInsumoSeleccionado = Boolean(insumoSeleccionado);
	const totalDosisCalculadas = aplicaciones.reduce(
		(acc, a) => acc + (Number(a.dosisAplicada) || 0),
		0,
	);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
				<div className="flex items-center gap-2">
					<Syringe className="size-4 text-primary" />
					<h3 className="text-sm font-bold">
						Animales Participantes ({aplicaciones.length})
					</h3>
				</div>

				{insumoSeleccionado && (
					<Badge
						variant={
							insumoSeleccionado.stock < totalDosisCalculadas
								? "destructive"
								: "outline"
						}
						className="text-xs px-2.5 py-1 font-semibold"
					>
						Consumo Total: {totalDosisCalculadas} / {insumoSeleccionado.stock}{" "}
						{insumoSeleccionado.unidadMedida}
					</Badge>
				)}
			</div>

			{!tieneInsumoSeleccionado && (
				<div className="p-3 rounded-lg text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2">
					<Info className="size-4 shrink-0 text-amber-500" />
					<span>
						<strong>Paso requerido:</strong> Selecciona un medicamento o vacuna
						arriba para añadir animales a la sesión.
					</span>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-3 rounded-xl border border-border">
				<div className="space-y-2.5 border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-3 flex flex-col justify-between">
					<div className="space-y-2.5">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs font-semibold text-muted-foreground">
								Seleccionar ganados activos
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={!tieneInsumoSeleccionado}
								onClick={onSeleccionarTodos}
								className="h-7 text-xs text-primary cursor-pointer hover:bg-primary/10"
							>
								Seleccionar todos
							</Button>
						</div>

						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
							<Input
								type="text"
								aria-label="Buscar ganado por arete"
								placeholder="Buscar por arete..."
								value={busquedaGanado}
								onChange={(e) => onBusquedaChange(e.target.value)}
								className="pl-8 h-8 text-xs"
							/>
						</div>

						<div className="max-h-56 min-h-[190px] overflow-y-auto space-y-1.5 pr-1 border border-border rounded-lg p-1.5 bg-background">
							{isLoadingGanado ? (
								<div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
									<Loader2 className="size-4 animate-spin text-primary" />
									Cargando ganado...
								</div>
							) : ganados.length === 0 ? (
								<p className="text-xs text-muted-foreground text-center py-8">
									No hay animales activos disponibles.
								</p>
							) : (
								ganados.map((g) => {
									const agregado = aplicaciones.some(
										(a) => a.ganadoId === g.id,
									);
									const imagenUrl = getImagenUrl(g.imagenGanado);
									return (
										<div
											key={g.id}
											className={`flex items-center justify-between p-1.5 rounded-lg text-xs border transition-colors ${
												agregado
													? "bg-muted/40 border-border opacity-60"
													: "hover:bg-muted/30 border-border/60"
											}`}
										>
											<div className="flex items-center gap-2 min-w-0">
												<div className="relative size-8 rounded overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
													{imagenUrl ? (
														<img
															src={imagenUrl}
															alt={g.identificador}
															className="size-full object-cover"
														/>
													) : (
														<Tag className="size-4 text-muted-foreground/40" />
													)}
												</div>
												<div className="truncate">
													<span className="font-bold text-foreground block truncate">
														{g.identificador}
													</span>
													<span className="text-[10px] text-muted-foreground">
														{g.peso} kg • {g.sexo}
													</span>
												</div>
											</div>
											<Button
												type="button"
												variant={agregado ? "secondary" : "default"}
												size="sm"
												disabled={agregado || !tieneInsumoSeleccionado}
												onClick={() =>
													onAgregarGanado(g.id, g.identificador, g.peso)
												}
												className="h-6 px-2 text-[11px] cursor-pointer shrink-0"
											>
												{agregado ? (
													<>
														<Check className="size-3 mr-1" /> Añadido
													</>
												) : (
													<>
														<Plus className="size-3 mr-1" /> Añadir
													</>
												)}
											</Button>
										</div>
									);
								})
							)}
						</div>
					</div>

					<div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground border-t border-border/40">
						<span>
							Pág. {ganadoPage} de {totalGanadoPages}
						</span>
						<div className="flex items-center gap-1">
							<Button
								type="button"
								variant="outline"
								size="sm"
								aria-label="Página anterior de ganado"
								onClick={() => onPageChange(Math.max(1, ganadoPage - 1))}
								disabled={ganadoPage <= 1 || isLoadingGanado}
								className="h-6 w-6 p-0 cursor-pointer"
							>
								<ChevronLeft className="size-3" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								aria-label="Página siguiente de ganado"
								onClick={() =>
									onPageChange(Math.min(totalGanadoPages, ganadoPage + 1))
								}
								disabled={ganadoPage >= totalGanadoPages || isLoadingGanado}
								className="h-6 w-6 p-0 cursor-pointer"
							>
								<ChevronRight className="size-3" />
							</Button>
						</div>
					</div>
				</div>

				<div className="space-y-2.5">
					<span className="text-xs font-semibold text-muted-foreground">
						Lista de Aplicación ({aplicaciones.length} Seleccionados)
					</span>

					<div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-border rounded-lg p-1.5 bg-background">
						{aplicaciones.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground text-center">
								<Syringe className="size-6 text-muted-foreground/40 mb-1" />
								<span>No has agregado ningún animal.</span>
								<span className="text-[11px]">
									Haz clic en &quot;Añadir&quot; en la columna izquierda.
								</span>
							</div>
						) : (
							aplicaciones.map((app) => (
								<div
									key={app.ganadoId}
									className="p-2 rounded-lg border border-border bg-muted/20 space-y-1.5"
								>
									<div className="flex items-center justify-between text-xs">
										<div className="font-bold text-foreground flex items-center gap-1.5">
											<Badge
												variant="outline"
												className="text-[10px] px-1.5 py-0"
											>
												{app.identificador}
											</Badge>
											<span className="text-muted-foreground text-[11px]">
												{app.peso} kg
											</span>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											aria-label={`Quitar ${app.identificador} de la sesión`}
											onClick={() => onQuitarGanado(app.ganadoId)}
											className="text-destructive hover:text-destructive/80 h-6 w-6"
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>

									<div className="grid grid-cols-2 gap-2 text-xs">
										<div>
											<label
												htmlFor={`dosis-animal-${app.ganadoId}`}
												className="text-[10px] text-muted-foreground font-medium block mb-0.5"
											>
												Dosis ({insumoSeleccionado?.unidadMedida || "dosis"}):
											</label>
											<Input
												id={`dosis-animal-${app.ganadoId}`}
												type="number"
												allowDecimals={true}
												value={app.dosisAplicada}
												onChange={(e) =>
													onActualizarDosis(app.ganadoId, e.target.value)
												}
												className="h-7 text-xs px-2"
											/>
										</div>
										<div>
											<label
												htmlFor={`obs-animal-${app.ganadoId}`}
												className="text-[10px] text-muted-foreground font-medium block mb-0.5"
											>
												Notas / Reacción:
											</label>
											<Input
												id={`obs-animal-${app.ganadoId}`}
												type="text"
												placeholder="Ej. Fiebre, Ok"
												value={app.observaciones}
												onChange={(e) =>
													onActualizarObservaciones(
														app.ganadoId,
														e.target.value,
													)
												}
												className="h-7 text-xs px-2"
											/>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

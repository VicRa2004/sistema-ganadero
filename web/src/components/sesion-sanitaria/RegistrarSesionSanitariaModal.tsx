import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Activity,
	AlertCircle,
	Calendar,
	Check,
	ChevronLeft,
	ChevronRight,
	Database,
	Info,
	Loader2,
	Plus,
	Search,
	Stethoscope,
	Syringe,
	Tag,
	Trash2,
	UserCheck,
} from "lucide-react";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { useRegistrarSesionSanitaria } from "@/modules/sesion-sanitaria/hooks/useRegistrarSesionSanitaria";
import { formatApiError } from "@/lib/utils";

interface AplicacionItem {
	ganadoId: number;
	identificador: string;
	peso: number;
	dosisAplicada: string;
	observaciones: string;
}

interface RegistrarSesionSanitariaModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SELECT_CLASS =
	"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

// Tipos de insumos permitidos para sesiones sanitarias
const TIPOS_INSUMO_SANITARIO = ["VACUNA", "MEDICAMENTO"];

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";

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

export function RegistrarSesionSanitariaModal({
	open,
	onOpenChange,
}: RegistrarSesionSanitariaModalProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const [aplicaciones, setAplicaciones] = useState<AplicacionItem[]>([]);
	const [busquedaGanado, setBusquedaGanado] = useState("");
	const [ganadoPage, setGanadoPage] = useState(1);

	// Resetear estados al abrir el modal
	useEffect(() => {
		if (open) {
			setApiError(null);
			setAplicaciones([]);
			setBusquedaGanado("");
			setGanadoPage(1);
		}
	}, [open]);

	const { data: veterinariosData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: ganadosData, isLoading: isLoadingGanado } = useListarGanado(
		{
			page: ganadoPage,
			limit: 5,
			soloActivos: true,
			identificador: busquedaGanado || undefined,
		},
		open,
	);

	const registrarMutation = useRegistrarSesionSanitaria();

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0],
			veterinarioId: "",
			insumoId: "",
			descripcion: "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			if (!value.insumoId) {
				setApiError("Debe seleccionar un insumo (vacuna o medicamento).");
				return;
			}

			if (aplicaciones.length === 0) {
				setApiError("Debe agregar al menos un animal a la sesión sanitaria.");
				return;
			}

			try {
				await registrarMutation.mutateAsync({
					fecha: value.fecha,
					veterinarioId: Number(value.veterinarioId),
					insumoId: Number(value.insumoId),
					descripcion: value.descripcion,
					aplicaciones: aplicaciones.map((app) => ({
						ganadoId: app.ganadoId,
						dosisAplicada: Number(app.dosisAplicada) || 0,
						observaciones: app.observaciones || undefined,
					})),
				});

				onOpenChange(false);
				form.reset();
				setAplicaciones([]);
			} catch (err) {
				setApiError(formatApiError(err));
			}
		},
	});

	// Filtrar solo vacunas y medicamentos
	const insumosList = (insumosData?.data ?? []).filter((ins) =>
		TIPOS_INSUMO_SANITARIO.includes(ins.tipo),
	);

	const totalGanadoPages = ganadosData?.totalPages ?? 1;

	const handleAgregarGanado = (
		ganadoId: number,
		identificador: string,
		peso: number,
	) => {
		const currentInsumo = form.getFieldValue("insumoId");
		if (!currentInsumo) return;
		if (aplicaciones.some((a) => a.ganadoId === ganadoId)) return;
		setAplicaciones((prev) => [
			...prev,
			{
				ganadoId,
				identificador,
				peso,
				dosisAplicada: "1",
				observaciones: "",
			},
		]);
	};

	const handleQuitarGanado = (ganadoId: number) => {
		setAplicaciones((prev) => prev.filter((a) => a.ganadoId !== ganadoId));
	};

	const handleActualizarDosisAnimal = (ganadoId: number, dosisStr: string) => {
		setAplicaciones((prev) =>
			prev.map((a) =>
				a.ganadoId === ganadoId ? { ...a, dosisAplicada: dosisStr } : a,
			),
		);
	};

	const handleActualizarObservacionesAnimal = (
		ganadoId: number,
		observaciones: string,
	) => {
		setAplicaciones((prev) =>
			prev.map((a) => (a.ganadoId === ganadoId ? { ...a, observaciones } : a)),
		);
	};

	const handleSeleccionarTodos = () => {
		const currentInsumo = form.getFieldValue("insumoId");
		if (!currentInsumo) return;
		const ganadosVisibles = ganadosData?.data ?? [];

		setAplicaciones((prev) => {
			const existentesIds = new Set(prev.map((a) => a.ganadoId));
			const nuevos = ganadosVisibles
				.filter((g) => !existentesIds.has(g.id))
				.map((g) => ({
					ganadoId: g.id,
					identificador: g.identificador,
					peso: g.peso,
					dosisAplicada: "1",
					observaciones: "",
				}));
			return [...prev, ...nuevos];
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6 gap-4">
				<DialogHeader className="space-y-1 text-left border-b border-border pb-3">
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						<Activity className="size-5 text-primary" />
						Registrar Sesión Sanitaria Masiva
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Programa una jornada de vacunación o medicina preventiva y asigna la
						dosis a los animales.
					</DialogDescription>
				</DialogHeader>

				{apiError && (
					<div className="p-3 rounded-lg text-sm text-red-700 bg-red-500/10 border border-red-500/30 dark:text-red-400 dark:bg-red-500/15 flex items-center gap-2">
						<AlertCircle className="size-4 shrink-0" />
						<span>{apiError}</span>
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex-1 overflow-y-auto space-y-5 pr-1"
				>
					{/* ── Seccion 1: Cabecera de la Sesión ── */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
						{/* Fecha */}
						<form.Field name="fecha">
							{(field) => (
								<div className="space-y-1.5">
									<label
										htmlFor="reg-sesion-fecha"
										className="text-xs font-semibold flex items-center gap-1.5"
									>
										<Calendar className="size-3.5 text-primary" />
										Fecha de Jornada
									</label>
									<Input
										id="reg-sesion-fecha"
										type="date"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className="h-9 text-sm"
									/>
								</div>
							)}
						</form.Field>

						{/* Veterinario */}
						<form.Field name="veterinarioId">
							{(field) => (
								<div className="space-y-1.5">
									<label
										htmlFor="reg-sesion-vet"
										className="text-xs font-semibold flex items-center gap-1.5"
									>
										<UserCheck className="size-3.5 text-primary" />
										Veterinario Responsable
									</label>
									<select
										id="reg-sesion-vet"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
									>
										<option value="">Seleccionar Veterinario...</option>
										{(veterinariosData?.data ?? []).map((vet) => (
											<option key={vet.id} value={vet.id}>
												{vet.nombre} ({vet.cedulaProfesional})
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						{/* Insumo (Solo Vacunas o Medicamentos) */}
						<form.Field name="insumoId">
							{(field) => (
								<div className="space-y-1.5">
									<label
										htmlFor="reg-sesion-insumo"
										className="text-xs font-semibold flex items-center gap-1.5"
									>
										<Database className="size-3.5 text-primary" />
										Vacuna o Medicamento
									</label>
									<select
										id="reg-sesion-insumo"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
									>
										<option value="">
											Seleccionar Medicamento / Vacuna...
										</option>
										{insumosList.map((ins) => (
											<option key={ins.id} value={ins.id}>
												[{ins.tipo}] {ins.nombre} (Stock: {ins.stock}{" "}
												{ins.unidadMedida})
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						{/* Descripción */}
						<form.Field name="descripcion">
							{(field) => (
								<div className="space-y-1.5 md:col-span-3">
									<label
										htmlFor="reg-sesion-descripcion"
										className="text-xs font-semibold flex items-center gap-1.5"
									>
										<Stethoscope className="size-3.5 text-primary" />
										Descripción / Motivo de la Sesión
									</label>
									<Input
										id="reg-sesion-descripcion"
										type="text"
										placeholder="Ej: Vacunación Anual contra Brucelosis"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className="h-9 text-sm"
									/>
								</div>
							)}
						</form.Field>
					</div>

					{/* ── Seccion 2: Lote de Ganado y Dosis (Suscripción Reactiva con form.Subscribe) ── */}
					<form.Subscribe selector={(state) => state.values.insumoId}>
						{(insumoIdActual) => {
							const insumoSeleccionado = insumosList.find(
								(i) => i.id === Number(insumoIdActual),
							);
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
												Consumo Total: {totalDosisCalculadas} /{" "}
												{insumoSeleccionado.stock}{" "}
												{insumoSeleccionado.unidadMedida}
											</Badge>
										)}
									</div>

									{!tieneInsumoSeleccionado && (
										<div className="p-3 rounded-lg text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2">
											<Info className="size-4 shrink-0 text-amber-500" />
											<span>
												<strong>Paso requerido:</strong> Por favor selecciona un
												medicamento o vacuna arriba para poder añadir animales a
												la sesión.
											</span>
										</div>
									)}

									{/* Selector rápido de ganado activo */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-3 rounded-xl border border-border">
										{/* Columna Izquierda: Buscador y selección de disponibles */}
										<div className="space-y-2.5 border-r border-border/50 pr-2 flex flex-col justify-between">
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
														onClick={handleSeleccionarTodos}
														className="h-7 text-xs text-primary cursor-pointer hover:bg-primary/10"
													>
														Seleccionar todos
													</Button>
												</div>

												<div className="relative">
													<Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
													<Input
														type="text"
														placeholder="Buscar por arete..."
														value={busquedaGanado}
														onChange={(e) => {
															setBusquedaGanado(e.target.value);
															setGanadoPage(1);
														}}
														className="pl-8 h-8 text-xs"
													/>
												</div>

												<div className="max-h-56 min-h-[190px] overflow-y-auto space-y-1.5 pr-1 border border-border rounded-lg p-1.5 bg-background">
													{isLoadingGanado ? (
														<div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
															<Loader2 className="size-4 animate-spin text-primary" />
															Cargando ganado...
														</div>
													) : (ganadosData?.data ?? []).length === 0 ? (
														<p className="text-xs text-muted-foreground text-center py-8">
															No hay animales activos disponibles.
														</p>
													) : (
														(ganadosData?.data ?? []).map((g) => {
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
																		{/* Miniatura Foto de Ganado */}
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
																		disabled={
																			agregado || !tieneInsumoSeleccionado
																		}
																		onClick={() =>
																			handleAgregarGanado(
																				g.id,
																				g.identificador,
																				g.peso,
																			)
																		}
																		className="h-6 px-2 text-[11px] cursor-pointer shrink-0"
																	>
																		{agregado ? (
																			<>
																				<Check className="size-3 mr-1" />{" "}
																				Añadido
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

											{/* Paginación de Ganado en el Modal */}
											<div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground border-t border-border/40">
												<span>
													Pág. {ganadoPage} de {totalGanadoPages}
												</span>
												<div className="flex items-center gap-1">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															setGanadoPage((p) => Math.max(1, p - 1))
														}
														disabled={ganadoPage <= 1 || isLoadingGanado}
														className="h-6 w-6 p-0 cursor-pointer"
													>
														<ChevronLeft className="size-3" />
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															setGanadoPage((p) =>
																Math.min(totalGanadoPages, p + 1),
															)
														}
														disabled={
															ganadoPage >= totalGanadoPages || isLoadingGanado
														}
														className="h-6 w-6 p-0 cursor-pointer"
													>
														<ChevronRight className="size-3" />
													</Button>
												</div>
											</div>
										</div>

										{/* Columna Derecha: Lista de Seleccionados con dosis por animal */}
										<div className="space-y-2.5">
											<span className="text-xs font-semibold text-muted-foreground">
												Lista de Aplicación ({aplicaciones.length}{" "}
												Seleccionados)
											</span>

											<div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-border rounded-lg p-1.5 bg-background">
												{aplicaciones.length === 0 ? (
													<div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground text-center">
														<Syringe className="size-6 text-muted-foreground/40 mb-1" />
														<span>No has agregado ningún animal.</span>
														<span className="text-[11px]">
															Haz clic en &quot;Añadir&quot; en la columna de la
															izquierda.
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
																<button
																	type="button"
																	onClick={() =>
																		handleQuitarGanado(app.ganadoId)
																	}
																	className="text-destructive hover:text-destructive/80 p-0.5 cursor-pointer"
																	title="Quitar de la sesión"
																>
																	<Trash2 className="size-3.5" />
																</button>
															</div>

															<div className="grid grid-cols-2 gap-2 text-xs">
																<div>
																	<label
																		htmlFor={`dosis-animal-${app.ganadoId}`}
																		className="text-[10px] text-muted-foreground font-medium block mb-0.5"
																	>
																		Dosis (
																		{insumoSeleccionado?.unidadMedida ||
																			"dosis"}
																		):
																	</label>
																	<Input
																		id={`dosis-animal-${app.ganadoId}`}
																		type="number"
																		allowDecimals={true}
																		value={app.dosisAplicada}
																		onChange={(e) =>
																			handleActualizarDosisAnimal(
																				app.ganadoId,
																				e.target.value,
																			)
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
																			handleActualizarObservacionesAnimal(
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
						}}
					</form.Subscribe>

					<DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={registrarMutation.isPending}
							className="cursor-pointer gap-2"
						>
							{registrarMutation.isPending && (
								<Loader2 className="size-4 animate-spin" />
							)}
							Guardar Sesión Sanitaria
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

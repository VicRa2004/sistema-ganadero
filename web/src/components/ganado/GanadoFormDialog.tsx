import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	Tag,
	Scale,
	Calendar,
	Sparkles,
	Image as ImageIcon,
	GitBranch,
	AlertTriangle,
	UserCheck,
	X,
	Search,
} from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarGanado } from "@/modules/ganado/hooks/useRegistrarGanado";
import { useActualizarGanado } from "@/modules/ganado/hooks/useActualizarGanado";
import { useListarMotivosBaja } from "@/modules/ganado/hooks/useListarMotivosBaja";
import { GanadoSelectorModal } from "./GanadoSelectorModal";
import type { GanadoDto } from "@/modules/ganado/types";
import type { RazaDto } from "@/modules/raza/types";
import type { TerrenoDto } from "@/modules/terreno/types";
import type { PropietarioDto } from "@/modules/propietario/types";

const SELECT_CLASS =
	"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

interface GanadoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	ganado?: GanadoDto;
	razas: RazaDto[];
	terrenos: TerrenoDto[];
	propietarios: PropietarioDto[];
	/** Lista opcional de ganados previa */
	ganadosList?: GanadoDto[];
}

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

export function GanadoFormDialog({
	open,
	onOpenChange,
	ganado,
	razas,
	terrenos,
	propietarios,
	ganadosList = [],
}: GanadoFormDialogProps) {
	const isEditing = !!ganado;
	const isDadoDeBaja = isEditing && ganado?.fechaBaja !== null;

	const [apiError, setApiError] = useState<string | null>(null);
	const [imagenPreview, setImagenPreview] = useState<string | null>(
		ganado?.imagenGanado ?? null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Modales de selección de Padre y Madre
	const [selectorPadreOpen, setSelectorPadreOpen] = useState(false);
	const [selectorMadreOpen, setSelectorMadreOpen] = useState(false);

	// Estado local de Padre y Madre seleccionados para previsualizar en tarjeta
	const [padreSeleccionado, setPadreSeleccionado] = useState<GanadoDto | null>(
		null,
	);
	const [madreSeleccionada, setMadreSeleccionada] = useState<GanadoDto | null>(
		null,
	);

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarGanado();
	const { mutate: actualizar, isPending: isActualizando } = useActualizarGanado(
		ganado?.id ?? 0,
	);
	const { data: motivosBaja = [], isLoading: isCargandoMotivos } =
		useListarMotivosBaja();

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			identificador: ganado?.identificador ?? "",
			peso: (ganado?.peso ?? "") as number | string,
			fechaNacimiento: ganado?.fechaNacimiento ?? "",
			sexo: (ganado?.sexo ?? "") as "" | "MACHO" | "HEMBRA",
			razaId: ganado?.razaId ?? ("" as number | ""),
			terrenoId: ganado?.terrenoId ?? ("" as number | ""),
			propietarioId: ganado?.propietarioId ?? ("" as number | ""),
			padreId: ganado?.padreId ?? ("" as number | ""),
			madreId: ganado?.madreId ?? ("" as number | ""),
			fechaBaja: ganado?.fechaBaja ?? "",
			motivoBajaId: ganado?.motivoBajaId ?? ("" as number | ""),
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			const imagenFile = fileInputRef.current?.files?.[0] ?? undefined;

			// Base Payload
			const payload: any = {
				identificador: value.identificador.trim(),
				peso: Number(value.peso),
				fechaNacimiento: value.fechaNacimiento,
				sexo: value.sexo as "MACHO" | "HEMBRA",
				razaId: Number(value.razaId),
				terrenoId: Number(value.terrenoId),
				propietarioId: Number(value.propietarioId),
				padreId: value.padreId !== "" ? Number(value.padreId) : null,
				madreId: value.madreId !== "" ? Number(value.madreId) : null,
				imagenGanado: imagenFile ?? null,
			};

			// Si el ganado ya está dado de baja, incluir motivo de baja y fecha de baja
			if (isDadoDeBaja) {
				payload.fechaBaja = value.fechaBaja || null;
				payload.motivoBajaId =
					value.motivoBajaId !== "" ? Number(value.motivoBajaId) : null;
			}

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			if (isEditing) {
				actualizar(payload, {
					onSuccess: () => onOpenChange(false),
					onError: handleError,
				});
			} else {
				registrar(payload, {
					onSuccess: () => {
						form.reset();
						setImagenPreview(null);
						setPadreSeleccionado(null);
						setMadreSeleccionada(null);
						onOpenChange(false);
					},
					onError: handleError,
				});
			}
		},
	});

	// Buscar objetos de padre y madre iniciales si ya tienen ID
	useEffect(() => {
		if (open) {
			form.setFieldValue("identificador", ganado?.identificador ?? "");
			form.setFieldValue("peso", ganado?.peso ?? "");
			form.setFieldValue("fechaNacimiento", ganado?.fechaNacimiento ?? "");
			form.setFieldValue(
				"sexo",
				(ganado?.sexo ?? "") as "" | "MACHO" | "HEMBRA",
			);
			form.setFieldValue("razaId", ganado?.razaId ?? "");
			form.setFieldValue("terrenoId", ganado?.terrenoId ?? "");
			form.setFieldValue("propietarioId", ganado?.propietarioId ?? "");
			form.setFieldValue("padreId", ganado?.padreId ?? "");
			form.setFieldValue("madreId", ganado?.madreId ?? "");
			form.setFieldValue("fechaBaja", ganado?.fechaBaja ?? "");
			form.setFieldValue("motivoBajaId", ganado?.motivoBajaId ?? "");
			setImagenPreview(ganado?.imagenGanado ?? null);

			// Buscar si están en ganadosList previa
			if (ganado?.padreId) {
				const padreObj = ganadosList.find((g) => g.id === ganado.padreId);
				setPadreSeleccionado(
					padreObj ?? {
						id: ganado.padreId,
						identificador: `ID: ${ganado.padreId}`,
						peso: 0,
						fechaNacimiento: "",
						sexo: "MACHO",
						imagenGanado: null,
						razaId: 0,
						terrenoId: 0,
						propietarioId: 0,
						padreId: null,
						madreId: null,
						fechaBaja: null,
						motivoBajaId: null,
					},
				);
			} else {
				setPadreSeleccionado(null);
			}

			if (ganado?.madreId) {
				const madreObj = ganadosList.find((g) => g.id === ganado.madreId);
				setMadreSeleccionada(
					madreObj ?? {
						id: ganado.madreId,
						identificador: `ID: ${ganado.madreId}`,
						peso: 0,
						fechaNacimiento: "",
						sexo: "HEMBRA",
						imagenGanado: null,
						razaId: 0,
						terrenoId: 0,
						propietarioId: 0,
						padreId: null,
						madreId: null,
						fechaBaja: null,
						motivoBajaId: null,
					},
				);
			} else {
				setMadreSeleccionada(null);
			}
		}
	}, [open, ganado, ganadosList, form]);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!isPending) {
						setApiError(null);
						onOpenChange(nextOpen);
					}
				}}
			>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold flex items-center gap-2">
							{isEditing
								? "Editar Información de Ganado"
								: "Registrar Cabeza de Ganado"}
							{isDadoDeBaja && (
								<Badge variant="destructive" className="text-xs">
									Dado de Baja
								</Badge>
							)}
						</DialogTitle>
						<DialogDescription>
							{isEditing
								? `Modifica los datos del ganado con arete ${ganado.identificador}.`
								: "Completa los datos del nuevo animal para agregarlo al sistema."}
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-5 py-2"
					>
						{apiError && (
							<div className="p-3 text-sm text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15 rounded-lg border border-red-500/30 font-medium">
								{apiError}
							</div>
						)}

						{/* ── Identificador + Sexo ── */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.Field
								name="identificador"
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim() === "")
											return "El identificador (arete) es requerido.";
										if (value.trim().length < 2)
											return "El arete debe tener al menos 2 caracteres.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Código / Arete <span className="text-destructive">*</span>
										</Label>
										<div className="relative">
											<Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="Ej: AR-0982"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-9"
												disabled={isPending}
											/>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="sexo"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "El sexo es requerido.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Sexo <span className="text-destructive">*</span>
										</Label>
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(e.target.value as "MACHO" | "HEMBRA")
											}
											className={SELECT_CLASS}
											disabled={isPending}
										>
											<option value="">Seleccione...</option>
											<option value="MACHO">MACHO</option>
											<option value="HEMBRA">HEMBRA</option>
										</select>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>
						</div>

						{/* ── Peso + Fecha de Nacimiento ── */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.Field
								name="peso"
								validators={{
									onChange: ({ value }) => {
										if (
											value === undefined ||
											value === null ||
											String(value).trim() === ""
										)
											return "El peso es requerido.";
										const num = Number(value);
										if (Number.isNaN(num))
											return "Debe introducir un número válido.";
										if (num <= 0) return "El peso debe ser mayor a 0 kg.";
										if (num > 3000)
											return "El peso no puede exceder los 3,000 kg.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Peso Inicial (kg){" "}
											<span className="text-destructive">*</span>
										</Label>
										<div className="relative">
											<Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="number"
												step="any"
												allowDecimals={true}
												placeholder="Ej: 350.5"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-9"
												disabled={isPending}
											/>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="fechaNacimiento"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "La fecha de nacimiento es requerida.";
										if (new Date(value) > new Date())
											return "La fecha no puede ser futura.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Fecha de Nacimiento{" "}
											<span className="text-destructive">*</span>
										</Label>
										<div className="relative">
											<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="date"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-9"
												disabled={isPending}
												max={new Date().toISOString().split("T")[0]}
											/>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>
						</div>

						{/* ── Raza + Terreno ── */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.Field
								name="razaId"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "La raza es requerida.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5 text-left">
										<Label htmlFor={field.name}>
											Raza <span className="text-destructive">*</span>
										</Label>
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value === "" ? "" : Number(e.target.value),
												)
											}
											className={SELECT_CLASS}
											disabled={isPending}
										>
											<option value="">Seleccione una raza...</option>
											{razas.map((r) => (
												<option key={r.id} value={r.id}>
													{r.nombre}
												</option>
											))}
										</select>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="terrenoId"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "El terreno es requerido.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5 text-left">
										<Label htmlFor={field.name}>
											Terreno <span className="text-destructive">*</span>
										</Label>
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value === "" ? "" : Number(e.target.value),
												)
											}
											className={SELECT_CLASS}
											disabled={isPending}
										>
											<option value="">Seleccione un terreno...</option>
											{terrenos.map((r) => (
												<option key={r.id} value={r.id}>
													{r.nombre} ({r.ubicacion})
												</option>
											))}
										</select>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>
						</div>

						{/* ── Propietario ── */}
						<form.Field
							name="propietarioId"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "El propietario es requerido.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5 text-left">
									<Label htmlFor={field.name}>
										Propietario <span className="text-destructive">*</span>
									</Label>
									<select
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												e.target.value === "" ? "" : Number(e.target.value),
											)
										}
										className={SELECT_CLASS}
										disabled={isPending}
									>
										<option value="">Seleccione un propietario...</option>
										{propietarios.map((p) => (
											<option key={p.id} value={p.id}>
												{p.nombre}
											</option>
										))}
									</select>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400 font-medium">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>

						{/* ── APARTADO DE BAJA (Solo visible si el ganado ya está dado de baja) ── */}
						{isDadoDeBaja && (
							<div className="space-y-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10">
								<div className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400">
									<AlertTriangle className="size-4 text-red-500" />
									Información de Baja
								</div>
								<p className="text-xs text-muted-foreground">
									Este animal se encuentra marcado como dado de baja. Puedes
									actualizar la fecha y el motivo de baja a continuación:
								</p>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{/* Fecha de Baja */}
									<form.Field name="fechaBaja">
										{(field) => (
											<div className="space-y-1.5">
												<Label htmlFor={field.name}>Fecha de Baja</Label>
												<Input
													id={field.name}
													name={field.name}
													type="date"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													disabled={isPending}
													max={new Date().toISOString().split("T")[0]}
												/>
											</div>
										)}
									</form.Field>

									{/* Motivo de Baja */}
									<form.Field name="motivoBajaId">
										{(field) => (
											<div className="space-y-1.5">
												<Label htmlFor={field.name}>Motivo de Baja</Label>
												<select
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(
															e.target.value === ""
																? ""
																: Number(e.target.value),
														)
													}
													className={SELECT_CLASS}
													disabled={isPending || isCargandoMotivos}
												>
													<option value="">
														{isCargandoMotivos
															? "Cargando motivos..."
															: "Seleccione un motivo..."}
													</option>
													{motivosBaja.map((m) => (
														<option key={m.id} value={m.id}>
															{m.nombre}
														</option>
													))}
												</select>
											</div>
										)}
									</form.Field>
								</div>
							</div>
						)}

						{/* ── LINAJE CON COMPONENTE MODAL DE SELECCIÓN (Padre / Madre) ── */}
						<div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
							<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<GitBranch className="size-4 text-primary" />
								Linaje (Padre y Madre - opcional)
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Campo Padre */}
								<form.Field name="padreId">
									{(field) => {
										const padreIdVal = field.state.value;
										const padreImgUrl = padreSeleccionado
											? getImagenUrl(padreSeleccionado.imagenGanado)
											: null;

										return (
											<div className="space-y-2 text-left">
												<Label>Padre (MACHO)</Label>
												<div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
													{padreSeleccionado ? (
														<div className="flex items-center gap-2.5 flex-1 min-w-0">
															<div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-border shrink-0">
																{padreImgUrl ? (
																	<img
																		src={padreImgUrl}
																		alt={padreSeleccionado.identificador}
																		className="size-full object-cover"
																	/>
																) : (
																	<UserCheck className="size-4" />
																)}
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-xs font-bold text-foreground truncate">
																	{padreSeleccionado.identificador}
																</p>
																<Badge
																	variant="outline"
																	className="text-[10px] px-1 py-0"
																>
																	MACHO
																</Badge>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="size-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
																onClick={() => {
																	setPadreSeleccionado(null);
																	field.handleChange("");
																}}
															>
																<X className="size-3.5" />
															</Button>
														</div>
													) : (
														<span className="text-xs text-muted-foreground flex-1">
															Sin padre seleccionado
														</span>
													)}

													<Button
														type="button"
														variant="outline"
														size="sm"
														className="gap-1.5 cursor-pointer text-xs h-8 shrink-0"
														onClick={() => setSelectorPadreOpen(true)}
														disabled={isPending}
													>
														<Search className="size-3" />
														{padreIdVal ? "Cambiar" : "Seleccionar"}
													</Button>
												</div>
											</div>
										);
									}}
								</form.Field>

								{/* Campo Madre */}
								<form.Field name="madreId">
									{(field) => {
										const madreIdVal = field.state.value;
										const madreImgUrl = madreSeleccionada
											? getImagenUrl(madreSeleccionada.imagenGanado)
											: null;

										return (
											<div className="space-y-2 text-left">
												<Label>Madre (HEMBRA)</Label>
												<div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
													{madreSeleccionada ? (
														<div className="flex items-center gap-2.5 flex-1 min-w-0">
															<div className="size-9 rounded-md bg-pink-500/10 text-pink-600 flex items-center justify-center overflow-hidden border border-border shrink-0">
																{madreImgUrl ? (
																	<img
																		src={madreImgUrl}
																		alt={madreSeleccionada.identificador}
																		className="size-full object-cover"
																	/>
																) : (
																	<UserCheck className="size-4" />
																)}
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-xs font-bold text-foreground truncate">
																	{madreSeleccionada.identificador}
																</p>
																<Badge
																	variant="secondary"
																	className="text-[10px] px-1 py-0"
																>
																	HEMBRA
																</Badge>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="size-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
																onClick={() => {
																	setMadreSeleccionada(null);
																	field.handleChange("");
																}}
															>
																<X className="size-3.5" />
															</Button>
														</div>
													) : (
														<span className="text-xs text-muted-foreground flex-1">
															Sin madre seleccionada
														</span>
													)}

													<Button
														type="button"
														variant="outline"
														size="sm"
														className="gap-1.5 cursor-pointer text-xs h-8 shrink-0"
														onClick={() => setSelectorMadreOpen(true)}
														disabled={isPending}
													>
														<Search className="size-3" />
														{madreIdVal ? "Cambiar" : "Seleccionar"}
													</Button>
												</div>
											</div>
										);
									}}
								</form.Field>
							</div>
						</div>

						{/* ── Imagen del Ganado ── */}
						<div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
							<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<ImageIcon className="size-4 text-primary" />
								Imagen del Ganado (opcional)
							</div>
							<div className="flex items-start gap-4">
								{imagenPreview && (
									<img
										src={getImagenUrl(imagenPreview) || ""}
										alt="Preview del ganado"
										className="size-20 rounded-lg object-cover border border-border shrink-0"
									/>
								)}
								<div className="flex-1 space-y-2">
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										id="imagen-ganado-input"
										className="hidden"
										disabled={isPending}
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setImagenPreview(URL.createObjectURL(file));
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-2 cursor-pointer"
										disabled={isPending}
										onClick={() => fileInputRef.current?.click()}
									>
										<ImageIcon className="size-4" />
										{imagenPreview ? "Cambiar imagen" : "Seleccionar imagen"}
									</Button>
									{imagenPreview && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="gap-2 cursor-pointer text-muted-foreground"
											disabled={isPending}
											onClick={() => {
												setImagenPreview(null);
												if (fileInputRef.current)
													fileInputRef.current.value = "";
											}}
										>
											Quitar imagen
										</Button>
									)}
									<p className="text-xs text-muted-foreground">
										JPG, PNG, WEBP. Máximo recomendado: 5MB.
									</p>
								</div>
							</div>
						</div>

						<DialogFooter className="pt-4 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<form.Subscribe
								selector={(state) => ({ canSubmit: state.canSubmit })}
							>
								{({ canSubmit }) => (
									<Button
										type="submit"
										disabled={isPending || !canSubmit}
										className="min-w-[130px] gap-1 cursor-pointer"
									>
										{isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												{isEditing ? "Guardando..." : "Registrando..."}
											</>
										) : (
											<>
												<Sparkles className="size-4" />
												{isEditing ? "Guardar cambios" : "Registrar ganado"}
											</>
										)}
									</Button>
								)}
							</form.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Modal para Seleccionar Padre (MACHO) ── */}
			<GanadoSelectorModal
				open={selectorPadreOpen}
				onOpenChange={setSelectorPadreOpen}
				title="Seleccionar Padre (Toro / Macho)"
				description="Busca y selecciona el semental o toro padre dentro de la lista de ganados."
				defaultSexo="MACHO"
				selectedId={padreSeleccionado?.id ?? null}
				excludeId={ganado?.id}
				razas={razas}
				onSelect={(ganadoElegido) => {
					setPadreSeleccionado(ganadoElegido);
					form.setFieldValue("padreId", ganadoElegido ? ganadoElegido.id : "");
				}}
			/>

			{/* ── Modal para Seleccionar Madre (HEMBRA) ── */}
			<GanadoSelectorModal
				open={selectorMadreOpen}
				onOpenChange={setSelectorMadreOpen}
				title="Seleccionar Madre (Vaca / Hembra)"
				description="Busca y selecciona la vaca o hembra madre dentro de la lista de ganados."
				defaultSexo="HEMBRA"
				selectedId={madreSeleccionada?.id ?? null}
				excludeId={ganado?.id}
				razas={razas}
				onSelect={(ganadoElegido) => {
					setMadreSeleccionada(ganadoElegido);
					form.setFieldValue("madreId", ganadoElegido ? ganadoElegido.id : "");
				}}
			/>
		</>
	);
}

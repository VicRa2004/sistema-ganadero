import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Sparkles } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { comprimirImagen } from "@/lib/comprimirImagen";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useActualizarGanado } from "@/modules/ganado/hooks/useActualizarGanado";
import { useListarMotivosBaja } from "@/modules/ganado/hooks/useListarMotivosBaja";
import { useObtenerFichaGanado } from "@/modules/ganado/hooks/useObtenerFichaGanado";
import { useRegistrarGanado } from "@/modules/ganado/hooks/useRegistrarGanado";
import { ganadoFormSchema } from "@/modules/ganado/schemas";
import type {
	ActualizarGanadoInput,
	GanadoDto,
	RegistrarGanadoInput,
} from "@/modules/ganado/types";
import type { PropietarioDto } from "@/modules/propietario/types";
import type { RazaDto } from "@/modules/raza/types";
import type { TerrenoDto } from "@/modules/terreno/types";
import { GanadoBajaFields } from "./GanadoBajaFields";
import { GanadoImagenField } from "./GanadoImagenField";
import { GanadoLinajeFields } from "./GanadoLinajeFields";
import { GanadoSelectorModal } from "./GanadoSelectorModal";

interface GanadoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganado?: GanadoDto;
	razas: RazaDto[];
	terrenos: TerrenoDto[];
	propietarios: PropietarioDto[];
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
}: GanadoFormDialogProps) {
	const isEditing = !!ganado;
	const isDadoDeBaja = isEditing && ganado?.fechaBaja !== null;

	const [imagenPreview, setImagenPreview] = useState<string | null>(
		ganado?.imagenGanado ?? null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectorPadreOpen, setSelectorPadreOpen] = useState(false);
	const [selectorMadreOpen, setSelectorMadreOpen] = useState(false);
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
			peso: ganado ? String(ganado.peso) : "",
			fechaNacimiento: ganado?.fechaNacimiento ?? "",
			sexo: (ganado?.sexo ?? "") as string,
			razaId: String(ganado?.razaId ?? ""),
			terrenoId: String(ganado?.terrenoId ?? ""),
			propietarioId: String(ganado?.propietarioId ?? ""),
			procedencia: ganado?.procedencia ?? "",
			padreId: String(ganado?.padreId ?? ""),
			madreId: String(ganado?.madreId ?? ""),
			fechaBaja: ganado?.fechaBaja ?? "",
			motivoBajaId: String(ganado?.motivoBajaId ?? ""),
		},
		validators: { onChange: ganadoFormSchema },
		onSubmit: async ({ value }) => {
			const archivo = fileInputRef.current?.files?.[0];
			const imagenFile = archivo ? await comprimirImagen(archivo) : undefined;
			const basePayload = {
				identificador: value.identificador.trim(),
				peso: Number(value.peso),
				fechaNacimiento: value.fechaNacimiento,
				sexo: value.sexo as "MACHO" | "HEMBRA",
				razaId: Number(value.razaId),
				terrenoId: Number(value.terrenoId),
				propietarioId: Number(value.propietarioId),
				procedencia: value.procedencia.trim() || null,
				padreId: value.padreId !== "" ? Number(value.padreId) : null,
				madreId: value.madreId !== "" ? Number(value.madreId) : null,
				imagenGanado: imagenFile ?? null,
			};

			if (isEditing) {
				const payload: ActualizarGanadoInput = {
					...basePayload,
					...(isDadoDeBaja && {
						fechaBaja: value.fechaBaja || null,
						motivoBajaId:
							value.motivoBajaId !== "" ? Number(value.motivoBajaId) : null,
					}),
				};
				actualizar(payload, { onSuccess: () => onOpenChange(false) });
			} else {
				registrar(basePayload as RegistrarGanadoInput, {
					onSuccess: () => {
						form.reset();
						setImagenPreview(null);
						setPadreSeleccionado(null);
						setMadreSeleccionada(null);
						onOpenChange(false);
					},
				});
			}
		},
	});

	useEffect(() => {
		if (!open) return;
		form.reset({
			identificador: ganado?.identificador ?? "",
			peso: ganado ? String(ganado.peso) : "",
			fechaNacimiento: ganado?.fechaNacimiento ?? "",
			sexo: ganado?.sexo ?? "",
			razaId: String(ganado?.razaId ?? ""),
			terrenoId: String(ganado?.terrenoId ?? ""),
			propietarioId: String(ganado?.propietarioId ?? ""),
			procedencia: ganado?.procedencia ?? "",
			padreId: String(ganado?.padreId ?? ""),
			madreId: String(ganado?.madreId ?? ""),
			fechaBaja: ganado?.fechaBaja ?? "",
			motivoBajaId: String(ganado?.motivoBajaId ?? ""),
		});
		setImagenPreview(ganado?.imagenGanado ?? null);
	}, [open, ganado, form]);

	const { data: padreActual } = useObtenerFichaGanado(
		open ? (ganado?.padreId ?? 0) : 0,
	);
	const { data: madreActual } = useObtenerFichaGanado(
		open ? (ganado?.madreId ?? 0) : 0,
	);
	useEffect(() => {
		if (!open) return;
		const ref = (
			id: number | null | undefined,
			sexo: "MACHO" | "HEMBRA",
			identificador?: string,
		): GanadoDto | null =>
			id
				? {
						id,
						identificador: identificador ?? `ID: ${id}`,
						peso: 0,
						fechaNacimiento: "",
						sexo,
						imagenGanado: null,
						razaId: 0,
						terrenoId: 0,
						propietarioId: 0,
						padreId: null,
						madreId: null,
						fechaBaja: null,
						motivoBajaId: null,
					}
				: null;
		setPadreSeleccionado(
			ref(ganado?.padreId, "MACHO", padreActual?.identificador),
		);
		setMadreSeleccionada(
			ref(ganado?.madreId, "HEMBRA", madreActual?.identificador),
		);
	}, [open, ganado, padreActual, madreActual]);

	const maxFecha = new Date().toISOString().split("T")[0];

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!isPending) onOpenChange(nextOpen);
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
						noValidate
						onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
						className="space-y-5 py-2"
					>
						<form.Subscribe
							selector={(s) =>
								Object.values(s.fieldMeta).filter(
									(m) => m?.isTouched && (m.errors?.length ?? 0) > 0,
								).length
							}
						>
							{(errorCount) => <FormErrorAnnouncer errorCount={errorCount} />}
						</form.Subscribe>

						<fieldset className="space-y-4">
							<legend className="text-sm font-semibold text-foreground">
								Datos generales
							</legend>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<form.Field name="identificador">
									{(field) => (
										<CampoTexto
											id={field.name}
											label="Código / Arete *"
											placeholder="Ej: AR-0982"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										/>
									)}
								</form.Field>
								<form.Field name="sexo">
									{(field) => (
										<CampoSelect
											id={field.name}
											label="Sexo *"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										>
											<option value="">Seleccione...</option>
											<option value="MACHO">MACHO</option>
											<option value="HEMBRA">HEMBRA</option>
										</CampoSelect>
									)}
								</form.Field>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<form.Field name="peso">
									{(field) => (
										<CampoTexto
											id={field.name}
											label="Peso Inicial (kg) *"
											type="number"
											step="any"
											allowDecimals={true}
											placeholder="Ej: 350.5"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										/>
									)}
								</form.Field>
								<form.Field name="fechaNacimiento">
									{(field) => (
										<CampoTexto
											id={field.name}
											label="Fecha de Nacimiento *"
											type="date"
											max={maxFecha}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										/>
									)}
								</form.Field>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<form.Field name="razaId">
									{(field) => (
										<CampoSelect
											id={field.name}
											label="Raza *"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										>
											<option value="">Seleccione una raza...</option>
											{razas.map((r) => (
												<option key={r.id} value={r.id}>
													{r.nombre}
												</option>
											))}
										</CampoSelect>
									)}
								</form.Field>
								<form.Field name="terrenoId">
									{(field) => (
										<CampoSelect
											id={field.name}
											label="Terreno *"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										>
											<option value="">Seleccione un terreno...</option>
											{terrenos.map((r) => (
												<option key={r.id} value={r.id}>
													{r.nombre} ({r.ubicacion})
												</option>
											))}
										</CampoSelect>
									)}
								</form.Field>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<form.Field name="propietarioId">
									{(field) => (
										<CampoSelect
											id={field.name}
											label="Propietario *"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										>
											<option value="">Seleccione un propietario...</option>
											{propietarios.map((p) => (
												<option key={p.id} value={p.id}>
													{p.nombre}
												</option>
											))}
										</CampoSelect>
									)}
								</form.Field>
								<form.Field name="procedencia">
									{(field) => (
										<CampoTexto
											id={field.name}
											label="Procedencia (opcional)"
											placeholder="Ej: Rancho San José o Nacido en finca"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										/>
									)}
								</form.Field>
							</div>
						</fieldset>

						{isDadoDeBaja && (
							<GanadoBajaFields
								fechaBaja={form.state.values.fechaBaja}
								motivoBajaId={form.state.values.motivoBajaId}
								motivosBaja={motivosBaja}
								isCargandoMotivos={isCargandoMotivos}
								disabled={isPending}
								onFechaChange={(v) => form.setFieldValue("fechaBaja", v)}
								onMotivoChange={(v) => form.setFieldValue("motivoBajaId", v)}
							/>
						)}

						<GanadoLinajeFields
							padreSeleccionado={padreSeleccionado}
							madreSeleccionada={madreSeleccionada}
							getImagenUrl={getImagenUrl}
							disabled={isPending}
							onOpenPadre={() => setSelectorPadreOpen(true)}
							onOpenMadre={() => setSelectorMadreOpen(true)}
							onClearPadre={() => {
								setPadreSeleccionado(null);
								form.setFieldValue("padreId", "");
							}}
							onClearMadre={() => {
								setMadreSeleccionada(null);
								form.setFieldValue("madreId", "");
							}}
						/>

						<GanadoImagenField
							fileInputRef={fileInputRef}
							imagenPreview={imagenPreview}
							getImagenUrl={getImagenUrl}
							disabled={isPending}
							onPreviewChange={setImagenPreview}
						/>

						<DialogFooter className="pt-4 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isPending}
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
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

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
					form.setFieldValue(
						"padreId",
						ganadoElegido ? String(ganadoElegido.id) : "",
					);
				}}
			/>

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
					form.setFieldValue(
						"madreId",
						ganadoElegido ? String(ganadoElegido.id) : "",
					);
				}}
			/>
		</>
	);
}

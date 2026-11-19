import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import { GanadoSelectorModal } from "@/components/ganado/GanadoSelectorModal";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	extractErrorMessages,
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import type { GanadoDto } from "@/modules/ganado/types";
import { useRegistrarEventoReproductivo } from "@/modules/reproduccion/hooks/useReproduccion";
import { eventoReproductivoSchema } from "@/modules/reproduccion/schemas";
import {
	TIPO_EVENTO_LABELS,
	type ResultadoDiagnostico,
	type TipoEventoReproductivo,
} from "@/modules/reproduccion/types";
import { type CriaDraft, CriasPartoFields } from "./CriasPartoFields";

interface EventoReproductivoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	hembraInicial?: { id: number; identificador: string } | null;
}

export function EventoReproductivoFormDialog({
	open,
	onOpenChange,
	hembraInicial = null,
}: EventoReproductivoFormDialogProps) {
	const [hembra, setHembra] = useState<{
		id: number;
		identificador: string;
	} | null>(hembraInicial);
	const [macho, setMacho] = useState<{
		id: number;
		identificador: string;
	} | null>(null);
	const [selectorTipo, setSelectorTipo] = useState<"HEMBRA" | "MACHO" | null>(
		null,
	);
	const [crias, setCrias] = useState<CriaDraft[]>([]);

	const { mutate: registrar, isPending } = useRegistrarEventoReproductivo();

	const form = useForm({
		defaultValues: {
			tipo: "MONTA" as TipoEventoReproductivo,
			hembraId: hembraInicial ? String(hembraInicial.id) : "",
			machoId: "",
			fecha: new Date().toISOString().split("T")[0] ?? "",
			resultado: "POSITIVO" as ResultadoDiagnostico,
			observaciones: "",
		},
		validators: { onChange: eventoReproductivoSchema },
		onSubmit: ({ value }) => {
			if (value.tipo === "PARTO") {
				for (const [idx, c] of crias.entries()) {
					if (!c.identificador.trim()) {
						toast.error(`La cría #${idx + 1} requiere arete identificador.`);
						return;
					}
					const pesoNum = Number(c.peso);
					if (!Number.isFinite(pesoNum) || pesoNum <= 0) {
						toast.error(`La cría #${idx + 1} requiere peso mayor a 0.`);
						return;
					}
				}
			}

			registrar(
				{
					hembraId: Number(value.hembraId),
					machoId: value.machoId ? Number(value.machoId) : null,
					tipo: value.tipo,
					fecha: value.fecha,
					resultado:
						value.tipo === "DIAGNOSTICO_GESTACION" ? value.resultado : null,
					observaciones: value.observaciones.trim() || null,
					...(value.tipo === "PARTO" &&
						crias.length > 0 && {
							crias: crias.map((c) => ({
								identificador: c.identificador.trim(),
								sexo: c.sexo,
								peso: Number(c.peso),
							})),
						}),
				},
				{
					onSuccess: () => {
						form.reset();
						setCrias([]);
						setMacho(null);
						onOpenChange(false);
					},
				},
			);
		},
	});

	useEffect(() => {
		if (open) {
			setHembra(hembraInicial);
			form.setFieldValue(
				"hembraId",
				hembraInicial ? String(hembraInicial.id) : "",
			);
		}
	}, [open, hembraInicial, form]);

	const handleSelectGanado = (ganado: GanadoDto | null) => {
		if (!ganado) {
			if (selectorTipo === "MACHO") {
				setMacho(null);
				form.setFieldValue("machoId", "");
			}
			setSelectorTipo(null);
			return;
		}
		if (selectorTipo === "HEMBRA") {
			setHembra({ id: ganado.id, identificador: ganado.identificador });
			form.setFieldValue("hembraId", String(ganado.id));
		} else if (selectorTipo === "MACHO") {
			setMacho({ id: ganado.id, identificador: ganado.identificador });
			form.setFieldValue("machoId", String(ganado.id));
		}
		setSelectorTipo(null);
	};

	const agregarCria = () =>
		setCrias((prev) => [
			...prev,
			{
				key: `${Date.now()}-${prev.length}`,
				identificador: "",
				sexo: "HEMBRA",
				peso: "35",
			},
		]);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!isPending) {
						if (!nextOpen) {
							form.reset();
							setCrias([]);
							setMacho(null);
						}
						onOpenChange(nextOpen);
					}
				}}
			>
				<DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Registrar evento reproductivo</DialogTitle>
						<DialogDescription>
							Registra montas, inseminaciones, diagnósticos, partos, destetes o
							abortos.
						</DialogDescription>
					</DialogHeader>

					<form
						noValidate
						onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
						className="space-y-4 text-left"
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

						<form.Field name="tipo">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Tipo de evento"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value as TipoEventoReproductivo)
									}
									disabled={isPending}
								>
									{(
										Object.keys(TIPO_EVENTO_LABELS) as TipoEventoReproductivo[]
									).map((t) => (
										<option key={t} value={t}>
											{TIPO_EVENTO_LABELS[t]}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.Field name="hembraId">
								{(field) => {
									const mensajes = extractErrorMessages(
										getVisibleFieldErrors(field.state.meta),
									);
									const esInvalido = mensajes.length > 0;
									return (
										<div className="space-y-1.5">
											<Label htmlFor={field.name}>Hembra *</Label>
											<div className="flex items-center gap-2">
												<Input
													id={field.name}
													readOnly
													aria-invalid={esInvalido ? "true" : "false"}
													aria-describedby={
														esInvalido ? `${field.name}-error` : undefined
													}
													value={hembra ? hembra.identificador : ""}
													placeholder="Seleccionar hembra"
													onBlur={field.handleBlur}
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setSelectorTipo("HEMBRA")}
												>
													Elegir
												</Button>
											</div>
											{esInvalido && (
												<p
													id={`${field.name}-error`}
													className="text-xs font-medium text-destructive"
												>
													{mensajes.join(", ")}
												</p>
											)}
										</div>
									);
								}}
							</form.Field>

							<form.Field name="fecha">
								{(field) => (
									<CampoTexto
										id={field.name}
										label="Fecha *"
										type="date"
										max={new Date().toISOString().split("T")[0]}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
						</div>

						<form.Subscribe selector={(s) => s.values.tipo}>
							{(tipoActual) => (
								<>
									{(tipoActual === "MONTA" ||
										tipoActual === "INSEMINACION" ||
										tipoActual === "PARTO") && (
										<div className="space-y-1.5">
											<Label htmlFor="macho-picker">
												Macho / Semental (opcional)
											</Label>
											<div className="flex items-center gap-2">
												<Input
													id="macho-picker"
													readOnly
													value={macho ? macho.identificador : ""}
													placeholder="Sin macho especificado"
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setSelectorTipo("MACHO")}
												>
													Elegir
												</Button>
												{macho && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															setMacho(null);
															form.setFieldValue("machoId", "");
														}}
													>
														Limpiar
													</Button>
												)}
											</div>
										</div>
									)}

									{tipoActual === "DIAGNOSTICO_GESTACION" && (
										<form.Field name="resultado">
											{(field) => (
												<CampoSelect
													id={field.name}
													label="Resultado del diagnóstico *"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(
															e.target.value as ResultadoDiagnostico,
														)
													}
													disabled={isPending}
												>
													<option value="POSITIVO">Positivo (gestante)</option>
													<option value="NEGATIVO">Negativo (vacía)</option>
												</CampoSelect>
											)}
										</form.Field>
									)}

									{tipoActual === "PARTO" && (
										<CriasPartoFields
											crias={crias}
											onAgregar={agregarCria}
											onActualizar={(key, campo, valor) =>
												setCrias((prev) =>
													prev.map((c) =>
														c.key === key ? { ...c, [campo]: valor } : c,
													),
												)
											}
											onQuitar={(key) =>
												setCrias((prev) => prev.filter((c) => c.key !== key))
											}
										/>
									)}
								</>
							)}
						</form.Subscribe>

						<form.Field name="observaciones">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Observaciones</Label>
									<textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Notas clínicas, pajilla, condición corporal..."
										rows={2}
										className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									/>
								</div>
							)}
						</form.Field>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
								{isPending ? "Guardando..." : "Guardar evento"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{selectorTipo && (
				<GanadoSelectorModal
					open={true}
					onOpenChange={(v) => {
						if (!v) setSelectorTipo(null);
					}}
					title={
						selectorTipo === "HEMBRA"
							? "Seleccionar hembra"
							: "Seleccionar macho"
					}
					defaultSexo={selectorTipo}
					selectedId={selectorTipo === "HEMBRA" ? hembra?.id : macho?.id}
					onSelect={handleSelectGanado}
				/>
			)}
		</>
	);
}

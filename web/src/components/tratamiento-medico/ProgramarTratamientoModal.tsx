import { useForm } from "@tanstack/react-form";
import { Loader2, Search, Stethoscope } from "lucide-react";
import { useState } from "react";
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
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useProgramarTratamiento } from "@/modules/tratamiento-medico/hooks/useProgramarTratamiento";
import { programarTratamientoSchema } from "@/modules/tratamiento-medico/schemas";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";

interface ProgramarTratamientoModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProgramarTratamientoModal({
	open,
	onOpenChange,
}: ProgramarTratamientoModalProps) {
	const [selectorGanadoOpen, setSelectorGanadoOpen] = useState(false);
	const [ganadoSeleccionado, setGanadoSeleccionado] =
		useState<GanadoDto | null>(null);

	const { mutate: programar, isPending } = useProgramarTratamiento();
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: vetsData } = useListarVeterinarios(1, 100);

	const insumosMedicos = (insumosData?.data ?? []).filter(
		(i) => i.tipo === "MEDICAMENTO" || i.tipo === "VACUNA",
	);

	const hoy = new Date().toISOString().split("T")[0] ?? "";

	const form = useForm({
		defaultValues: {
			ganadoId: "",
			diagnostico: "",
			insumoId: "",
			dosisDiaria: "10",
			fechaInicio: hoy,
			fechaFin: hoy,
			veterinarioId: "",
		},
		validators: { onChange: programarTratamientoSchema },
		onSubmit: ({ value }) => {
			programar(
				{
					ganadoId: Number(value.ganadoId),
					diagnostico: value.diagnostico.trim(),
					insumoId: Number(value.insumoId),
					dosisDiaria: Number(value.dosisDiaria),
					fechaInicio: value.fechaInicio,
					fechaFin: value.fechaFin,
					veterinarioId: value.veterinarioId
						? Number(value.veterinarioId)
						: null,
				},
				{
					onSuccess: () => {
						form.reset();
						setGanadoSeleccionado(null);
						onOpenChange(false);
					},
				},
			);
		},
	});

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!isPending) {
						if (!nextOpen) {
							form.reset();
							setGanadoSeleccionado(null);
						}
						onOpenChange(nextOpen);
					}
				}}
			>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-lg font-bold">
							<Stethoscope className="size-5 text-primary" />
							Programar Tratamiento Médico
						</DialogTitle>
						<DialogDescription>
							Asigna un protocolo terapéutico diario con control automático de
							inventario.
						</DialogDescription>
					</DialogHeader>

					<form
						noValidate
						onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
						className="space-y-4 py-2 text-left"
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

						<form.Field name="ganadoId">
							{(field) => {
								const mensajes = extractErrorMessages(
									getVisibleFieldErrors(field.state.meta),
								);
								const esInvalido = mensajes.length > 0;
								return (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Animal Paciente *</Label>
										<div className="flex gap-2">
											<Input
												id={field.name}
												readOnly
												aria-invalid={esInvalido ? "true" : "false"}
												aria-describedby={
													esInvalido ? `${field.name}-error` : undefined
												}
												value={
													ganadoSeleccionado
														? `${ganadoSeleccionado.identificador} (${ganadoSeleccionado.peso} kg)`
														: ""
												}
												placeholder="Seleccionar animal..."
												onBlur={field.handleBlur}
												className="cursor-pointer"
												onClick={() => setSelectorGanadoOpen(true)}
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() => setSelectorGanadoOpen(true)}
												className="shrink-0 gap-1"
											>
												<Search className="size-4" />
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

						<form.Field name="diagnostico">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Diagnóstico Clínico *"
									placeholder="Ej. Infección respiratoria aguda"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<form.Field name="insumoId">
								{(field) => (
									<CampoSelect
										id={field.name}
										label="Medicamento *"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									>
										<option value="">Seleccionar medicamento...</option>
										{insumosMedicos.map((ins) => (
											<option key={ins.id} value={ins.id}>
												{ins.nombre} ({ins.stock} {ins.unidadMedida})
											</option>
										))}
									</CampoSelect>
								)}
							</form.Field>

							<form.Field name="dosisDiaria">
								{(field) => (
									<CampoTexto
										id={field.name}
										label="Dosis Diaria *"
										type="number"
										allowDecimals={true}
										placeholder="Ej. 10.5"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<form.Field name="fechaInicio">
								{(field) => (
									<CampoTexto
										id={field.name}
										label="Fecha Inicio *"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>

							<form.Field name="fechaFin">
								{(field) => (
									<CampoTexto
										id={field.name}
										label="Fecha Fin *"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
						</div>

						<form.Field name="veterinarioId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Veterinario Prescriptor (Opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">-- Sin veterinario especificado --</option>
									{(vetsData?.data ?? []).map((v) => (
										<option key={v.id} value={v.id}>
											{v.nombre} ({v.cedulaProfesional})
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<DialogFooter className="pt-3 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending} className="gap-2">
								{isPending && <Loader2 className="size-4 animate-spin" />}
								Guardar Tratamiento
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<GanadoSelectorModal
				open={selectorGanadoOpen}
				onOpenChange={setSelectorGanadoOpen}
				title="Seleccionar Animal Paciente"
				description="Busca y selecciona el animal activo que recibirá la prescripción."
				selectedId={ganadoSeleccionado?.id ?? null}
				onSelect={(ganadoElegido) => {
					setGanadoSeleccionado(ganadoElegido);
					form.setFieldValue(
						"ganadoId",
						ganadoElegido ? String(ganadoElegido.id) : "",
					);
				}}
			/>
		</>
	);
}

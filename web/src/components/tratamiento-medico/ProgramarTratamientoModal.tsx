import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { GanadoSelectorModal } from "@/components/ganado/GanadoSelectorModal";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatApiError } from "@/lib/utils";
import type { GanadoDto } from "@/modules/ganado/types";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useProgramarTratamiento } from "@/modules/tratamiento-medico/hooks/useProgramarTratamiento";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import {
	AlertCircle,
	Calendar,
	Loader2,
	Search,
	Sprout,
	Stethoscope,
	X,
} from "lucide-react";

interface ProgramarTratamientoModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SELECT_CLASS =
	"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer";

export function ProgramarTratamientoModal({
	open,
	onOpenChange,
}: ProgramarTratamientoModalProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const [selectorGanadoOpen, setSelectorGanadoOpen] = useState(false);
	const [ganadoSeleccionado, setGanadoSeleccionado] =
		useState<GanadoDto | null>(null);

	const programarMutation = useProgramarTratamiento();
	const { data: insumosData, isLoading: loadingInsumos } = useListarInsumos({
		page: 1,
		limit: 100,
	});
	const { data: veterinariosData, isLoading: loadingVets } =
		useListarVeterinarios(1, 100);

	const todayStr = new Date().toISOString().split("T")[0];
	const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];

	const form = useForm({
		defaultValues: {
			ganadoId: "",
			diagnostico: "",
			fechaInicio: todayStr,
			fechaFin: nextWeekStr,
			insumoId: "",
			dosisDiaria: "",
			veterinarioId: "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			const ganadoIdNum = Number(value.ganadoId);
			const insumoIdNum = Number(value.insumoId);
			const dosisNum = Number(value.dosisDiaria);
			const vetIdNum = value.veterinarioId ? Number(value.veterinarioId) : null;

			if (!ganadoIdNum || !insumoIdNum || dosisNum <= 0) {
				setApiError("Por favor complete todos los campos obligatorios.");
				return;
			}

			try {
				await programarMutation.mutateAsync({
					ganadoId: ganadoIdNum,
					diagnostico: value.diagnostico.trim(),
					fechaInicio: new Date(`${value.fechaInicio}T00:00:00Z`).toISOString(),
					fechaFin: new Date(`${value.fechaFin}T23:59:59Z`).toISOString(),
					insumoId: insumoIdNum,
					dosisDiaria: dosisNum,
					veterinarioId: vetIdNum,
				});
				onOpenChange(false);
				form.reset();
				setGanadoSeleccionado(null);
			} catch (error) {
				setApiError(formatApiError(error));
			}
		},
	});

	const insumosList = (insumosData?.data ?? []).filter(
		(i) => i.tipo === "MEDICAMENTO" || i.tipo === "VACUNA",
	);
	const veterinariosList = veterinariosData?.data ?? [];

	const handleCloseModal = (newOpen: boolean) => {
		if (!newOpen) {
			setGanadoSeleccionado(null);
			form.reset();
		}
		onOpenChange(newOpen);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleCloseModal}>
				<DialogContent className="sm:max-w-[550px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-foreground text-lg">
							<Stethoscope className="size-5 text-primary" />
							Recetar Tratamiento Médico
						</DialogTitle>
					</DialogHeader>

					{apiError && (
						<div className="flex items-center gap-2 p-3 text-xs rounded-md bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
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
						className="space-y-4 py-2"
					>
						{/* Selección de Ganado con Modal Paginado */}
						<form.Field
							name="ganadoId"
							validators={{
								onChange: ({ value }) =>
									!value ? "Debe seleccionar un animal paciente" : undefined,
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="selector-ganado-btn">
										Paciente (Ganado) <span className="text-red-500">*</span>
									</Label>

									{ganadoSeleccionado ? (
										<div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-xs">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
													<Sprout className="size-5" />
												</div>
												<div>
													<p className="text-xs font-bold text-foreground">
														Arete: {ganadoSeleccionado.identificador}
													</p>
													<p className="text-[11px] text-muted-foreground">
														{ganadoSeleccionado.sexo} •{" "}
														{ganadoSeleccionado.peso} kg
													</p>
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													setGanadoSeleccionado(null);
													field.handleChange("");
												}}
												className="h-8 px-2 text-xs text-muted-foreground hover:text-red-600 cursor-pointer"
											>
												<X className="size-3.5 mr-1" />
												Cambiar
											</Button>
										</div>
									) : (
										<Button
											id="selector-ganado-btn"
											type="button"
											variant="outline"
											onClick={() => setSelectorGanadoOpen(true)}
											className="w-full justify-between text-xs h-10 border-dashed cursor-pointer text-muted-foreground hover:text-foreground"
										>
											<span className="flex items-center gap-2">
												<Search className="size-4 text-primary" />
												Buscar y seleccionar paciente...
											</span>
											<span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
												Explorar catálogo
											</span>
										</Button>
									)}

									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400">
												{field.state.meta.errors[0]}
											</p>
										)}
								</div>
							)}
						</form.Field>

						{/* Diagnóstico */}
						<form.Field
							name="diagnostico"
							validators={{
								onChange: ({ value }) =>
									!value.trim() ? "El diagnóstico es obligatorio" : undefined,
							}}
						>
							{(field) => (
								<div className="space-y-1">
									<Label htmlFor={field.name}>
										Diagnóstico / Padecimiento{" "}
										<span className="text-red-500">*</span>
									</Label>
									<Input
										id={field.name}
										placeholder="Ej. Mastitis aguda en cuarto posterior derecho"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400">
												{field.state.meta.errors[0]}
											</p>
										)}
								</div>
							)}
						</form.Field>

						{/* Insumo recetado + Dosis Diaria */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<form.Field
								name="insumoId"
								validators={{
									onChange: ({ value }) =>
										!value ? "Seleccione el medicamento" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-1">
										<Label htmlFor={field.name}>
											Medicamento / Insumo{" "}
											<span className="text-red-500">*</span>
										</Label>
										{loadingInsumos ? (
											<div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
												<Loader2 className="size-3 animate-spin" />
												Cargando insumos...
											</div>
										) : (
											<select
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={SELECT_CLASS}
											>
												<option value="">-- Seleccionar Medicamento --</option>
												{insumosList.map((i) => (
													<option key={i.id} value={i.id}>
														{i.nombre} (Stock: {i.stock} {i.unidadMedida})
													</option>
												))}
											</select>
										)}
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="dosisDiaria"
								validators={{
									onChange: ({ value }) => {
										const num = Number(value);
										if (!value || Number.isNaN(num) || num <= 0) {
											return "Ingrese una dosis positiva";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1">
										<Label htmlFor={field.name}>
											Dosis Diaria <span className="text-red-500">*</span>
										</Label>
										<Input
											id={field.name}
											type="number"
											allowDecimals={true}
											placeholder="Ej. 10.5"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>
						</div>

						{/* Fechas Inicio y Fin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<form.Field
								name="fechaInicio"
								validators={{
									onChange: ({ value }) =>
										!value ? "La fecha de inicio es requerida" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-1">
										<Label
											htmlFor={field.name}
											className="flex items-center gap-1"
										>
											<Calendar className="size-3.5" /> Fecha Inicio
										</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="fechaFin"
								validators={{
									onChange: ({ value }) =>
										!value ? "La fecha de fin es requerida" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-1">
										<Label
											htmlFor={field.name}
											className="flex items-center gap-1"
										>
											<Calendar className="size-3.5" /> Fecha Fin
										</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>
						</div>

						{/* Veterinario Atendiente */}
						<form.Field name="veterinarioId">
							{(field) => (
								<div className="space-y-1">
									<Label htmlFor={field.name}>
										Veterinario Prescriptor (Opcional)
									</Label>
									{loadingVets ? (
										<div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
											<Loader2 className="size-3 animate-spin" />
											Cargando veterinarios...
										</div>
									) : (
										<select
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											className={SELECT_CLASS}
										>
											<option value="">
												-- Sin veterinario especificado --
											</option>
											{veterinariosList.map((v) => (
												<option key={v.id} value={v.id}>
													{v.nombre} ({v.cedulaProfesional})
												</option>
											))}
										</select>
									)}
								</div>
							)}
						</form.Field>

						<div className="flex justify-end gap-2 pt-3 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleCloseModal(false)}
								disabled={programarMutation.isPending}
								className="cursor-pointer"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={programarMutation.isPending}
								className="cursor-pointer gap-2"
							>
								{programarMutation.isPending && (
									<Loader2 className="size-4 animate-spin" />
								)}
								Guardar Tratamiento
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal selector de ganado paginado */}
			<GanadoSelectorModal
				open={selectorGanadoOpen}
				onOpenChange={setSelectorGanadoOpen}
				title="Seleccionar Animal Paciente"
				description="Busca y selecciona el animal dentro del catálogo de ganado que recibirá la prescripción."
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

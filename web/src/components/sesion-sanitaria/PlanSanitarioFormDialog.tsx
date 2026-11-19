import { useForm } from "@tanstack/react-form";
import { CalendarClock, Loader2 } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useCrearPlanSanitario } from "@/modules/sesion-sanitaria/hooks/useCalendarioYPlanes";
import { planSanitarioSchema } from "@/modules/sesion-sanitaria/schemas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";

interface PlanSanitarioFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PlanSanitarioFormDialog({
	open,
	onOpenChange,
}: PlanSanitarioFormDialogProps) {
	const { mutate: crearPlan, isPending } = useCrearPlanSanitario();
	const { data: vetsData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: razasData } = useListarRazas();

	const insumosSanitarios = (insumosData?.data ?? []).filter(
		(i) => i.tipo === "VACUNA" || i.tipo === "MEDICAMENTO",
	);

	const form = useForm({
		defaultValues: {
			nombre: "",
			descripcion: "",
			frecuenciaDias: "180",
			dosisPorAnimal: "5",
			veterinarioId: "",
			insumoId: "",
			proximaEjecucion: new Date().toISOString().split("T")[0] ?? "",
			terrenoId: "",
			razaId: "",
			edadMinimaMeses: "",
		},
		validators: { onChange: planSanitarioSchema },
		onSubmit: ({ value }) => {
			crearPlan(
				{
					nombre: value.nombre.trim(),
					descripcion: value.descripcion.trim(),
					frecuenciaDias: Number(value.frecuenciaDias),
					dosisPorAnimal: Number(value.dosisPorAnimal),
					veterinarioId: Number(value.veterinarioId),
					insumoId: Number(value.insumoId),
					proximaEjecucion: value.proximaEjecucion,
					terrenoId: value.terrenoId ? Number(value.terrenoId) : null,
					razaId: value.razaId ? Number(value.razaId) : null,
					edadMinimaMeses:
						value.edadMinimaMeses.trim() !== ""
							? Number(value.edadMinimaMeses)
							: null,
					activo: true,
				},
				{
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
				},
			);
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					if (!nextOpen) form.reset();
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<CalendarClock className="size-5 text-primary" />
						Nuevo Plan Sanitario Preventivo
					</DialogTitle>
					<DialogDescription>
						Programa campañas recurrentes para generar sesiones sanitarias en el
						calendario.
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

					<form.Field name="nombre">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Nombre del Plan *"
								placeholder="Ej. Vacunación Brucelosis Semestral"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="descripcion">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Descripción / Protocolo *"
								placeholder="Aplicación preventiva según protocolo oficial"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="frecuenciaDias">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Frecuencia (días) *"
									type="number"
									allowDecimals={false}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="dosisPorAnimal">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Dosis por Animal *"
									type="number"
									allowDecimals={true}
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
						<form.Field name="veterinarioId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Veterinario *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="">Seleccionar...</option>
									{(vetsData?.data ?? []).map((vet) => (
										<option key={vet.id} value={vet.id}>
											{vet.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<form.Field name="insumoId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Vacuna o Medicamento *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="">Seleccionar...</option>
									{insumosSanitarios.map((ins) => (
										<option key={ins.id} value={ins.id}>
											[{ins.tipo}] {ins.nombre} ({ins.unidadMedida})
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="proximaEjecucion">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Próxima Ejecución *"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="edadMinimaMeses">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Edad mínima (meses)"
									type="number"
									allowDecimals={false}
									placeholder="Opcional"
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
						<form.Field name="terrenoId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Terreno objetivo (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Todos los terrenos</option>
									{(terrenosData?.data ?? []).map((t) => (
										<option key={t.id} value={t.id}>
											{t.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<form.Field name="razaId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Raza objetivo (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Todas las razas</option>
									{(razasData ?? []).map((r) => (
										<option key={r.id} value={r.id}>
											{r.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<DialogFooter className="pt-2">
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
							Crear Plan Sanitario
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

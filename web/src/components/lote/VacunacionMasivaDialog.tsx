import { useForm } from "@tanstack/react-form";
import { Loader2, Syringe } from "lucide-react";
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
import { useVacunacionMasivaLote } from "@/modules/lote/hooks/useLotes";
import { vacunacionMasivaSchema } from "@/modules/lote/schemas";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";

interface VacunacionMasivaDialogProps {
	loteId: number;
	cantidadAnimales: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function VacunacionMasivaDialog({
	loteId,
	cantidadAnimales,
	open,
	onOpenChange,
}: VacunacionMasivaDialogProps) {
	const { mutate: vacunar, isPending } = useVacunacionMasivaLote(loteId);
	const { data: vetsData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });

	const insumosSanitarios = (insumosData?.data ?? []).filter(
		(i) => i.tipo === "VACUNA" || i.tipo === "MEDICAMENTO",
	);

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0] ?? "",
			veterinarioId: "",
			insumoId: "",
			dosisPorAnimal: "5",
			descripcion: "",
		},
		validators: { onChange: vacunacionMasivaSchema },
		onSubmit: ({ value }) => {
			vacunar(
				{
					fecha: value.fecha,
					veterinarioId: Number(value.veterinarioId),
					insumoId: Number(value.insumoId),
					dosisPorAnimal: Number(value.dosisPorAnimal),
					descripcion: value.descripcion.trim(),
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
			<DialogContent className="sm:max-w-lg animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Syringe className="size-5 text-primary" />
						Vacunación Masiva de Lote
					</DialogTitle>
					<DialogDescription>
						Genera una sesión sanitaria para los {cantidadAnimales} animales y
						descuenta el insumo vía Kardex.
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

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="fecha">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Fecha *"
									type="date"
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
									label="Dosis por animal *"
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
									{(vetsData?.data ?? []).map((v) => (
										<option key={v.id} value={v.id}>
											{v.nombre}
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
									{insumosSanitarios.map((i) => (
										<option key={i.id} value={i.id}>
											[{i.tipo}] {i.nombre} ({i.stock} {i.unidadMedida})
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<form.Field name="descripcion">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Descripción / Protocolo *"
								placeholder="Ej. Refuerzo Clostridial Lote Engorda"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
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
							Ejecutar vacunación
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

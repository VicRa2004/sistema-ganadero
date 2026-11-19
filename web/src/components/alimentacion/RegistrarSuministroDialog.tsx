import { useForm } from "@tanstack/react-form";
import { Loader2, Utensils } from "lucide-react";
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
import { useRegistrarSuministro } from "@/modules/alimentacion/hooks/useAlimentacion";
import { registrarSuministroSchema } from "@/modules/alimentacion/schemas";
import type { RacionOutputDto } from "@/modules/alimentacion/types";

interface RegistrarSuministroDialogProps {
	racion: RacionOutputDto | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RegistrarSuministroDialog({
	racion,
	open,
	onOpenChange,
}: RegistrarSuministroDialogProps) {
	const { mutate: suministrar, isPending } = useRegistrarSuministro(
		racion?.id ?? 0,
	);

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0] ?? "",
			cantidadTotalOverride: "",
			observaciones: "",
		},
		validators: { onChange: registrarSuministroSchema },
		onSubmit: ({ value }) => {
			if (!racion) return;
			suministrar(
				{
					fecha: value.fecha || undefined,
					...(value.cantidadTotalOverride.trim() !== "" && {
						cantidadTotalOverride: Number(value.cantidadTotalOverride),
					}),
					observaciones: value.observaciones.trim() || null,
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

	if (!racion) return null;

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
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Utensils className="size-5 text-emerald-600" />
						Registrar Suministro de Alimento
					</DialogTitle>
					<DialogDescription>
						{racion.nombre} — {racion.insumoNombre} (
						{racion.cantidadDiariaPorAnimal} {racion.insumoUnidad}/animal).
						Descuenta el stock vía Kardex.
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

					<form.Field name="fecha">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Fecha"
								type="date"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="cantidadTotalOverride">
						{(field) => (
							<CampoTexto
								id={field.name}
								label={`Cantidad manual opcional (${racion.insumoUnidad})`}
								type="number"
								allowDecimals={true}
								placeholder="Dejar vacío para cálculo automático"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="observaciones">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Observaciones (opcional)"
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
							Registrar suministro
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

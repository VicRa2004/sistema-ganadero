import { useForm } from "@tanstack/react-form";
import { CheckCircle2, Loader2, Syringe } from "lucide-react";
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
import { useRegistrarAplicacionDiaria } from "@/modules/tratamiento-medico/hooks/useRegistrarAplicacionDiaria";
import { aplicarDosisDiariaSchema } from "@/modules/tratamiento-medico/schemas";
import type { TratamientoMedicoDto } from "@/modules/tratamiento-medico/types";

interface AplicarDosisDiariaModalProps {
	tratamiento: TratamientoMedicoDto | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AplicarDosisDiariaModal({
	tratamiento,
	open,
	onOpenChange,
}: AplicarDosisDiariaModalProps) {
	const { mutate: registrarAplicacion, isPending } =
		useRegistrarAplicacionDiaria();

	const form = useForm({
		defaultValues: {
			cantidadDosis: tratamiento ? String(tratamiento.dosisDiaria) : "1",
			observaciones: "",
		},
		validators: { onChange: aplicarDosisDiariaSchema },
		onSubmit: ({ value }) => {
			if (!tratamiento) return;
			registrarAplicacion(
				{
					tratamientoId: tratamiento.id,
					cantidadDosis: Number(value.cantidadDosis),
					observaciones: value.observaciones.trim() || undefined,
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

	if (!tratamiento) return null;

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
						<Syringe className="size-5 text-emerald-600" />
						Registrar Dosis Diaria
					</DialogTitle>
					<DialogDescription>
						Animal:{" "}
						<strong className="text-foreground">
							{tratamiento.ganadoIdentificador ?? `#${tratamiento.ganadoId}`}
						</strong>{" "}
						· {tratamiento.insumoNombre ?? `Insumo #${tratamiento.insumoId}`} (
						{tratamiento.dosisDiaria} {tratamiento.insumoUnidad ?? "dosis/día"})
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

					<form.Field name="cantidadDosis">
						{(field) => (
							<CampoTexto
								id={field.name}
								label={`Cantidad aplicada (${tratamiento.insumoUnidad ?? "unidades"}) *`}
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

					<form.Field name="observaciones">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Observaciones clínicas (opcional)"
								placeholder="Ej. Sin reacciones adversas, fiebre controlada"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

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
							{isPending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<CheckCircle2 className="size-4" />
							)}
							Confirmar aplicación
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

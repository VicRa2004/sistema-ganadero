import { useForm } from "@tanstack/react-form";
import { Loader2, SlidersHorizontal } from "lucide-react";
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
import { useAjustarStockInsumo } from "@/modules/inventario-insumos/hooks/useAjustarStockInsumo";
import { ajustarStockSchema } from "@/modules/inventario-insumos/schemas";
import type { InsumoDto } from "@/modules/inventario-insumos/types";

interface AjustarStockDialogProps {
	insumo: InsumoDto;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AjustarStockDialog({
	insumo,
	open,
	onOpenChange,
}: AjustarStockDialogProps) {
	const { mutate: ajustar, isPending } = useAjustarStockInsumo(insumo.id);

	const form = useForm({
		defaultValues: {
			cantidadDelta: "",
			motivo: "",
			costoUnitario: "",
		},
		validators: { onChange: ajustarStockSchema },
		onSubmit: ({ value }) => {
			ajustar(
				{
					cantidadDelta: Number(value.cantidadDelta),
					motivo: value.motivo.trim(),
					...(value.costoUnitario.trim() !== "" && {
						costoUnitario: Number(value.costoUnitario),
					}),
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
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<SlidersHorizontal className="size-5 text-blue-600" />
						Ajustar Stock Manualmente
					</DialogTitle>
					<DialogDescription>
						Insumo: <strong className="text-foreground">{insumo.nombre}</strong>{" "}
						· Stock actual: {insumo.stock} {insumo.unidadMedida}
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

					<form.Field name="cantidadDelta">
						{(field) => (
							<CampoTexto
								id={field.name}
								label={`Variación (+/- ${insumo.unidadMedida}) *`}
								type="number"
								allowDecimals={true}
								allowNegative={true}
								placeholder="Ej. -2.5 o 5"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="motivo">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Motivo de ajuste / inventario físico *"
								placeholder="Ej. Conteo físico mensual o merma por rotura"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="costoUnitario">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Costo unitario de referencia (opcional)"
								type="number"
								allowDecimals={true}
								placeholder="Ej. 45.00"
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
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
							Aplicar ajuste
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

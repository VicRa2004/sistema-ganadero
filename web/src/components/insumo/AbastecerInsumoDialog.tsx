import { useForm } from "@tanstack/react-form";
import { Loader2, PlusCircle } from "lucide-react";
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
import { useAbastecerInsumo } from "@/modules/inventario-insumos/hooks/useAbastecerInsumo";
import { abastecerInsumoSchema } from "@/modules/inventario-insumos/schemas";
import type { InsumoDto } from "@/modules/inventario-insumos/types";

interface AbastecerInsumoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	insumo: InsumoDto;
}

export function AbastecerInsumoDialog({
	open,
	onOpenChange,
	insumo,
}: AbastecerInsumoDialogProps) {
	const { mutate: abastecer, isPending } = useAbastecerInsumo(insumo.id);

	const form = useForm({
		defaultValues: {
			cantidad: "10",
			costoUnitario: "",
			motivo: "",
		},
		validators: { onChange: abastecerInsumoSchema },
		onSubmit: ({ value }) => {
			abastecer(
				{
					cantidad: Number(value.cantidad),
					...(value.costoUnitario.trim() !== "" && {
						costoUnitario: Number(value.costoUnitario),
					}),
					...(value.motivo.trim() !== "" && {
						motivo: value.motivo.trim(),
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
				if (!isPending) onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
						<PlusCircle className="h-5 w-5" />
						Abastecer Stock de Insumo
					</DialogTitle>
					<DialogDescription>
						Ingresa la cantidad a añadir al stock de{" "}
						<strong className="text-foreground">{insumo.nombre}</strong> (Lote:{" "}
						{insumo.lote}).
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

					<div className="p-3 rounded-lg bg-muted/40 text-sm space-y-1">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Stock Actual:</span>
							<span className="font-semibold">
								{insumo.stock} {insumo.unidadMedida}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Costo Actual:</span>
							<span>${insumo.costoUnitario.toFixed(2)}</span>
						</div>
					</div>

					<form.Field name="cantidad">
						{(field) => (
							<CampoTexto
								id={field.name}
								label={`Cantidad a Ingresar (${insumo.unidadMedida}) *`}
								type="number"
								step="any"
								allowDecimals={true}
								placeholder="Ej: 50"
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
								label="Costo Unitario de Compra ($ opcional)"
								type="number"
								step="0.01"
								allowDecimals={true}
								placeholder="Recalcula promedio ponderado"
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
								label="Motivo / Referencia (opcional)"
								placeholder="Ej: Compra factura #450"
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
						<Button
							type="submit"
							disabled={isPending}
							className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sumando...
								</>
							) : (
								"Abastecer Stock"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

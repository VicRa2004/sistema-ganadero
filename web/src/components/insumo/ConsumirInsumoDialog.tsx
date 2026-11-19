import { useForm } from "@tanstack/react-form";
import { Loader2, MinusCircle } from "lucide-react";
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
import { useConsumirInsumo } from "@/modules/inventario-insumos/hooks/useConsumirInsumo";
import { consumirInsumoSchema } from "@/modules/inventario-insumos/schemas";
import type { InsumoDto } from "@/modules/inventario-insumos/types";

interface ConsumirInsumoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	insumo: InsumoDto;
}

export function ConsumirInsumoDialog({
	open,
	onOpenChange,
	insumo,
}: ConsumirInsumoDialogProps) {
	const { mutate: consumir, isPending } = useConsumirInsumo(insumo.id);
	const schema = consumirInsumoSchema(insumo.stock);

	const form = useForm({
		defaultValues: {
			cantidad: "1",
			motivo: "",
		},
		validators: { onChange: schema },
		onSubmit: ({ value }) => {
			consumir(
				{
					cantidad: Number(value.cantidad),
					...(value.motivo.trim() !== "" && { motivo: value.motivo.trim() }),
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
					<DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
						<MinusCircle className="h-5 w-5" />
						Consumir Insumo
					</DialogTitle>
					<DialogDescription>
						Registra la salida o gasto de{" "}
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
							<span className="text-muted-foreground">Stock Disponible:</span>
							<span className="font-semibold">
								{insumo.stock} {insumo.unidadMedida}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Stock Mínimo:</span>
							<span>
								{insumo.stockMinimo} {insumo.unidadMedida}
							</span>
						</div>
					</div>

					<form.Field name="cantidad">
						{(field) => (
							<CampoTexto
								id={field.name}
								label={`Cantidad a Consumir (${insumo.unidadMedida}) *`}
								type="number"
								step="any"
								allowDecimals={true}
								placeholder="Ej: 10"
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
								label="Motivo de Consumo (opcional)"
								placeholder="Ej: Aplicación manual en corral"
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
							className="min-w-[120px] bg-amber-600 hover:bg-amber-700 text-white"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Descontando...
								</>
							) : (
								"Confirmar Consumo"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

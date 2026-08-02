import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MinusCircle, Hash } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useConsumirInsumo } from "@/modules/inventario-insumos/hooks/useConsumirInsumo";
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
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: consumir, isPending } = useConsumirInsumo(insumo.id);

	const form = useForm({
		defaultValues: {
			cantidad: 1 as number | string,
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			const cantidad = Number(value.cantidad);

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			consumir(
				{ cantidad },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
					onError: handleError,
				},
			);
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					setApiError(null);
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
						<MinusCircle className="h-5 w-5" />
						Registrar Consumo de Insumo
					</DialogTitle>
					<DialogDescription>
						Ingresa la cantidad consumida de{" "}
						<strong className="text-foreground">{insumo.nombre}</strong> (Lote:{" "}
						{insumo.lote}).
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4 py-2"
				>
					{apiError && (
						<div className="p-3 text-sm text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15 rounded-lg border border-red-500/30 font-medium">
							{apiError}
						</div>
					)}

					<div className="p-3 rounded-lg bg-muted/40 text-sm space-y-1">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Stock Disponible:</span>
							<span className="font-semibold text-emerald-600 dark:text-emerald-400">
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

					<form.Field
						name="cantidad"
						validators={{
							onChange: ({ value }) => {
								const num = Number(value);
								if (Number.isNaN(num) || num <= 0)
									return "La cantidad a consumir debe ser mayor a cero.";
								if (num > insumo.stock)
									return `La cantidad a consumir (${num}) supera el stock disponible (${insumo.stock}).`;
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Cantidad a Descontar ({insumo.unidadMedida}){" "}
									<span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="number"
										step="any"
										min="0.01"
										max={insumo.stock}
										placeholder="Ej: 5"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="pl-9"
										disabled={isPending}
									/>
								</div>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<p className="text-xs text-red-600 dark:text-red-400 font-medium">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
							</div>
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
						<form.Subscribe
							selector={(state) => ({ canSubmit: state.canSubmit })}
						>
							{({ canSubmit }) => (
								<Button
									type="submit"
									disabled={isPending || !canSubmit}
									className="min-w-[120px] bg-amber-600 hover:bg-amber-700 text-white"
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Descontando...
										</>
									) : (
										"Descontar Stock"
									)}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

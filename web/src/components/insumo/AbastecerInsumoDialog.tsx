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
import { Loader2, PlusCircle, Hash } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useAbastecerInsumo } from "@/modules/inventario-insumos/hooks/useAbastecerInsumo";
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
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: abastecer, isPending } = useAbastecerInsumo(insumo.id);

	const form = useForm({
		defaultValues: {
			cantidad: 10,
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			const cantidad = Number(value.cantidad);

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			abastecer(
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
							<span className="text-muted-foreground">Stock Actual:</span>
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

					<form.Field
						name="cantidad"
						validators={{
							onChange: ({ value }) => {
								const num = Number(value);
								if (Number.isNaN(num) || num <= 0)
									return "La cantidad a ingresar debe ser mayor a cero.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Cantidad a Ingresar ({insumo.unidadMedida}){" "}
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
										placeholder="Ej: 50"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
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
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

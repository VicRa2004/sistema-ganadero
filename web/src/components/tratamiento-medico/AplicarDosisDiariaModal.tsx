import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
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
import { useRegistrarAplicacionDiaria } from "@/modules/tratamiento-medico/hooks/useRegistrarAplicacionDiaria";
import type { TratamientoMedicoDto } from "@/modules/tratamiento-medico/types";
import { AlertCircle, CheckCircle2, Loader2, Pill } from "lucide-react";

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
	const [apiError, setApiError] = useState<string | null>(null);
	const aplicarMutation = useRegistrarAplicacionDiaria();

	const form = useForm({
		defaultValues: {
			cantidadDosis: tratamiento ? String(tratamiento.dosisDiaria) : "",
			observaciones: "",
		},
		onSubmit: async ({ value }) => {
			if (!tratamiento) return;
			setApiError(null);

			const cantidadNum = value.cantidadDosis
				? Number(value.cantidadDosis)
				: tratamiento.dosisDiaria;

			if (cantidadNum <= 0) {
				setApiError("La dosis administrada debe ser mayor a 0");
				return;
			}

			try {
				await aplicarMutation.mutateAsync({
					tratamientoId: tratamiento.id,
					cantidadDosis: cantidadNum,
					observaciones: value.observaciones.trim() || undefined,
				});
				onOpenChange(false);
				form.reset();
			} catch (error) {
				setApiError(formatApiError(error));
			}
		},
	});

	useEffect(() => {
		if (tratamiento) {
			form.setFieldValue("cantidadDosis", String(tratamiento.dosisDiaria));
		}
	}, [tratamiento, form]);

	if (!tratamiento) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground text-base font-bold">
						<Pill className="size-5 text-emerald-600 dark:text-emerald-400" />
						Registrar Aplicación de Dosis
					</DialogTitle>
				</DialogHeader>

				{apiError && (
					<div className="flex items-center gap-2 p-3 text-xs rounded-md bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
						<AlertCircle className="size-4 shrink-0" />
						<span>{apiError}</span>
					</div>
				)}

				<div className="bg-muted/50 p-3 rounded-lg border border-border text-xs space-y-1">
					<p>
						<span className="font-semibold text-foreground">Paciente:</span>{" "}
						{tratamiento.ganadoIdentificador ??
							`Animal #${tratamiento.ganadoId}`}
					</p>
					<p>
						<span className="font-semibold text-foreground">Diagnóstico:</span>{" "}
						{tratamiento.diagnostico}
					</p>
					<p>
						<span className="font-semibold text-foreground">Medicamento:</span>{" "}
						{tratamiento.insumoNombre ?? `Insumo #${tratamiento.insumoId}`}
					</p>
					<p>
						<span className="font-semibold text-foreground">
							Dosis Recomendada:
						</span>{" "}
						{tratamiento.dosisDiaria} {tratamiento.insumoUnidad ?? "unidades"}
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4 py-2"
				>
					<form.Field
						name="cantidadDosis"
						validators={{
							onChange: ({ value }) => {
								const num = Number(value);
								if (!value || Number.isNaN(num) || num <= 0) {
									return "Ingrese una dosis válida";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>
									Cantidad Administrada (
									{tratamiento.insumoUnidad ?? "unidades"}){" "}
									<span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									type="number"
									allowDecimals={true}
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

					<form.Field name="observaciones">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>Observaciones (Opcional)</Label>
								<Input
									id={field.name}
									placeholder="Ej. Reacción normal, sin fiebre..."
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<div className="flex justify-end gap-2 pt-3 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={aplicarMutation.isPending}
							className="cursor-pointer text-xs"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={aplicarMutation.isPending}
							className="cursor-pointer gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							{aplicarMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<CheckCircle2 className="size-4" />
							)}
							Confirmar Aplicación
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

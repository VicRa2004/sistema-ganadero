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
import { Loader2, Scale } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarPesaje } from "@/modules/ganado/hooks/useRegistrarPesaje";

interface GanadoPesajeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganadoId: number;
	arete: string;
	ultimoPeso: number;
}

export function GanadoPesajeDialog({
	open,
	onOpenChange,
	ganadoId,
	arete,
	ultimoPeso,
}: GanadoPesajeDialogProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: registrarPesaje, isPending } = useRegistrarPesaje(ganadoId);

	const form = useForm({
		defaultValues: {
			peso: "" as string | number,
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			registrarPesaje(
				{ peso: Number(value.peso) },
				{
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
					onError: (error) => {
						setApiError(formatApiError(error));
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
					setApiError(null);
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						Registrar Pesaje
					</DialogTitle>
					<DialogDescription>
						Ingresa el nuevo peso para el animal con arete{" "}
						<span className="font-semibold text-foreground">{arete}</span>.
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

					<div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm text-left">
						<span className="text-muted-foreground block text-xs uppercase font-semibold">
							Peso Anterior
						</span>
						<span className="text-lg font-bold text-foreground">
							{ultimoPeso} kg
						</span>
					</div>

					<form.Field
						name="peso"
						validators={{
							onChange: ({ value }) => {
								if (value === undefined || value === "")
									return "El peso es requerido.";
								const num = Number(value);
								if (Number.isNaN(num) || num <= 0)
									return "Debe introducir un peso positivo válido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Nuevo Peso (kg) <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="number"
										step="any"
										placeholder="Ej: 362.5"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											field.handleChange(val === "" ? "" : Number(val));
										}}
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
									className="min-w-[120px]"
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Registrando...
										</>
									) : (
										"Guardar peso"
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

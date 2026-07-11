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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useTrasladarGanado } from "@/modules/ganado/hooks/useTrasladarGanado";
import type { RanchoDto } from "@/modules/rancho/types";

interface GanadoTrasladoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganadoId: number;
	arete: string;
	ranchoActualId: number;
	ranchos: RanchoDto[];
}

export function GanadoTrasladoDialog({
	open,
	onOpenChange,
	ganadoId,
	arete,
	ranchoActualId,
	ranchos,
}: GanadoTrasladoDialogProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: trasladar, isPending } = useTrasladarGanado(ganadoId);

	// Filtrar ranchos disponibles para no incluir el rancho actual
	const ranchosDisponibles = ranchos.filter((r) => r.id !== ranchoActualId);
	const ranchoActual = ranchos.find((r) => r.id === ranchoActualId);

	const form = useForm({
		defaultValues: {
			ranchoId: "" as string | number,
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			trasladar(
				{ ranchoId: Number(value.ranchoId) },
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
						Trasladar Ganado
					</DialogTitle>
					<DialogDescription>
						Registra el traslado del animal con arete{" "}
						<span className="font-semibold text-foreground">{arete}</span> a
						otro rancho.
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
							Rancho de Origen
						</span>
						<span className="text-sm font-semibold text-foreground">
							{ranchoActual
								? `${ranchoActual.nombre} (${ranchoActual.ubicacion})`
								: `Rancho ID: ${ranchoActualId}`}
						</span>
					</div>

					<form.Field
						name="ranchoId"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "El rancho destino es requerido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Rancho Destino <span className="text-destructive">*</span>
								</Label>
								<select
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value === "" ? "" : Number(e.target.value),
										)
									}
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isPending}
								>
									<option value="">Seleccione el rancho destino...</option>
									{ranchosDisponibles.map((r) => (
										<option key={r.id} value={r.id}>
											{r.nombre} ({r.ubicacion})
										</option>
									))}
								</select>
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
									disabled={
										isPending || !canSubmit || ranchosDisponibles.length === 0
									}
									className="min-w-[120px]"
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Trasladando...
										</>
									) : (
										"Confirmar traslado"
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

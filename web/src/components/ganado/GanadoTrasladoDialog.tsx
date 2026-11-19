import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
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
import { useTrasladarGanado } from "@/modules/ganado/hooks/useTrasladarGanado";
import { ganadoTrasladoSchema } from "@/modules/ganado/schemas";
import type { TerrenoDto } from "@/modules/terreno/types";

interface GanadoTrasladoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganadoId: number;
	arete: string;
	terrenoActualId: number;
	terrenos: TerrenoDto[];
}

export function GanadoTrasladoDialog({
	open,
	onOpenChange,
	ganadoId,
	arete,
	terrenoActualId,
	terrenos,
}: GanadoTrasladoDialogProps) {
	const { mutate: trasladar, isPending } = useTrasladarGanado(ganadoId);
	const terrenosDisponibles = terrenos.filter((r) => r.id !== terrenoActualId);
	const terrenoActual = terrenos.find((r) => r.id === terrenoActualId);

	const form = useForm({
		defaultValues: { terrenoId: "" },
		validators: { onChange: ganadoTrasladoSchema },
		onSubmit: ({ value }) => {
			trasladar(
				{ terrenoId: Number(value.terrenoId) },
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
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						Trasladar Ganado
					</DialogTitle>
					<DialogDescription>
						Registra el traslado del animal con arete{" "}
						<span className="font-semibold text-foreground">{arete}</span> a
						otro terreno.
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

					<div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm text-left">
						<span className="text-muted-foreground block text-xs uppercase font-semibold">
							Terreno de Origen
						</span>
						<span className="text-sm font-semibold text-foreground">
							{terrenoActual
								? `${terrenoActual.nombre} (${terrenoActual.ubicacion})`
								: `Terreno ID: ${terrenoActualId}`}
						</span>
					</div>

					<form.Field name="terrenoId">
						{(field) => (
							<CampoSelect
								id={field.name}
								label="Terreno Destino *"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							>
								<option value="">Seleccione el terreno destino...</option>
								{terrenosDisponibles.map((r) => (
									<option key={r.id} value={r.id}>
										{r.nombre} ({r.ubicacion})
									</option>
								))}
							</CampoSelect>
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
							disabled={isPending || terrenosDisponibles.length === 0}
							className="min-w-[120px] cursor-pointer"
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { useRegistrarPesaje } from "@/modules/ganado/hooks/useRegistrarPesaje";
import { ganadoPesajeSchema } from "@/modules/ganado/schemas";

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
	const { mutate: registrarPesaje, isPending } = useRegistrarPesaje(ganadoId);

	const form = useForm({
		defaultValues: { peso: "" },
		validators: { onChange: ganadoPesajeSchema },
		onSubmit: ({ value }) => {
			registrarPesaje(
				{ peso: Number(value.peso) },
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
						Registrar Pesaje
					</DialogTitle>
					<DialogDescription>
						Ingresa el nuevo peso para el animal con arete{" "}
						<span className="font-semibold text-foreground">{arete}</span>.
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
							Peso Anterior
						</span>
						<span className="text-lg font-bold text-foreground">
							{ultimoPeso} kg
						</span>
					</div>

					<form.Field name="peso">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Nuevo Peso (kg) *"
								type="number"
								step="any"
								allowDecimals={true}
								placeholder="Ej: 362.5"
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

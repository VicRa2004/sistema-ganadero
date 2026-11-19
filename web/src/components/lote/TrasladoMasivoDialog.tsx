import { useForm } from "@tanstack/react-form";
import { ArrowRightLeft, Loader2 } from "lucide-react";
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
import { useTrasladoMasivoLote } from "@/modules/lote/hooks/useLotes";
import { trasladoMasivoSchema } from "@/modules/lote/schemas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";

interface TrasladoMasivoDialogProps {
	loteId: number;
	cantidadAnimales: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TrasladoMasivoDialog({
	loteId,
	cantidadAnimales,
	open,
	onOpenChange,
}: TrasladoMasivoDialogProps) {
	const { mutate: trasladar, isPending } = useTrasladoMasivoLote(loteId);
	const { data: terrenosData } = useListarTerrenos(1, 100);

	const form = useForm({
		defaultValues: { terrenoDestinoId: "" },
		validators: { onChange: trasladoMasivoSchema },
		onSubmit: ({ value }) => {
			trasladar(
				{ terrenoDestinoId: Number(value.terrenoDestinoId) },
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
						<ArrowRightLeft className="size-5 text-blue-600" />
						Traslado Masivo de Lote
					</DialogTitle>
					<DialogDescription>
						Traslada los {cantidadAnimales} animales activos del lote
						verificando la capacidad del terreno destino.
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

					<form.Field name="terrenoDestinoId">
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
								<option value="">Selecciona un terreno...</option>
								{(terrenosData?.data ?? []).map((t) => (
									<option key={t.id} value={t.id}>
										{t.nombre} (Capacidad máx: {t.capacidadMaxima})
									</option>
								))}
							</CampoSelect>
						)}
					</form.Field>

					<DialogFooter>
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
							Confirmar traslado masivo
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

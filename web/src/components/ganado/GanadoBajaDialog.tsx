import { useForm } from "@tanstack/react-form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
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
import { useDarDeBajaGanado } from "@/modules/ganado/hooks/useDarDeBajaGanado";
import { useListarMotivosBaja } from "@/modules/ganado/hooks/useListarMotivosBaja";
import { ganadoBajaSchema } from "@/modules/ganado/schemas";

interface GanadoBajaDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganadoId: number;
	ganadoIdentificador: string;
}

export function GanadoBajaDialog({
	open,
	onOpenChange,
	ganadoId,
	ganadoIdentificador,
}: GanadoBajaDialogProps) {
	const { mutate: darDeBaja, isPending } = useDarDeBajaGanado(ganadoId);
	const { data: motivosBaja = [], isLoading: isCargandoMotivos } =
		useListarMotivosBaja();

	const form = useForm({
		defaultValues: {
			fechaBaja: new Date().toISOString().split("T")[0] ?? "",
			motivoBajaId: "",
		},
		validators: { onChange: ganadoBajaSchema },
		onSubmit: ({ value }) => {
			darDeBaja(
				{
					fechaBaja: value.fechaBaja,
					motivoBajaId: Number(value.motivoBajaId),
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
				if (!isPending) {
					form.reset();
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl font-bold">
						<AlertTriangle className="size-5 text-amber-500" />
						Dar de Baja Ganado
					</DialogTitle>
					<DialogDescription>
						Registra la baja del animal con arete{" "}
						<span className="font-semibold text-foreground">
							{ganadoIdentificador}
						</span>
						. El registro se conservará en el sistema marcado como inactivo.
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

					<form.Field name="fechaBaja">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Fecha de Baja *"
								type="date"
								max={new Date().toISOString().split("T")[0]}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="motivoBajaId">
						{(field) => (
							<CampoSelect
								id={field.name}
								label="Motivo de Baja *"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending || isCargandoMotivos}
							>
								<option value="">
									{isCargandoMotivos
										? "Cargando motivos..."
										: "Seleccione un motivo..."}
								</option>
								{motivosBaja.map((m) => (
									<option key={m.id} value={m.id}>
										{m.nombre}
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
							disabled={isPending}
							variant="destructive"
							className="min-w-[130px] gap-1 cursor-pointer"
						>
							{isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Registrando baja...
								</>
							) : (
								<>
									<AlertTriangle className="size-4" />
									Confirmar baja
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

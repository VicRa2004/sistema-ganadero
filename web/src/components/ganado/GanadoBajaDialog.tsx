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
import { AlertTriangle, Loader2 } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useDarDeBajaGanado } from "@/modules/ganado/hooks/useDarDeBajaGanado";
import { useListarMotivosBaja } from "@/modules/ganado/hooks/useListarMotivosBaja";

const SELECT_CLASS =
	"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

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
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: darDeBaja, isPending } = useDarDeBajaGanado(ganadoId);
	const { data: motivosBaja = [], isLoading: isCargandoMotivos } =
		useListarMotivosBaja();

	const form = useForm({
		defaultValues: {
			fechaBaja: new Date().toISOString().split("T")[0] ?? "",
			motivoBajaId: "" as number | "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
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
					// biome-ignore lint/suspicious/noExplicitAny: error cast
					onError: (error: any) => {
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

					{/* Fecha de Baja */}
					<form.Field
						name="fechaBaja"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "La fecha de baja es requerida.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Fecha de Baja <span className="text-destructive">*</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
									max={new Date().toISOString().split("T")[0]}
								/>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<p className="text-xs text-red-600 dark:text-red-400 font-medium">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					{/* Motivo de Baja */}
					<form.Field
						name="motivoBajaId"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "El motivo de baja es requerido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Motivo de Baja <span className="text-destructive">*</span>
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
									className={SELECT_CLASS}
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
									disabled={isPending || !canSubmit}
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
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

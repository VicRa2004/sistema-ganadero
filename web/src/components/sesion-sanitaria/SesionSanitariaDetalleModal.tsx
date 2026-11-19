import { useForm } from "@tanstack/react-form";
import {
	Calendar,
	Loader2,
	Plus,
	Stethoscope,
	Syringe,
	UserCheck,
	X,
} from "lucide-react";
import { useState } from "react";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import { Badge } from "@/components/ui/badge";
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
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { useObtenerDetalleSesionSanitaria } from "@/modules/sesion-sanitaria/hooks/useObtenerDetalleSesionSanitaria";
import { useRegistrarResultadoAnimal } from "@/modules/sesion-sanitaria/hooks/useRegistrarResultadoAnimal";
import { resultadoAnimalSchema } from "@/modules/sesion-sanitaria/schemas";

interface SesionSanitariaDetalleModalProps {
	sesionId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SesionSanitariaDetalleModal({
	sesionId,
	open,
	onOpenChange,
}: SesionSanitariaDetalleModalProps) {
	const [agregarAnimalOpen, setAgregarAnimalOpen] = useState(false);

	const { data: sesion, isLoading } = useObtenerDetalleSesionSanitaria(
		open ? sesionId : null,
	);
	const { data: ganadosData } = useListarGanado(
		{ page: 1, limit: 100, soloActivos: true },
		open && agregarAnimalOpen,
	);
	const { mutate: registrarResultado, isPending } =
		useRegistrarResultadoAnimal();

	const form = useForm({
		defaultValues: {
			ganadoId: "",
			dosisAplicada: "1",
			observaciones: "",
		},
		validators: { onChange: resultadoAnimalSchema },
		onSubmit: ({ value }) => {
			if (!sesionId) return;
			registrarResultado(
				{
					sesionId,
					ganadoId: Number(value.ganadoId),
					dosisAplicada: Number(value.dosisAplicada),
					observaciones: value.observaciones.trim() || null,
				},
				{
					onSuccess: () => {
						form.reset();
						setAgregarAnimalOpen(false);
					},
				},
			);
		},
	});

	const ganadosDisponibles = (ganadosData?.data ?? []).filter(
		(g) => !sesion?.aplicaciones?.some((a) => a.ganadoId === g.id),
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					setAgregarAnimalOpen(false);
					form.reset();
				}
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Stethoscope className="size-5 text-primary" />
						Detalle de Sesión Sanitaria
					</DialogTitle>
					<DialogDescription>
						{sesion
							? `${sesion.descripcion} — ${sesion.fecha.slice(0, 10)}`
							: "Consulta la información y aplicaciones por animal."}
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
						<Loader2 className="size-4 animate-spin text-primary" />
						Cargando sesión...
					</div>
				) : !sesion ? (
					<p className="text-sm text-muted-foreground py-6 text-center">
						No se pudo cargar la sesión sanitaria.
					</p>
				) : (
					<div className="space-y-4 text-left">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3 text-sm">
							<div className="flex items-center gap-2">
								<Calendar className="size-4 text-muted-foreground" />
								<span>
									<strong>Fecha:</strong> {sesion.fecha.slice(0, 10)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<UserCheck className="size-4 text-muted-foreground" />
								<span>
									<strong>Veterinario:</strong>{" "}
									{sesion.nombreVeterinario ?? `#${sesion.veterinarioId}`}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Syringe className="size-4 text-muted-foreground" />
								<span>
									<strong>Insumo:</strong>{" "}
									{sesion.nombreInsumo ?? `#${sesion.insumoId}`} (
									{sesion.totalDosisAplicadas}{" "}
									{sesion.unidadMedidaInsumo ?? "u"})
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge
									variant={
										sesion.estado === "REALIZADA" ? "default" : "secondary"
									}
								>
									{sesion.estado}
								</Badge>
								<span className="text-xs text-muted-foreground">
									{sesion.totalAnimales} animal(es)
								</span>
							</div>
						</div>

						<div className="flex items-center justify-between gap-2">
							<h3 className="text-sm font-semibold">
								Animales Tratados ({sesion.aplicaciones.length})
							</h3>
							{sesion.estado !== "CANCELADA" && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setAgregarAnimalOpen((v) => !v)}
									className="gap-1.5"
								>
									{agregarAnimalOpen ? (
										<>
											<X className="size-3.5" />
											Cerrar
										</>
									) : (
										<>
											<Plus className="size-3.5" />
											Agregar Animal / Resultado
										</>
									)}
								</Button>
							)}
						</div>

						{agregarAnimalOpen && (
							<form
								noValidate
								onSubmit={(e) =>
									handleFormSubmitWithFocus(e, form.handleSubmit)
								}
								className="space-y-3 rounded-lg border border-border bg-muted/10 p-3"
							>
								<form.Subscribe
									selector={(s) =>
										Object.values(s.fieldMeta).filter(
											(m) => m?.isTouched && (m.errors?.length ?? 0) > 0,
										).length
									}
								>
									{(errorCount) => (
										<FormErrorAnnouncer errorCount={errorCount} />
									)}
								</form.Subscribe>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<form.Field name="ganadoId">
										{(field) => (
											<CampoSelect
												id={field.name}
												label="Animal *"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												errors={getVisibleFieldErrors(field.state.meta)}
												disabled={isPending}
											>
												<option value="">Seleccionar animal...</option>
												{ganadosDisponibles.map((g) => (
													<option key={g.id} value={g.id}>
														{g.identificador} ({g.peso} kg)
													</option>
												))}
											</CampoSelect>
										)}
									</form.Field>

									<form.Field name="dosisAplicada">
										{(field) => (
											<CampoTexto
												id={field.name}
												label={`Dosis (${sesion.unidadMedidaInsumo ?? "unidades"}) *`}
												type="number"
												allowDecimals={true}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												errors={getVisibleFieldErrors(field.state.meta)}
												disabled={isPending}
											/>
										)}
									</form.Field>
								</div>

								<form.Field name="observaciones">
									{(field) => (
										<CampoTexto
											id={field.name}
											label="Observaciones (opcional)"
											placeholder="Ej. Aplicado sin incidencias"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											errors={getVisibleFieldErrors(field.state.meta)}
											disabled={isPending}
										/>
									)}
								</form.Field>

								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setAgregarAnimalOpen(false)}
										disabled={isPending}
									>
										Cancelar
									</Button>
									<Button type="submit" size="sm" disabled={isPending}>
										{isPending && (
											<Loader2 className="size-3.5 mr-1 animate-spin" />
										)}
										Registrar Resultado
									</Button>
								</div>
							</form>
						)}

						<div className="space-y-2 max-h-64 overflow-y-auto pr-1">
							{sesion.aplicaciones.length === 0 ? (
								<p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
									No hay animales registrados en esta sesión.
								</p>
							) : (
								sesion.aplicaciones.map((app) => (
									<div
										key={app.id}
										className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5 text-sm"
									>
										<div className="min-w-0">
											<span className="font-semibold">
												{app.identificadorGanado ?? `Ganado #${app.ganadoId}`}
											</span>
											{app.observaciones && (
												<p className="text-xs text-muted-foreground truncate">
													{app.observaciones}
												</p>
											)}
										</div>
										<Badge variant="outline" className="shrink-0">
											{app.dosisAplicada} {sesion.unidadMedidaInsumo ?? "u"}
										</Badge>
									</div>
								))
							)}
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

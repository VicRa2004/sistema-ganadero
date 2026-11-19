import { useForm } from "@tanstack/react-form";
import { Loader2, Wheat } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import {
	useActualizarRacion,
	useCrearRacion,
} from "@/modules/alimentacion/hooks/useAlimentacion";
import { racionFormSchema } from "@/modules/alimentacion/schemas";
import type { RacionOutputDto } from "@/modules/alimentacion/types";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useListarLotes } from "@/modules/lote/hooks/useLotes";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";

interface RacionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	racion?: RacionOutputDto | null;
}

export function RacionFormDialog({
	open,
	onOpenChange,
	racion,
}: RacionFormDialogProps) {
	const isEditing = !!racion;
	const { mutate: crear, isPending: creando } = useCrearRacion();
	const { mutate: actualizar, isPending: actualizando } = useActualizarRacion();
	const isPending = creando || actualizando;

	const { data: insumosData } = useListarInsumos({
		page: 1,
		limit: 100,
		tipo: "ALIMENTO",
	});
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: lotesData } = useListarLotes({ page: 1, limit: 100 });

	const alimentos = (insumosData?.data ?? []).filter(
		(i) => i.tipo === "ALIMENTO",
	);

	const form = useForm({
		defaultValues: {
			nombre: racion?.nombre ?? "",
			insumoId: String(racion?.insumoId ?? ""),
			terrenoId: String(racion?.terrenoId ?? ""),
			loteId: String(racion?.loteId ?? ""),
			cantidadDiariaPorAnimal: racion
				? String(racion.cantidadDiariaPorAnimal)
				: "5",
			diasAlertaAutonomia: racion ? String(racion.diasAlertaAutonomia) : "7",
			observaciones: racion?.observaciones ?? "",
			activo: racion?.activo ?? true,
		},
		validators: { onChange: racionFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				nombre: value.nombre.trim(),
				insumoId: Number(value.insumoId),
				terrenoId: value.terrenoId ? Number(value.terrenoId) : null,
				loteId: value.loteId ? Number(value.loteId) : null,
				cantidadDiariaPorAnimal: Number(value.cantidadDiariaPorAnimal),
				diasAlertaAutonomia: Number(value.diasAlertaAutonomia),
				observaciones: value.observaciones.trim() || null,
				activo: value.activo,
			};
			if (isEditing && racion) {
				actualizar(
					{ id: racion.id, input: payload },
					{ onSuccess: () => onOpenChange(false) },
				);
			} else {
				crear(payload, {
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
				});
			}
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
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Wheat className="size-5 text-primary" />
						{isEditing ? "Editar Ración" : "Nueva Ración Alimentaria"}
					</DialogTitle>
					<DialogDescription>
						Solo permite insumos de categoría ALIMENTO asociados a un lote o
						terreno.
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

					<form.Field name="nombre">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Nombre de Ración *"
								placeholder="Ej. Ración Engorda Mañana"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="insumoId">
						{(field) => (
							<CampoSelect
								id={field.name}
								label="Insumo (Solo ALIMENTO) *"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							>
								<option value="">Seleccionar alimento...</option>
								{alimentos.map((a) => (
									<option key={a.id} value={a.id}>
										{a.nombre} ({a.stock} {a.unidadMedida})
									</option>
								))}
							</CampoSelect>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="loteId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Lote (o terreno)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="">Sin lote</option>
									{(lotesData?.data ?? []).map((l) => (
										<option key={l.id} value={l.id}>
											{l.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
						<form.Field name="terrenoId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Terreno (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Sin terreno</option>
									{(terrenosData?.data ?? []).map((t) => (
										<option key={t.id} value={t.id}>
											{t.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="cantidadDiariaPorAnimal">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Cantidad diaria / animal *"
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
						<form.Field name="diasAlertaAutonomia">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Alerta autonomía (días) *"
									type="number"
									allowDecimals={false}
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
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="activo">
						{(field) => (
							<div className="flex items-center gap-2 text-sm">
								<input
									id="racion-activa"
									type="checkbox"
									checked={field.state.value}
									onChange={(e) => field.handleChange(e.target.checked)}
									className="accent-primary cursor-pointer"
								/>
								<Label htmlFor="racion-activa" className="font-normal">
									Ración activa
								</Label>
							</div>
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
							{isEditing ? "Guardar cambios" : "Crear ración"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import { useForm } from "@tanstack/react-form";
import { Layers, Loader2 } from "lucide-react";
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
import { useActualizarLote, useCrearLote } from "@/modules/lote/hooks/useLotes";
import { loteFormSchema } from "@/modules/lote/schemas";
import {
	type LoteOutputDto,
	PROPOSITOS_LOTE,
	type PropositoLote,
} from "@/modules/lote/types";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";

interface LoteFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lote?: LoteOutputDto | null;
}

export function LoteFormDialog({
	open,
	onOpenChange,
	lote,
}: LoteFormDialogProps) {
	const isEditing = !!lote;
	const { mutate: crear, isPending: creando } = useCrearLote();
	const { mutate: actualizar, isPending: actualizando } = useActualizarLote(
		lote?.id ?? 0,
	);
	const isPending = creando || actualizando;
	const { data: terrenosData } = useListarTerrenos(1, 100);

	const form = useForm({
		defaultValues: {
			nombre: lote?.nombre ?? "",
			proposito: (lote?.proposito ?? "ENGORDA") as string,
			terrenoId: String(lote?.terrenoId ?? ""),
			descripcion: lote?.descripcion ?? "",
			activo: lote?.activo ?? true,
		},
		validators: { onChange: loteFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				nombre: value.nombre.trim(),
				proposito: value.proposito as PropositoLote,
				terrenoId: value.terrenoId ? Number(value.terrenoId) : null,
				descripcion: value.descripcion.trim() || null,
				activo: value.activo,
			};
			if (isEditing) {
				actualizar(payload, { onSuccess: () => onOpenChange(false) });
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
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Layers className="size-5 text-primary" />
						{isEditing ? "Editar Lote" : "Crear Nuevo Lote"}
					</DialogTitle>
					<DialogDescription>
						Agrupa animales para pesajes, traslados, vacunaciones y raciones
						conjuntas.
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
								label="Nombre del Lote *"
								placeholder="Ej. Lote Engorda 2026"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="proposito">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Propósito *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									{PROPOSITOS_LOTE.map((p) => (
										<option key={p} value={p}>
											{p}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<form.Field name="terrenoId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Terreno base (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Sin terreno asignado</option>
									{(terrenosData?.data ?? []).map((t) => (
										<option key={t.id} value={t.id}>
											{t.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<form.Field name="descripcion">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Descripción (opcional)"
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
									id="lote-activo"
									type="checkbox"
									checked={field.state.value}
									onChange={(e) => field.handleChange(e.target.checked)}
									className="accent-primary cursor-pointer"
								/>
								<Label htmlFor="lote-activo" className="font-normal">
									Lote activo
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
							{isEditing ? "Guardar cambios" : "Crear lote"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import { useForm } from "@tanstack/react-form";
import { Loader2, Package } from "lucide-react";
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
import { useActualizarInsumo } from "@/modules/inventario-insumos/hooks/useActualizarInsumo";
import { useRegistrarInsumo } from "@/modules/inventario-insumos/hooks/useRegistrarInsumo";
import {
	actualizarInsumoSchema,
	crearInsumoSchema,
} from "@/modules/inventario-insumos/schemas";
import type { InsumoDto, TipoInsumo } from "@/modules/inventario-insumos/types";

interface InsumoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	insumo?: InsumoDto;
}

export function InsumoFormDialog({
	open,
	onOpenChange,
	insumo,
}: InsumoFormDialogProps) {
	const isEditing = !!insumo;
	const { mutate: registrar, isPending: isRegistrando } = useRegistrarInsumo();
	const { mutate: actualizar, isPending: isActualizando } = useActualizarInsumo(
		insumo?.id ?? 0,
	);
	const isPending = isRegistrando || isActualizando;
	const schema = isEditing ? actualizarInsumoSchema : crearInsumoSchema;

	const form = useForm({
		defaultValues: {
			nombre: insumo?.nombre ?? "",
			tipo: (insumo?.tipo ?? "MEDICAMENTO") as string,
			stockInicial: insumo ? String(insumo.stock) : "100",
			stockMinimo: insumo ? String(insumo.stockMinimo) : "20",
			unidadMedida: insumo?.unidadMedida ?? "ml",
			lote: insumo?.lote ?? "",
			fechaCaducidad: insumo
				? insumo.fechaCaducidad.substring(0, 10)
				: new Date().toISOString().substring(0, 10),
			periodoRetiroDias: insumo ? String(insumo.periodoRetiroDias) : "0",
			costoUnitario:
				insumo && insumo.costoUnitario > 0 ? String(insumo.costoUnitario) : "",
		},
		validators: { onChange: schema },
		onSubmit: ({ value }) => {
			const costoNum =
				value.costoUnitario.trim() !== ""
					? Number(value.costoUnitario)
					: undefined;
			const common = {
				nombre: value.nombre.trim(),
				tipo: value.tipo as TipoInsumo,
				stockMinimo: Number(value.stockMinimo),
				unidadMedida: value.unidadMedida.trim(),
				lote: value.lote.trim(),
				fechaCaducidad: new Date(value.fechaCaducidad).toISOString(),
				periodoRetiroDias: Number(value.periodoRetiroDias || 0),
				...(costoNum !== undefined && { costoUnitario: costoNum }),
			};

			if (isEditing) {
				actualizar(common, {
					onSuccess: () => onOpenChange(false),
				});
			} else {
				registrar(
					{
						...common,
						stockInicial: Number(value.stockInicial),
					},
					{
						onSuccess: () => {
							form.reset();
							onOpenChange(false);
						},
					},
				);
			}
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						<Package className="h-5 w-5 text-primary" />
						{isEditing ? "Editar Insumo" : "Registrar Nuevo Insumo"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los detalles o costos del producto veterinario o alimenticio."
							: "Ingresa un producto al inventario con su stock inicial y costo unitario."}
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
								label="Nombre del Insumo *"
								placeholder="Ej: Ivermectina 1%, Vitamina ADE"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.Field name="tipo">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Tipo de Insumo *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="MEDICAMENTO">Medicamento</option>
									<option value="VACUNA">Vacuna</option>
									<option value="ALIMENTO">Alimento</option>
								</CampoSelect>
							)}
						</form.Field>

						<form.Field name="unidadMedida">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Unidad de Medida *"
									placeholder="ml, mg, kg, dosis"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{!isEditing && (
							<form.Field name="stockInicial">
								{(field) => (
									<CampoTexto
										id={field.name}
										label="Stock Inicial *"
										type="number"
										step="any"
										allowDecimals={true}
										placeholder="100"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
						)}
						<form.Field name="stockMinimo">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Stock Mínimo (Alerta) *"
									type="number"
									step="any"
									allowDecimals={true}
									placeholder="20"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
						<form.Field name="costoUnitario">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Costo Unitario ($ opcional)"
									type="number"
									step="0.01"
									allowDecimals={true}
									placeholder="Ej: 18.50"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<form.Field name="lote">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Lote / Referencia *"
									placeholder="LOT-2026"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="fechaCaducidad">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Caducidad *"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="periodoRetiroDias">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Retiro (días) *"
									type="number"
									min="0"
									step="1"
									allowDecimals={false}
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<DialogFooter className="pt-4">
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
									Guardando...
								</>
							) : isEditing ? (
								"Guardar Cambios"
							) : (
								"Registrar Insumo"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

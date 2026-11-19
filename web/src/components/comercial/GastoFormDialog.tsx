import { useForm } from "@tanstack/react-form";
import { Loader2, Receipt } from "lucide-react";
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
import {
	useActualizarGasto,
	useRegistrarGasto,
} from "@/modules/comercial/hooks/useComercial";
import { gastoFormSchema } from "@/modules/comercial/schemas";
import {
	CATEGORIA_GASTO_LABELS,
	CATEGORIAS_GASTO,
	type CategoriaGasto,
	type GastoOutputDto,
} from "@/modules/comercial/types";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { useListarLotes } from "@/modules/lote/hooks/useLotes";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";

interface GastoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	gasto?: GastoOutputDto | null;
}

export function GastoFormDialog({
	open,
	onOpenChange,
	gasto,
}: GastoFormDialogProps) {
	const isEditing = !!gasto;
	const { mutate: registrar, isPending: isRegistrando } = useRegistrarGasto();
	const { mutate: actualizar, isPending: isActualizando } =
		useActualizarGasto();
	const isPending = isRegistrando || isActualizando;

	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: ganadosData } = useListarGanado(
		{ page: 1, limit: 100, soloActivos: false },
		open,
	);
	const { data: lotesData } = useListarLotes({ page: 1, limit: 100 });

	const form = useForm({
		defaultValues: {
			categoria: (gasto?.categoria ?? "MANO_OBRA") as string,
			concepto: gasto?.concepto ?? "",
			monto: gasto ? String(gasto.monto) : "",
			fecha: gasto
				? gasto.fecha.slice(0, 10)
				: (new Date().toISOString().split("T")[0] ?? ""),
			terrenoId: String(gasto?.terrenoId ?? ""),
			ganadoId: String(gasto?.ganadoId ?? ""),
			loteId: String(gasto?.loteId ?? ""),
			observaciones: gasto?.observaciones ?? "",
		},
		validators: { onChange: gastoFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				categoria: value.categoria as CategoriaGasto,
				concepto: value.concepto.trim(),
				monto: Number(value.monto),
				fecha: value.fecha,
				terrenoId: value.terrenoId ? Number(value.terrenoId) : null,
				ganadoId: value.ganadoId ? Number(value.ganadoId) : null,
				loteId: value.loteId ? Number(value.loteId) : null,
				observaciones: value.observaciones.trim() || null,
			};

			if (isEditing && gasto) {
				actualizar(
					{ id: gasto.id, input: payload },
					{ onSuccess: () => onOpenChange(false) },
				);
			} else {
				registrar(payload, {
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
						<Receipt className="size-5 text-primary" />
						{isEditing ? "Editar Gasto Operativo" : "Registrar Gasto Operativo"}
					</DialogTitle>
					<DialogDescription>
						Imputa gastos operativos opcionalmente a un terreno, animal o lote
						para el cálculo de rentabilidad.
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

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="categoria">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Categoría *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									{CATEGORIAS_GASTO.map((c) => (
										<option key={c} value={c}>
											{CATEGORIA_GASTO_LABELS[c]}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
						<form.Field name="fecha">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Fecha *"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="concepto">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Concepto *"
									placeholder="Ej. Reparación de cerco eléctrico"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
						<form.Field name="monto">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Monto ($) *"
									type="number"
									allowDecimals={true}
									placeholder="Ej. 1850.00"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
									<option value="">Ninguno</option>
									{(terrenosData?.data ?? []).map((t) => (
										<option key={t.id} value={t.id}>
											{t.nombre}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
						<form.Field name="ganadoId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Animal (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Ninguno</option>
									{(ganadosData?.data ?? []).map((g) => (
										<option key={g.id} value={g.id}>
											{g.identificador}
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>
						<form.Field name="loteId">
							{(field) => (
								<CampoSelect
									id={field.name}
									label="Lote (opcional)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								>
									<option value="">Ninguno</option>
									{(lotesData?.data ?? []).map((l) => (
										<option key={l.id} value={l.id}>
											{l.nombre}
										</option>
									))}
								</CampoSelect>
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
							{isEditing ? "Guardar cambios" : "Registrar gasto"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

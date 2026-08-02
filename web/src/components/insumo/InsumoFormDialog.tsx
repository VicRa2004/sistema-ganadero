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
import { Loader2, Package, Tag, Calendar, Hash, Layers } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarInsumo } from "@/modules/inventario-insumos/hooks/useRegistrarInsumo";
import { useActualizarInsumo } from "@/modules/inventario-insumos/hooks/useActualizarInsumo";
import type { InsumoDto, TipoInsumo } from "@/modules/inventario-insumos/types";

interface InsumoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	insumo?: InsumoDto;
}

export function InsumoFormDialog({
	open,
	onOpenChange,
	insumo,
}: InsumoFormDialogProps) {
	const isEditing = !!insumo;
	const [apiError, setApiError] = useState<string | null>(null);

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarInsumo();
	const { mutate: actualizar, isPending: isActualizando } = useActualizarInsumo(
		insumo?.id ?? 0,
	);

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			nombre: insumo?.nombre ?? "",
			tipo: (insumo?.tipo ?? "MEDICAMENTO") as TipoInsumo,
			stockInicial: (insumo?.stock ?? 100) as number | string,
			stockMinimo: (insumo?.stockMinimo ?? 20) as number | string,
			unidadMedida: insumo?.unidadMedida ?? "ml",
			lote: insumo?.lote ?? "",
			fechaCaducidad: insumo
				? insumo.fechaCaducidad.substring(0, 10)
				: new Date().toISOString().substring(0, 10),
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			if (isEditing) {
				const payload = {
					nombre: value.nombre.trim(),
					tipo: value.tipo,
					stockMinimo: Number(value.stockMinimo),
					unidadMedida: value.unidadMedida.trim(),
					lote: value.lote.trim(),
					fechaCaducidad: new Date(value.fechaCaducidad).toISOString(),
				};
				actualizar(payload, {
					onSuccess: () => {
						onOpenChange(false);
					},
					onError: handleError,
				});
			} else {
				const payload = {
					nombre: value.nombre.trim(),
					tipo: value.tipo,
					stockInicial: Number(value.stockInicial),
					stockMinimo: Number(value.stockMinimo),
					unidadMedida: value.unidadMedida.trim(),
					lote: value.lote.trim(),
					fechaCaducidad: new Date(value.fechaCaducidad).toISOString(),
				};
				registrar(payload, {
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
					onError: handleError,
				});
			}
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					setApiError(null);
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing ? "Editar Insumo" : "Registrar Nuevo Insumo"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del insumo ${insumo.nombre}.`
							: "Completa los datos del nuevo producto del inventario. Todos los campos marcados con asterisco son obligatorios."}
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

					{/* Nombre */}
					<form.Field
						name="nombre"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.trim() === "")
									return "El nombre del insumo es requerido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Nombre del Insumo <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Ivermectina 1%, Vacuna Triple Bovina"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="pl-9"
										disabled={isPending}
									/>
								</div>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<p className="text-xs text-red-600 dark:text-red-400 font-medium">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					{/* Categoría / Tipo y Unidad de Medida */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.Field name="tipo">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Categoría <span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(e.target.value as TipoInsumo)
											}
											disabled={isPending}
											className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring"
										>
											<option value="MEDICAMENTO">MEDICAMENTO</option>
											<option value="VACUNA">VACUNA</option>
											<option value="ALIMENTO">ALIMENTO</option>
										</select>
									</div>
								</div>
							)}
						</form.Field>

						<form.Field
							name="unidadMedida"
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim() === "")
										return "La unidad de medida es requerida.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Unidad de Medida <span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="text"
											placeholder="Ej: ml, dosis, kg"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="pl-9"
											disabled={isPending}
										/>
									</div>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400 font-medium">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</div>

					{/* Stock (Inicial o Mínimo) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{!isEditing && (
							<form.Field
								name="stockInicial"
								validators={{
									onChange: ({ value }) => {
										if (
											value === undefined ||
											value === null ||
											String(value).trim() === ""
										)
											return "El stock inicial es requerido.";
										const num = Number(value);
										if (Number.isNaN(num))
											return "Debe introducir un número válido.";
										if (num < 0)
											return "El stock inicial no puede ser negativo.";
										if (num > 1000000)
											return "El stock inicial no puede exceder 1,000,000 de unidades.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>
											Stock Inicial <span className="text-destructive">*</span>
										</Label>
										<div className="relative">
											<Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="number"
												step="any"
												min="0"
												placeholder="0"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-9"
												disabled={isPending}
											/>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 font-medium">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>
						)}

						<form.Field
							name="stockMinimo"
							validators={{
								onChange: ({ value }) => {
									if (
										value === undefined ||
										value === null ||
										String(value).trim() === ""
									)
										return "El stock mínimo es requerido.";
									const num = Number(value);
									if (Number.isNaN(num))
										return "Debe introducir un número válido.";
									if (num < 0) return "El stock mínimo no puede ser negativo.";
									if (num > 1000000)
										return "El stock mínimo no puede exceder 1,000,000 de unidades.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div
									className={`space-y-1.5 ${isEditing ? "sm:col-span-2" : ""}`}
								>
									<Label htmlFor={field.name}>
										Stock Mínimo (Alerta){" "}
										<span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="number"
											step="any"
											min="0"
											placeholder="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="pl-9"
											disabled={isPending}
										/>
									</div>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400 font-medium">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</div>

					{/* Lote y Fecha de Caducidad */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.Field
							name="lote"
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim() === "")
										return "El número de lote es requerido.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Lote de Producción{" "}
										<span className="text-destructive">*</span>
									</Label>
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: LOT-2026-001"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isPending}
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

						<form.Field
							name="fechaCaducidad"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "La fecha de caducidad es requerida.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Fecha de Caducidad{" "}
										<span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="pl-9"
											disabled={isPending}
										/>
									</div>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
											<p className="text-xs text-red-600 dark:text-red-400 font-medium">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</div>

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
									className="min-w-[120px]"
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{isEditing ? "Guardando..." : "Registrando..."}
										</>
									) : isEditing ? (
										"Guardar cambios"
									) : (
										"Registrar Insumo"
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

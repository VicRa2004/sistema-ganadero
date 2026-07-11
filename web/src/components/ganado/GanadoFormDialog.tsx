import { useState, useEffect } from "react";
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
import { Loader2, Tag, Scale, Calendar, Sparkles } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarGanado } from "@/modules/ganado/hooks/useRegistrarGanado";
import { useActualizarGanado } from "@/modules/ganado/hooks/useActualizarGanado";
import type { GanadoDto } from "@/modules/ganado/types";
import type { RazaDto } from "@/modules/raza/types";
import type { RanchoDto } from "@/modules/rancho/types";
import type { PropietarioDto } from "@/modules/propietario/types";

interface GanadoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	ganado?: GanadoDto;
	razas: RazaDto[];
	ranchos: RanchoDto[];
	propietarios: PropietarioDto[];
}

export function GanadoFormDialog({
	open,
	onOpenChange,
	ganado,
	razas,
	ranchos,
	propietarios,
}: GanadoFormDialogProps) {
	const isEditing = !!ganado;
	const [apiError, setApiError] = useState<string | null>(null);

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarGanado();
	const { mutate: actualizar, isPending: isActualizando } = useActualizarGanado(
		ganado?.id ?? 0,
	);

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			identificador: ganado?.identificador ?? "",
			peso: ganado?.peso ?? "",
			edadEnMeses: ganado?.edadEnMeses ?? "",
			sexo: (ganado?.sexo ?? "") as "" | "MACHO" | "HEMBRA",
			razaId: ganado?.razaId ?? "",
			ranchoId: ganado?.ranchoId ?? "",
			propietarioId: ganado?.propietarioId ?? "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			const payload = {
				identificador: value.identificador.trim(),
				peso: Number(value.peso),
				edadEnMeses: Number(value.edadEnMeses),
				sexo: value.sexo as "MACHO" | "HEMBRA",
				razaId: Number(value.razaId),
				ranchoId: Number(value.ranchoId),
				propietarioId: Number(value.propietarioId),
			};

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			if (isEditing) {
				actualizar(payload, {
					onSuccess: () => onOpenChange(false),
					onError: handleError,
				});
			} else {
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

	// Resetear formulario cuando se abre para edición
	useEffect(() => {
		if (open) {
			form.setFieldValue("identificador", ganado?.identificador ?? "");
			form.setFieldValue("peso", ganado?.peso ?? "");
			form.setFieldValue("edadEnMeses", ganado?.edadEnMeses ?? "");
			form.setFieldValue(
				"sexo",
				(ganado?.sexo ?? "") as "" | "MACHO" | "HEMBRA",
			);
			form.setFieldValue("razaId", ganado?.razaId ?? "");
			form.setFieldValue("ranchoId", ganado?.ranchoId ?? "");
			form.setFieldValue("propietarioId", ganado?.propietarioId ?? "");
		}
	}, [open, ganado, form]);

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
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing
							? "Editar Información de Ganado"
							: "Registrar Cabeza de Ganado"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del ganado con arete ${ganado.identificador}.`
							: "Completa los datos del nuevo animal para agregarlo al sistema."}
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

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Campo Identificador (Arete) */}
						<form.Field
							name="identificador"
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim() === "")
										return "El identificador (arete) es requerido.";
									if (value.trim().length < 2)
										return "El arete debe tener al menos 2 caracteres.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Código / Arete <span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="text"
											placeholder="Ej: AR-0982"
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

						{/* Campo Sexo */}
						<form.Field
							name="sexo"
							validators={{
								onChange: ({ value }) => {
									if (!value) return "El sexo es requerido.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Sexo <span className="text-destructive">*</span>
									</Label>
									<select
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value as "MACHO" | "HEMBRA")
										}
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={isPending}
									>
										<option value="">Seleccione...</option>
										<option value="MACHO">MACHO</option>
										<option value="HEMBRA">HEMBRA</option>
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

						{/* Campo Peso */}
						<form.Field
							name="peso"
							validators={{
								onChange: ({ value }) => {
									if (value === undefined || value === "")
										return "El peso es requerido.";
									const num = Number(value);
									if (Number.isNaN(num) || num <= 0)
										return "Debe introducir un peso positivo válido.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Peso Inicial (kg){" "}
										<span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="number"
											step="any"
											placeholder="Ej: 350.5"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const val = e.target.value;
												field.handleChange(val === "" ? "" : Number(val));
											}}
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

						{/* Campo Edad en Meses */}
						<form.Field
							name="edadEnMeses"
							validators={{
								onChange: ({ value }) => {
									if (value === undefined || value === "")
										return "La edad es requerida.";
									const num = Number(value);
									if (Number.isNaN(num) || !Number.isInteger(num) || num < 0)
										return "Debe introducir un número entero no negativo.";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Edad (Meses) <span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id={field.name}
											name={field.name}
											type="number"
											step="1"
											placeholder="Ej: 24"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const val = e.target.value;
												field.handleChange(val === "" ? "" : Number(val));
											}}
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

					{/* Campo Raza */}
					<form.Field
						name="razaId"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "La raza es requerida.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Raza <span className="text-destructive">*</span>
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
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isPending}
								>
									<option value="">Seleccione una raza...</option>
									{razas.map((r) => (
										<option key={r.id} value={r.id}>
											{r.nombre}
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

					{/* Campo Rancho */}
					<form.Field
						name="ranchoId"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "El rancho es requerido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Rancho <span className="text-destructive">*</span>
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
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isPending}
								>
									<option value="">Seleccione un rancho...</option>
									{ranchos.map((r) => (
										<option key={r.id} value={r.id}>
											{r.nombre} ({r.ubicacion})
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

					{/* Campo Propietario */}
					<form.Field
						name="propietarioId"
						validators={{
							onChange: ({ value }) => {
								if (!value) return "El propietario es requerido.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Propietario <span className="text-destructive">*</span>
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
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isPending}
								>
									<option value="">Seleccione un propietario...</option>
									{propietarios.map((p) => (
										<option key={p.id} value={p.id}>
											{p.nombre}
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

					<DialogFooter className="pt-4 border-t border-border">
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
									className="min-w-[130px] gap-1 cursor-pointer"
								>
									{isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											{isEditing ? "Guardando..." : "Registrando..."}
										</>
									) : (
										<>
											<Sparkles className="size-4" />
											{isEditing ? "Guardar cambios" : "Registrar ganado"}
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

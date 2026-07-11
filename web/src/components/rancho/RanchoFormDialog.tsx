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
import { Loader2, Warehouse, MapPin, Maximize2, Users } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarRancho } from "@/modules/rancho/hooks/useRegistrarRancho";
import { useActualizarRancho } from "@/modules/rancho/hooks/useActualizarRancho";
import type { RanchoDto } from "@/modules/rancho/types";

interface RanchoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	rancho?: RanchoDto;
}

export function RanchoFormDialog({
	open,
	onOpenChange,
	rancho,
}: RanchoFormDialogProps) {
	const isEditing = !!rancho;
	const [apiError, setApiError] = useState<string | null>(null);

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarRancho();
	const { mutate: actualizar, isPending: isActualizando } = useActualizarRancho(
		rancho?.id ?? 0,
	);

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			nombre: rancho?.nombre ?? "",
			ubicacion: rancho?.ubicacion ?? "",
			extensionHectareas: rancho?.extensionHectareas ?? "",
			capacidadMaxima: rancho?.capacidadMaxima ?? "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			const payload = {
				nombre: value.nombre.trim(),
				ubicacion: value.ubicacion.trim(),
				extensionHectareas: Number(value.extensionHectareas),
				capacidadMaxima: Number(value.capacidadMaxima),
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
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing ? "Editar Rancho" : "Registrar Rancho"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del rancho ${rancho.nombre}.`
							: "Completa los datos del nuevo rancho. Todos los campos son obligatorios."}
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

					{/* Campo Nombre */}
					<form.Field
						name="nombre"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.trim() === "")
									return "El nombre es requerido.";
								if (value.trim().length < 2)
									return "El nombre debe tener al menos 2 caracteres.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Nombre <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Warehouse className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Rancho San Antonio"
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

					{/* Campo Ubicación */}
					<form.Field
						name="ubicacion"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.trim() === "")
									return "La ubicación es requerida.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Ubicación <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Km 15 Carretera Central, Sonora"
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

					{/* Campo Extensión Hectáreas */}
					<form.Field
						name="extensionHectareas"
						validators={{
							onChange: ({ value }) => {
								if (value === undefined || value === "")
									return "La extensión es requerida.";
								const num = Number(value);
								if (Number.isNaN(num) || num <= 0)
									return "Debe introducir una extensión positiva válida.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Extensión (Hectáreas){" "}
									<span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Maximize2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="number"
										step="any"
										placeholder="Ej: 150.5"
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

					{/* Campo Capacidad Máxima */}
					<form.Field
						name="capacidadMaxima"
						validators={{
							onChange: ({ value }) => {
								if (value === undefined || value === "")
									return "La capacidad máxima es requerida.";
								const num = Number(value);
								if (Number.isNaN(num) || !Number.isInteger(num) || num <= 0)
									return "Debe introducir un número entero positivo.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Capacidad Máxima (Cabezas){" "}
									<span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="number"
										step="1"
										placeholder="Ej: 300"
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
										"Registrar"
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

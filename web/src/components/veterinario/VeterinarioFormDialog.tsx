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
import { Loader2, User, Phone, FileText, Briefcase } from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarVeterinario } from "@/modules/veterinario/hooks/useRegistrarVeterinario";
import { useActualizarVeterinario } from "@/modules/veterinario/hooks/useActualizarVeterinario";
import type { VeterinarioDto } from "@/modules/veterinario/types";

interface VeterinarioFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	veterinario?: VeterinarioDto;
}

export function VeterinarioFormDialog({
	open,
	onOpenChange,
	veterinario,
}: VeterinarioFormDialogProps) {
	const isEditing = !!veterinario;
	const [apiError, setApiError] = useState<string | null>(null);

	const { mutate: registrar, isPending: isRegistrando } =
		useRegistrarVeterinario();
	const { mutate: actualizar, isPending: isActualizando } =
		useActualizarVeterinario(veterinario?.id ?? 0);

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			nombre: veterinario?.nombre ?? "",
			telefono: veterinario?.telefono ?? "",
			cedulaProfesional: veterinario?.cedulaProfesional ?? "",
			especialidad: veterinario?.especialidad ?? "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);
			// Normalizar campos opcionales vacíos a null
			const payload = {
				nombre: value.nombre.trim(),
				telefono: value.telefono.trim(),
				cedulaProfesional: value.cedulaProfesional.trim(),
				especialidad: value.especialidad?.trim() || null,
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing ? "Editar Veterinario" : "Registrar Veterinario"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del médico veterinario ${veterinario.nombre}.`
							: "Completa los datos del nuevo médico veterinario. Nombre, teléfono y cédula son obligatorios."}
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
									<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Dr. Juan Pérez"
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

					{/* Campo Teléfono */}
					<form.Field
						name="telefono"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.trim() === "")
									return "El teléfono es requerido.";
								if (!/^[+\d\s\-()]{7,20}$/.test(value)) {
									return "Introduce un número de teléfono válido.";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Teléfono <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="tel"
										placeholder="Ej: 555-0199"
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

					{/* Campo Cédula Profesional */}
					<form.Field
						name="cedulaProfesional"
						validators={{
							onChange: ({ value }) => {
								if (!value || value.trim() === "")
									return "La cédula profesional es requerida.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>
									Cédula Profesional <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: VET-12345"
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

					{/* Campo Especialidad */}
					<form.Field
						name="especialidad"
						validators={{
							onChange: ({ value }) => {
								if (value && value.trim().length > 100) {
									return "La especialidad no puede exceder los 100 caracteres.";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Especialidad</Label>
								<div className="relative">
									<Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Cirugía y Reproducción (opcional)"
										value={field.state.value ?? ""}
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

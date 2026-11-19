import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { useActualizarVeterinario } from "@/modules/veterinario/hooks/useActualizarVeterinario";
import { useRegistrarVeterinario } from "@/modules/veterinario/hooks/useRegistrarVeterinario";
import { veterinarioFormSchema } from "@/modules/veterinario/schemas";
import type { VeterinarioDto } from "@/modules/veterinario/types";

interface VeterinarioFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	veterinario?: VeterinarioDto;
}

export function VeterinarioFormDialog({
	open,
	onOpenChange,
	veterinario,
}: VeterinarioFormDialogProps) {
	const isEditing = !!veterinario;
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
		validators: { onChange: veterinarioFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				nombre: value.nombre.trim(),
				telefono: value.telefono.trim(),
				cedulaProfesional: value.cedulaProfesional.trim(),
				especialidad: value.especialidad.trim() || null,
			};

			if (isEditing) {
				actualizar(payload, { onSuccess: () => onOpenChange(false) });
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
				if (!isPending) onOpenChange(nextOpen);
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
								label="Nombre *"
								placeholder="Ej: Dr. Roberto Garza"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="telefono">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Teléfono *"
								placeholder="Ej: 5512345678"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="cedulaProfesional">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Cédula Profesional *"
								placeholder="Ej: CED-987654"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="especialidad">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Especialidad (opcional)"
								placeholder="Ej: Reproducción Bovina"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
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
						<Button
							type="submit"
							disabled={isPending}
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

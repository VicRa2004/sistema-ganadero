import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useActualizarPropietario } from "@/modules/propietario/hooks/useActualizarPropietario";
import { useRegistrarPropietario } from "@/modules/propietario/hooks/useRegistrarPropietario";
import { propietarioFormSchema } from "@/modules/propietario/schemas";
import type { PropietarioDto } from "@/modules/propietario/types";

interface PropietarioFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	propietario?: PropietarioDto;
}

export function PropietarioFormDialog({
	open,
	onOpenChange,
	propietario,
}: PropietarioFormDialogProps) {
	const isEditing = !!propietario;
	const [imagenMarcaFile, setImagenMarcaFile] = useState<File | null>(null);
	const [eliminarImagenMarca, setEliminarImagenMarca] = useState(false);

	const baseApiUrl =
		(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		propietario?.imagenMarca ? `${baseApiUrl}${propietario.imagenMarca}` : null,
	);

	const { mutate: registrar, isPending: isRegistrando } =
		useRegistrarPropietario();
	const { mutate: actualizar, isPending: isActualizando } =
		useActualizarPropietario(propietario?.id ?? 0);
	const isPending = isRegistrando || isActualizando;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (nextOpen) {
			setImagenMarcaFile(null);
			setEliminarImagenMarca(false);
			setPreviewUrl(
				propietario?.imagenMarca
					? `${baseApiUrl}${propietario.imagenMarca}`
					: null,
			);
		}
		onOpenChange(nextOpen);
	};

	const form = useForm({
		defaultValues: {
			nombre: propietario?.nombre ?? "",
			telefono: propietario?.telefono ?? "",
			correo: propietario?.correo ?? "",
		},
		validators: { onChange: propietarioFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				nombre: value.nombre.trim(),
				telefono: value.telefono.trim() || null,
				correo: value.correo.trim() || null,
				imagenMarca: eliminarImagenMarca ? null : imagenMarcaFile || undefined,
			};

			if (isEditing) {
				actualizar(payload, { onSuccess: () => handleOpenChange(false) });
			} else {
				registrar(payload, {
					onSuccess: () => {
						form.reset();
						handleOpenChange(false);
					},
				});
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing ? "Editar Propietario" : "Registrar Propietario"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del propietario ${propietario.nombre}.`
							: "Completa los datos del nuevo propietario. Solo el nombre es obligatorio."}
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
								placeholder="Ej: Juan Pérez"
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
								label="Teléfono (opcional)"
								placeholder="Ej: 5512345678"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="correo">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Correo Electrónico (opcional)"
								type="email"
								placeholder="Ej: juan@ejemplo.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<div className="space-y-1.5 text-left">
						<Label htmlFor="imagenMarca" className="text-sm font-semibold">
							Fierro para marcar ganado (Imagen)
						</Label>
						{previewUrl && !eliminarImagenMarca ? (
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/80">
								<img
									src={previewUrl}
									alt="Vista previa de marca"
									className="size-16 rounded-md object-contain border bg-background"
								/>
								<div className="flex flex-col gap-1">
									<span className="text-xs text-muted-foreground">
										Marca actual cargada
									</span>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="h-7 text-xs px-2.5 w-fit"
										onClick={() => {
											setEliminarImagenMarca(true);
											setImagenMarcaFile(null);
										}}
									>
										Eliminar marca
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<Input
									id="imagenMarca"
									type="file"
									accept="image/*"
									disabled={isPending}
									onChange={(e) => {
										const file = e.target.files?.[0] || null;
										setImagenMarcaFile(file);
										setEliminarImagenMarca(false);
										setPreviewUrl(file ? URL.createObjectURL(file) : null);
									}}
								/>
								{eliminarImagenMarca && (
									<p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
										Se eliminará el fierro de marca al guardar.
									</p>
								)}
							</div>
						)}
					</div>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
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

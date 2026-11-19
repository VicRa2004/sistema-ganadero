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
import { useActualizarTerreno } from "@/modules/terreno/hooks/useActualizarTerreno";
import { useRegistrarTerreno } from "@/modules/terreno/hooks/useRegistrarTerreno";
import { terrenoFormSchema } from "@/modules/terreno/schemas";
import type { TerrenoDto } from "@/modules/terreno/types";

interface TerrenoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	terreno?: TerrenoDto;
}

export function TerrenoFormDialog({
	open,
	onOpenChange,
	terreno,
}: TerrenoFormDialogProps) {
	const isEditing = !!terreno;
	const [imagenTerrenoFile, setImagenTerrenoFile] = useState<File | null>(null);
	const [eliminarImagenTerreno, setEliminarImagenTerreno] = useState(false);

	const baseApiUrl =
		(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		terreno?.imagenTerreno ? `${baseApiUrl}${terreno.imagenTerreno}` : null,
	);

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarTerreno();
	const { mutate: actualizar, isPending: isActualizando } =
		useActualizarTerreno(terreno?.id ?? 0);
	const isPending = isRegistrando || isActualizando;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (nextOpen) {
			setImagenTerrenoFile(null);
			setEliminarImagenTerreno(false);
			setPreviewUrl(
				terreno?.imagenTerreno ? `${baseApiUrl}${terreno.imagenTerreno}` : null,
			);
		}
		onOpenChange(nextOpen);
	};

	const form = useForm({
		defaultValues: {
			nombre: terreno?.nombre ?? "",
			ubicacion: terreno?.ubicacion ?? "",
			extensionHectareas: terreno ? String(terreno.extensionHectareas) : "",
			capacidadMaxima: terreno ? String(terreno.capacidadMaxima) : "",
		},
		validators: { onChange: terrenoFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				nombre: value.nombre.trim(),
				ubicacion: value.ubicacion.trim(),
				extensionHectareas: Number(value.extensionHectareas),
				capacidadMaxima: Number(value.capacidadMaxima),
				imagenTerreno: eliminarImagenTerreno
					? null
					: imagenTerrenoFile || undefined,
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
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{isEditing ? "Editar Terreno" : "Registrar Terreno"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? `Modifica los datos del terreno ${terreno.nombre}.`
							: "Completa los datos del nuevo terreno. Todos los campos son obligatorios."}
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
								placeholder="Ej: Potrero El Roble"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<form.Field name="ubicacion">
						{(field) => (
							<CampoTexto
								id={field.name}
								label="Ubicación *"
								placeholder="Ej: Zona Norte km 12"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								errors={getVisibleFieldErrors(field.state.meta)}
								disabled={isPending}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.Field name="extensionHectareas">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Extensión (ha) *"
									type="number"
									step="any"
									allowDecimals={true}
									placeholder="Ej: 45.5"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="capacidadMaxima">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Capacidad Máxima *"
									type="number"
									step="1"
									allowDecimals={false}
									placeholder="Ej: 300"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-1.5 text-left">
						<Label htmlFor="imagenTerreno" className="text-sm font-semibold">
							Imagen del Terreno (Opcional)
						</Label>
						{previewUrl && !eliminarImagenTerreno ? (
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/80 animate-fade-in">
								<img
									src={previewUrl}
									alt="Vista previa del terreno"
									className="size-16 rounded-md object-cover border bg-background"
								/>
								<div className="flex flex-col gap-1">
									<span className="text-xs text-muted-foreground">
										Imagen actual cargada
									</span>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="h-7 text-xs px-2.5 w-fit cursor-pointer"
										onClick={() => {
											setEliminarImagenTerreno(true);
											setImagenTerrenoFile(null);
										}}
									>
										Eliminar imagen
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<Input
									id="imagenTerreno"
									type="file"
									accept="image/*"
									disabled={isPending}
									onChange={(e) => {
										const file = e.target.files?.[0] || null;
										setImagenTerrenoFile(file);
										setEliminarImagenTerreno(false);
										setPreviewUrl(file ? URL.createObjectURL(file) : null);
									}}
								/>
								{eliminarImagenTerreno && (
									<p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
										Se eliminará la imagen del terreno al guardar.
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
							className="min-w-[120px] cursor-pointer"
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

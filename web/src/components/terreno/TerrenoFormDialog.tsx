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
import {
	Loader2,
	Warehouse,
	MapPin,
	Maximize2,
	Users,
	Image as ImageIcon,
} from "lucide-react";
import { formatApiError } from "@/lib/utils";
import { useRegistrarTerreno } from "@/modules/terreno/hooks/useRegistrarTerreno";
import { useActualizarTerreno } from "@/modules/terreno/hooks/useActualizarTerreno";
import type { TerrenoDto } from "@/modules/terreno/types";

interface TerrenoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Si se pasa, el formulario funciona en modo edición */
	terreno?: TerrenoDto;
}

export function TerrenoFormDialog({
	open,
	onOpenChange,
	terreno,
}: TerrenoFormDialogProps) {
	const isEditing = !!terreno;
	const [apiError, setApiError] = useState<string | null>(null);

	const [imagenTerrenoFile, setImagenTerrenoFile] = useState<File | null>(null);
	const [eliminarImagenTerreno, setEliminarImagenTerreno] = useState(false);

	const baseApiUrl =
		(import.meta.env.VITE_API_URL as string)?.replace("/api", "") ||
		"http://localhost:3000";
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		terreno?.imagenTerreno ? `${baseApiUrl}${terreno.imagenTerreno}` : null,
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!isPending) {
			setApiError(null);
			if (nextOpen) {
				setImagenTerrenoFile(null);
				setEliminarImagenTerreno(false);
				setPreviewUrl(
					terreno?.imagenTerreno
						? `${baseApiUrl}${terreno.imagenTerreno}`
						: null,
				);
			}
			onOpenChange(nextOpen);
		}
	};

	const { mutate: registrar, isPending: isRegistrando } = useRegistrarTerreno();
	const { mutate: actualizar, isPending: isActualizando } =
		useActualizarTerreno(terreno?.id ?? 0);

	const isPending = isRegistrando || isActualizando;

	const form = useForm({
		defaultValues: {
			nombre: terreno?.nombre ?? "",
			ubicacion: terreno?.ubicacion ?? "",
			extensionHectareas: terreno?.extensionHectareas ?? "",
			capacidadMaxima: terreno?.capacidadMaxima ?? "",
		},
		onSubmit: async ({ value }) => {
			setApiError(null);

			const payload = {
				nombre: value.nombre.trim(),
				ubicacion: value.ubicacion.trim(),
				extensionHectareas: Number(value.extensionHectareas),
				capacidadMaxima: Number(value.capacidadMaxima),
				imagenTerreno: eliminarImagenTerreno
					? null
					: imagenTerrenoFile || undefined,
			};

			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			const handleError = (error: any) => {
				setApiError(formatApiError(error));
			};

			if (isEditing) {
				actualizar(payload, {
					onSuccess: () => handleOpenChange(false),
					onError: handleError,
				});
			} else {
				registrar(payload, {
					onSuccess: () => {
						form.reset();
						handleOpenChange(false);
					},
					onError: handleError,
				});
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md animate-fade-in">
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
							<div className="space-y-1.5 text-left">
								<Label htmlFor={field.name}>
									Nombre <span className="text-destructive">*</span>
								</Label>
								<div className="relative">
									<Warehouse className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="Ej: Terreno Las Pampas"
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
							<div className="space-y-1.5 text-left">
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
							<div className="space-y-1.5 text-left">
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
							<div className="space-y-1.5 text-left">
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

					{/* Campo Imagen del Terreno */}
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
								<div className="relative">
									<ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="imagenTerreno"
										type="file"
										accept="image/*"
										disabled={isPending}
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											setImagenTerrenoFile(file);
											setEliminarImagenTerreno(false);
											if (file) {
												setPreviewUrl(URL.createObjectURL(file));
											} else {
												setPreviewUrl(null);
											}
										}}
										className="pl-9"
									/>
								</div>
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
						<form.Subscribe
							selector={(state) => ({ canSubmit: state.canSubmit })}
						>
							{({ canSubmit }) => (
								<Button
									type="submit"
									disabled={isPending || !canSubmit}
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
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

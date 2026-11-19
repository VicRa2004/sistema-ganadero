import type { RefObject } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GanadoImagenFieldProps {
	fileInputRef: RefObject<HTMLInputElement | null>;
	imagenPreview: string | null;
	getImagenUrl: (path: string | null) => string | null;
	disabled: boolean;
	onPreviewChange: (url: string | null) => void;
}

export function GanadoImagenField({
	fileInputRef,
	imagenPreview,
	getImagenUrl,
	disabled,
	onPreviewChange,
}: GanadoImagenFieldProps) {
	return (
		<fieldset className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
			<legend className="px-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
				<ImageIcon className="size-4 text-primary" />
				Imagen del Ganado (opcional)
			</legend>
			<div className="flex items-start gap-4">
				{imagenPreview && (
					<img
						src={getImagenUrl(imagenPreview) || ""}
						alt="Preview del ganado"
						className="size-20 rounded-lg object-cover border border-border shrink-0"
					/>
				)}
				<div className="flex-1 space-y-2">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						id="imagen-ganado-input"
						className="hidden"
						disabled={disabled}
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								onPreviewChange(URL.createObjectURL(file));
							}
						}}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2 cursor-pointer"
						disabled={disabled}
						onClick={() => fileInputRef.current?.click()}
					>
						<ImageIcon className="size-4" />
						{imagenPreview ? "Cambiar imagen" : "Seleccionar imagen"}
					</Button>
					{imagenPreview && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-2 cursor-pointer text-muted-foreground"
							disabled={disabled}
							onClick={() => {
								onPreviewChange(null);
								if (fileInputRef.current) {
									fileInputRef.current.value = "";
								}
							}}
						>
							Quitar imagen
						</Button>
					)}
					<p className="text-xs text-muted-foreground">
						JPG, PNG, WEBP. Máximo recomendado: 5MB.
					</p>
				</div>
			</div>
		</fieldset>
	);
}

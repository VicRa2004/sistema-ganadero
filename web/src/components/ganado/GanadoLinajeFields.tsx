import { GitBranch, Search, UserCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { GanadoDto } from "@/modules/ganado/types";

interface GanadoLinajeFieldsProps {
	padreSeleccionado: GanadoDto | null;
	madreSeleccionada: GanadoDto | null;
	getImagenUrl: (path: string | null) => string | null;
	disabled: boolean;
	onOpenPadre: () => void;
	onOpenMadre: () => void;
	onClearPadre: () => void;
	onClearMadre: () => void;
}

export function GanadoLinajeFields({
	padreSeleccionado,
	madreSeleccionada,
	getImagenUrl,
	disabled,
	onOpenPadre,
	onOpenMadre,
	onClearPadre,
	onClearMadre,
}: GanadoLinajeFieldsProps) {
	return (
		<fieldset className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
			<legend className="px-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
				<GitBranch className="size-4 text-primary" />
				Linaje (Padre y Madre - opcional)
			</legend>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<LinajeSelectorBox
					label="Padre (MACHO)"
					sexoBadge="MACHO"
					seleccionado={padreSeleccionado}
					emptyLabel="Sin padre seleccionado"
					clearLabel="Quitar padre"
					getImagenUrl={getImagenUrl}
					disabled={disabled}
					onOpen={onOpenPadre}
					onClear={onClearPadre}
				/>
				<LinajeSelectorBox
					label="Madre (HEMBRA)"
					sexoBadge="HEMBRA"
					seleccionado={madreSeleccionada}
					emptyLabel="Sin madre seleccionada"
					clearLabel="Quitar madre"
					getImagenUrl={getImagenUrl}
					disabled={disabled}
					onOpen={onOpenMadre}
					onClear={onClearMadre}
				/>
			</div>
		</fieldset>
	);
}

interface LinajeSelectorBoxProps {
	label: string;
	sexoBadge: "MACHO" | "HEMBRA";
	seleccionado: GanadoDto | null;
	emptyLabel: string;
	clearLabel: string;
	getImagenUrl: (path: string | null) => string | null;
	disabled: boolean;
	onOpen: () => void;
	onClear: () => void;
}

function LinajeSelectorBox({
	label,
	sexoBadge,
	seleccionado,
	emptyLabel,
	clearLabel,
	getImagenUrl,
	disabled,
	onOpen,
	onClear,
}: LinajeSelectorBoxProps) {
	const imgUrl = seleccionado ? getImagenUrl(seleccionado.imagenGanado) : null;
	return (
		<div className="space-y-2 text-left">
			<Label>{label}</Label>
			<div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
				{seleccionado ? (
					<div className="flex items-center gap-2.5 flex-1 min-w-0">
						<div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-border shrink-0">
							{imgUrl ? (
								<img
									src={imgUrl}
									alt={seleccionado.identificador}
									className="size-full object-cover"
								/>
							) : (
								<UserCheck className="size-4" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-bold text-foreground truncate">
								{seleccionado.identificador}
							</p>
							<Badge
								variant={sexoBadge === "MACHO" ? "outline" : "secondary"}
								className="text-[10px] px-1 py-0"
							>
								{sexoBadge}
							</Badge>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={clearLabel}
							className="size-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
							onClick={onClear}
							disabled={disabled}
						>
							<X className="size-3.5" />
						</Button>
					</div>
				) : (
					<span className="text-xs text-muted-foreground flex-1">
						{emptyLabel}
					</span>
				)}
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5 cursor-pointer text-xs h-8 shrink-0"
					onClick={onOpen}
					disabled={disabled}
				>
					<Search className="size-3" />
					{seleccionado ? "Cambiar" : "Seleccionar"}
				</Button>
			</div>
		</div>
	);
}

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEliminarVeterinario } from "@/modules/veterinario/hooks/useEliminarVeterinario";
import { formatApiError } from "@/lib/utils";
import { useState } from "react";

interface EliminarVeterinarioDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	veterinarioId: number;
	veterinarioNombre: string;
}

export function EliminarVeterinarioDialog({
	open,
	onOpenChange,
	veterinarioId,
	veterinarioNombre,
}: EliminarVeterinarioDialogProps) {
	const { mutate: eliminar, isPending } = useEliminarVeterinario();
	const [apiError, setApiError] = useState<string | null>(null);

	function handleConfirm() {
		setApiError(null);
		eliminar(veterinarioId, {
			onSuccess: () => {
				onOpenChange(false);
			},
			// biome-ignore lint/suspicious/noExplicitAny: error cast needed for API error extraction
			onError: (error: any) => {
				setApiError(formatApiError(error));
			},
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar veterinario?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción marcará al veterinario{" "}
						<span className="font-semibold text-foreground">
							{veterinarioNombre}
						</span>{" "}
						como inactivo en el sistema (Soft Delete).
					</AlertDialogDescription>
				</AlertDialogHeader>

				{apiError && (
					<p className="text-sm text-red-700 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 dark:text-red-400 dark:bg-red-500/15">
						{apiError}
					</p>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
					>
						{isPending ? "Eliminando..." : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

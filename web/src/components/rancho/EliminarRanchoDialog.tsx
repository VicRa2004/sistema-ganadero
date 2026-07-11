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
import { useEliminarRancho } from "@/modules/rancho/hooks/useEliminarRancho";
import { formatApiError } from "@/lib/utils";
import { useState } from "react";

interface EliminarRanchoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ranchoId: number;
	ranchoNombre: string;
}

export function EliminarRanchoDialog({
	open,
	onOpenChange,
	ranchoId,
	ranchoNombre,
}: EliminarRanchoDialogProps) {
	const { mutate: eliminar, isPending } = useEliminarRancho();
	const [apiError, setApiError] = useState<string | null>(null);

	function handleConfirm() {
		setApiError(null);
		eliminar(ranchoId, {
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
			<AlertDialogContent className="animate-fade-in">
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar rancho?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer. El rancho{" "}
						<span className="font-semibold text-foreground">
							{ranchoNombre}
						</span>{" "}
						será eliminado permanentemente del sistema. Asegúrate de que no
						tenga ganado asignado antes de continuar.
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

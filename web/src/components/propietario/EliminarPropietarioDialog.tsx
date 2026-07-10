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
import { useEliminarPropietario } from "@/modules/propietario/hooks/useEliminarPropietario";
import { formatApiError } from "@/lib/utils";
import { useState } from "react";

interface EliminarPropietarioDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	propietarioId: number;
	propietarioNombre: string;
}

export function EliminarPropietarioDialog({
	open,
	onOpenChange,
	propietarioId,
	propietarioNombre,
}: EliminarPropietarioDialogProps) {
	const { mutate: eliminar, isPending } = useEliminarPropietario();
	const [apiError, setApiError] = useState<string | null>(null);

	function handleConfirm() {
		setApiError(null);
		eliminar(propietarioId, {
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
					<AlertDialogTitle>¿Eliminar propietario?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer. El propietario{" "}
						<span className="font-semibold text-foreground">
							{propietarioNombre}
						</span>{" "}
						será eliminado permanentemente del sistema.
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
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Eliminando..." : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

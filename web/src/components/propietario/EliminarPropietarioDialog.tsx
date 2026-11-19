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

	function handleConfirm() {
		eliminar(propietarioId, {
			onSuccess: () => {
				onOpenChange(false);
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

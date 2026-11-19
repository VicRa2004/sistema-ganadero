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
import { useEliminarTerreno } from "@/modules/terreno/hooks/useEliminarTerreno";

interface EliminarTerrenoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	terrenoId: number;
	terrenoNombre: string;
}

export function EliminarTerrenoDialog({
	open,
	onOpenChange,
	terrenoId,
	terrenoNombre,
}: EliminarTerrenoDialogProps) {
	const { mutate: eliminar, isPending } = useEliminarTerreno();

	function handleConfirm() {
		eliminar(terrenoId, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="animate-fade-in">
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar terreno?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer. El terreno{" "}
						<span className="font-semibold text-foreground">
							{terrenoNombre}
						</span>{" "}
						será eliminado permanentemente del sistema. Asegúrate de que no
						tenga ganado asignado antes de continuar.
					</AlertDialogDescription>
				</AlertDialogHeader>

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

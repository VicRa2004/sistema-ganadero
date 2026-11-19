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

	function handleConfirm() {
		eliminar(veterinarioId, {
			onSuccess: () => {
				onOpenChange(false);
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

import type { ReactNode } from "react";
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

interface ConfirmarDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	titulo: string;
	descripcion: ReactNode;
	onConfirm: () => void;
	isPending: boolean;
	/** Texto del botón de confirmación */
	accion?: string;
}

export function ConfirmarDialog({
	open,
	onOpenChange,
	titulo,
	descripcion,
	onConfirm,
	isPending,
	accion = "Eliminar",
}: ConfirmarDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{titulo}</AlertDialogTitle>
					<AlertDialogDescription>{descripcion}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
					>
						{isPending ? "Procesando..." : accion}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

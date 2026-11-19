import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useEliminarGanado } from "@/modules/ganado/hooks/useEliminarGanado";

interface EliminarGanadoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ganadoId: number;
	arete: string;
	onDeleted?: () => void;
}

export function EliminarGanadoDialog({
	open,
	onOpenChange,
	ganadoId,
	arete,
	onDeleted,
}: EliminarGanadoDialogProps) {
	const { mutate: eliminar, isPending } = useEliminarGanado();

	const handleEliminar = () => {
		eliminar(ganadoId, {
			onSuccess: () => {
				onOpenChange(false);
				onDeleted?.();
			},
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-md animate-fade-in">
				<DialogHeader>
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mb-4 shrink-0">
						<AlertTriangle className="h-6 w-6" />
					</div>
					<DialogTitle className="text-xl font-bold text-center">
						¿Eliminar Ganado?
					</DialogTitle>
					<DialogDescription className="text-center">
						¿Estás seguro de que deseas eliminar permanentemente el ganado con
						arete <span className="font-semibold text-foreground">{arete}</span>
						? Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="sm:justify-center gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleEliminar}
						disabled={isPending}
						className="min-w-[120px]"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Eliminando...
							</>
						) : (
							"Eliminar"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

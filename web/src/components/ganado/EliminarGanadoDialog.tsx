import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { formatApiError } from "@/lib/utils";
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
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: eliminar, isPending } = useEliminarGanado();

	const handleEliminar = () => {
		setApiError(null);
		eliminar(ganadoId, {
			onSuccess: () => {
				onOpenChange(false);
				if (onDeleted) {
					onDeleted();
				}
			},
			onError: (error) => {
				setApiError(formatApiError(error));
			},
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					setApiError(null);
					onOpenChange(nextOpen);
				}
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

				{apiError && (
					<div className="p-3 text-sm text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15 rounded-lg border border-red-500/30 font-medium">
						{apiError}
					</div>
				)}

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

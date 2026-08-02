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
import { useEliminarInsumo } from "@/modules/inventario-insumos/hooks/useEliminarInsumo";
import type { InsumoDto } from "@/modules/inventario-insumos/types";

interface EliminarInsumoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	insumo: InsumoDto;
}

export function EliminarInsumoDialog({
	open,
	onOpenChange,
	insumo,
}: EliminarInsumoDialogProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const { mutate: eliminar, isPending } = useEliminarInsumo();

	const handleConfirmar = () => {
		setApiError(null);
		eliminar(insumo.id, {
			onSuccess: () => {
				onOpenChange(false);
			},
			// biome-ignore lint/suspicious/noExplicitAny: error cast for API error extraction
			onError: (error: any) => {
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Confirmar Eliminación
					</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas eliminar el insumo{" "}
						<strong className="text-foreground">{insumo.nombre}</strong> (Lote:{" "}
						{insumo.lote})? Esta acción realizará un borrado lógico del producto
						en el inventario.
					</DialogDescription>
				</DialogHeader>

				{apiError && (
					<div className="p-3 text-sm text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15 rounded-lg border border-red-500/30 font-medium">
						{apiError}
					</div>
				)}

				<DialogFooter className="pt-2">
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
						onClick={handleConfirmar}
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

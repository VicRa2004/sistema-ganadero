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
	const { mutate: eliminar, isPending } = useEliminarInsumo();

	const handleConfirmar = () => {
		eliminar(insumo.id, {
			onSuccess: () => {
				onOpenChange(false);
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
							"Eliminar Insumo"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

import { Loader2, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePesajeMasivoLote } from "@/modules/lote/hooks/useLotes";
import type { LoteMiembroInfo } from "@/modules/lote/types";

interface PesajeMasivoDialogProps {
	loteId: number;
	miembros: LoteMiembroInfo[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PesajeMasivoDialog({
	loteId,
	miembros,
	open,
	onOpenChange,
}: PesajeMasivoDialogProps) {
	const [fecha, setFecha] = useState(
		new Date().toISOString().split("T")[0] ?? "",
	);
	const [pesos, setPesos] = useState<Record<number, string>>({});
	const { mutate: pesajeMasivo, isPending } = usePesajeMasivoLote(loteId);

	useEffect(() => {
		if (!open) return;
		const map: Record<number, string> = {};
		for (const m of miembros) {
			map[m.ganadoId] = String(m.peso);
		}
		setPesos(map);
	}, [open, miembros]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const items = miembros
			.map((m) => ({
				ganadoId: m.ganadoId,
				peso: Number(pesos[m.ganadoId] ?? ""),
			}))
			.filter((i) => Number.isFinite(i.peso) && i.peso > 0);

		if (items.length === 0) {
			toast.error("Debes capturar al menos un peso válido mayor a 0.");
			return;
		}
		pesajeMasivo(
			{ fecha: fecha || undefined, items },
			{ onSuccess: () => onOpenChange(false) },
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Scale className="size-5 text-emerald-600" />
						Pesaje Masivo del Lote
					</DialogTitle>
					<DialogDescription>
						Actualiza el peso de cada miembro activo en una sola operación.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 text-left">
					<div className="space-y-1.5">
						<Label htmlFor="pesaje-lote-fecha">Fecha del pesaje</Label>
						<Input
							id="pesaje-lote-fecha"
							type="date"
							value={fecha}
							onChange={(e) => setFecha(e.target.value)}
							disabled={isPending}
						/>
					</div>

					<div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-2.5">
						{miembros.map((m) => (
							<div
								key={m.ganadoId}
								className="flex items-center justify-between gap-3"
							>
								<Label
									htmlFor={`peso-miembro-${m.ganadoId}`}
									className="text-xs font-semibold flex-1"
								>
									{m.identificador}{" "}
									<span className="font-normal text-muted-foreground">
										(actual: {m.peso} kg)
									</span>
								</Label>
								<Input
									id={`peso-miembro-${m.ganadoId}`}
									type="number"
									allowDecimals={true}
									value={pesos[m.ganadoId] ?? ""}
									onChange={(e) =>
										setPesos((prev) => ({
											...prev,
											[m.ganadoId]: e.target.value,
										}))
									}
									className="w-28 h-8 text-xs"
									disabled={isPending}
								/>
							</div>
						))}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
							Guardar pesaje masivo
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import { useState } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ganadoService } from "@/modules/ganado/services/ganadoService";
import {
	useConfirmarImportacionGanado,
	usePrevisualizarImportacionGanado,
} from "@/modules/ganado/hooks/useImportarGanado";
import type { PrevisualizacionImportacionGanadoDto } from "@/modules/ganado/types";

interface ImportarGanadoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ImportarGanadoDialog({
	open,
	onOpenChange,
}: ImportarGanadoDialogProps) {
	const [csvContent, setCsvContent] = useState("");
	const [fileName, setFileName] = useState<string | null>(null);
	const [preview, setPreview] =
		useState<PrevisualizacionImportacionGanadoDto | null>(null);

	const previsualizarMutation = usePrevisualizarImportacionGanado();
	const confirmarMutation = useConfirmarImportacionGanado();

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setPreview(null);
		setFileName(file.name);
		const text = await file.text();
		setCsvContent(text);
		previsualizarMutation.mutate(text, {
			onSuccess: (data) => setPreview(data),
		});
	};

	const handleConfirmar = () => {
		if (!csvContent) return;
		confirmarMutation.mutate(csvContent, {
			onSuccess: () => {
				setCsvContent("");
				setFileName(null);
				setPreview(null);
				onOpenChange(false);
			},
		});
	};

	const resetAndClose = (next: boolean) => {
		if (!confirmarMutation.isPending && !previsualizarMutation.isPending) {
			if (!next) {
				setPreview(null);
				setFileName(null);
				setCsvContent("");
			}
			onOpenChange(next);
		}
	};

	return (
		<Dialog open={open} onOpenChange={resetAndClose}>
			<DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg">
						<FileSpreadsheet className="h-5 w-5 text-primary" />
						Importar Ganado desde CSV
					</DialogTitle>
					<DialogDescription>
						Descarga la plantilla, carga tu archivo CSV, verifica la vista
						previa y confirma la importación.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-y-auto py-1">
					<div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-border bg-muted/30">
						<div className="text-xs text-muted-foreground text-left">
							Columnas requeridas:{" "}
							<span className="font-mono text-foreground">
								identificador, sexo, peso, fechaNacimiento, raza, terreno,
								propietario
							</span>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => ganadoService.descargarPlantillaCsv()}
							className="gap-1.5 cursor-pointer text-xs shrink-0"
						>
							<Download className="h-3.5 w-3.5" />
							Descargar plantilla
						</Button>
					</div>

					<label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/40 cursor-pointer transition-colors">
						<Upload className="h-6 w-6 text-primary" />
						<span className="text-sm font-medium text-foreground">
							{fileName
								? `Archivo seleccionado: ${fileName}`
								: "Seleccionar archivo .csv"}
						</span>
						<span className="text-xs text-muted-foreground">
							Se validará fila por fila antes de insertar registros
						</span>
						<input
							type="file"
							accept=".csv,text/csv"
							onChange={handleFileChange}
							className="hidden"
						/>
					</label>

					{previsualizarMutation.isPending && (
						<div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Validando archivo CSV...
						</div>
					)}

					{preview && (
						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline">Total: {preview.totalFilas}</Badge>
								<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
									Válidas: {preview.validasCount}
								</Badge>
								{preview.erroresCount > 0 && (
									<Badge variant="destructive">
										Con errores: {preview.erroresCount}
									</Badge>
								)}
							</div>

							<div className="overflow-x-auto rounded-lg border border-border max-h-64">
								<table className="w-full text-xs text-left">
									<thead className="bg-muted/60 text-muted-foreground sticky top-0">
										<tr>
											<th className="p-2">Fila</th>
											<th className="p-2">Arete</th>
											<th className="p-2">Sexo / Peso</th>
											<th className="p-2">Raza / Terreno</th>
											<th className="p-2">Estado</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{preview.filas.map((f) => (
											<tr
												key={f.fila}
												className={f.valido ? "" : "bg-red-500/5"}
											>
												<td className="p-2 font-mono">{f.fila}</td>
												<td className="p-2 font-semibold">
													{f.identificador || "-"}
												</td>
												<td className="p-2">
													{f.sexo || "-"} · {f.peso ?? "-"} kg
												</td>
												<td className="p-2">
													{f.raza || "-"} / {f.terreno || "-"}
												</td>
												<td className="p-2">
													{f.valido ? (
														<span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
															<CheckCircle2 className="h-3.5 w-3.5" />
															Válida
														</span>
													) : (
														<span className="inline-flex items-start gap-1 text-red-600 dark:text-red-400">
															<AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
															<span>{f.errores.join("; ")}</span>
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => resetAndClose(false)}
						disabled={confirmarMutation.isPending}
						className="cursor-pointer"
					>
						Cancelar
					</Button>
					<Button
						type="button"
						onClick={handleConfirmar}
						disabled={
							!preview ||
							preview.validasCount === 0 ||
							preview.erroresCount > 0 ||
							confirmarMutation.isPending
						}
						className="cursor-pointer gap-1.5"
					>
						{confirmarMutation.isPending && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Confirmar importación ({preview?.validasCount ?? 0})
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

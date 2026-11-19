import { FileDown, FileText, Loader2, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useObtenerTransaccion } from "@/modules/comercial/hooks/useComercial";
import { comercialService } from "@/modules/comercial/services/comercialService";

interface TransaccionDetalleDialogProps {
	transaccionId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string)?.replace("/api", "") || "";

export function TransaccionDetalleDialog({
	transaccionId,
	open,
	onOpenChange,
}: TransaccionDetalleDialogProps) {
	const { data, isLoading } = useObtenerTransaccion(
		open ? transaccionId : null,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<FileText className="size-5 text-primary" />
						Detalle de Transacción #{transaccionId}
					</DialogTitle>
					<DialogDescription>
						Comprobante comercial e información por animal involucrado.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Cargando comprobante...
					</div>
				) : !data ? (
					<p className="text-sm text-muted-foreground py-6 text-center">
						No se encontró la transacción.
					</p>
				) : (
					<div className="space-y-4 text-left text-sm">
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-muted/20 p-3">
							<div>
								<p className="text-xs text-muted-foreground">Tipo</p>
								<Badge
									variant={data.tipo === "VENTA" ? "default" : "secondary"}
								>
									{data.tipo}
								</Badge>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Fecha</p>
								<p className="font-semibold">
									{new Date(data.fecha).toLocaleDateString("es-MX")}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Contraparte</p>
								<p className="font-semibold">{data.contraparte}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Total</p>
								<p className="font-bold tabular-nums">
									${data.total.toFixed(2)} {data.moneda}
								</p>
							</div>
						</div>

						{data.documento && (
							<p className="text-xs text-muted-foreground">
								<strong>Folio / Factura:</strong> {data.documento}
							</p>
						)}
						{data.observaciones && (
							<p className="text-xs text-muted-foreground">
								<strong>Observaciones:</strong> {data.observaciones}
							</p>
						)}

						{data.documentoAdjunto && (
							<a
								href={`${baseApiUrl}${data.documentoAdjunto}`}
								target="_blank"
								rel="noreferrer"
								className={cn(
									buttonVariants({ variant: "outline", size: "sm" }),
									"gap-1.5",
								)}
							>
								<Paperclip className="size-3.5" />
								Ver documento adjunto
							</a>
						)}

						<div className="overflow-x-auto rounded-lg border border-border">
							<table className="w-full text-xs text-left">
								<thead className="bg-muted/50 text-muted-foreground border-b border-border">
									<tr>
										<th className="px-3 py-2">Arete</th>
										<th className="px-3 py-2 text-right">Peso reg.</th>
										<th className="px-3 py-2 text-right">Precio</th>
										<th className="px-3 py-2">Procedencia</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{data.detalles.map((d) => (
										<tr key={d.id}>
											<td className="px-3 py-2 font-semibold">
												{d.identificador}
											</td>
											<td className="px-3 py-2 text-right tabular-nums">
												{d.pesoRegistro} kg
											</td>
											<td className="px-3 py-2 text-right tabular-nums font-medium">
												${d.precio.toFixed(2)}
											</td>
											<td className="px-3 py-2 text-muted-foreground">
												{d.procedencia ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				<DialogFooter className="gap-2">
					{data && (
						<Button
							type="button"
							variant="outline"
							onClick={() => comercialService.exportarTransaccionPdf(data.id)}
							className="gap-1.5"
						>
							<FileDown className="size-4" />
							Descargar PDF
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

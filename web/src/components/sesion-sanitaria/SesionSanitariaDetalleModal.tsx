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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Activity,
	Calendar,
	Database,
	Loader2,
	Plus,
	Stethoscope,
	Syringe,
	Tag,
	UserCheck,
	AlertCircle,
} from "lucide-react";
import { useObtenerDetalleSesionSanitaria } from "@/modules/sesion-sanitaria/hooks/useObtenerDetalleSesionSanitaria";
import { useRegistrarResultadoAnimal } from "@/modules/sesion-sanitaria/hooks/useRegistrarResultadoAnimal";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { formatApiError } from "@/lib/utils";

interface SesionSanitariaDetalleModalProps {
	sesionId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SesionSanitariaDetalleModal({
	sesionId,
	open,
	onOpenChange,
}: SesionSanitariaDetalleModalProps) {
	const [agregarAnimalOpen, setAgregarAnimalOpen] = useState(false);
	const [ganadoIdInput, setGanadoIdInput] = useState<string>("");
	const [dosisInput, setDosisInput] = useState<string>("1");
	const [observacionesInput, setObservacionesInput] = useState<string>("");
	const [apiError, setApiError] = useState<string | null>(null);

	const { data: sesion, isLoading } = useObtenerDetalleSesionSanitaria(
		open ? sesionId : null,
	);
	const { data: ganadosData } = useListarGanado(
		{ page: 1, limit: 100, soloActivos: true },
		agregarAnimalOpen,
	);
	const registrarResultadoMutation = useRegistrarResultadoAnimal();

	const handleAgregarResultado = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!sesionId || !ganadoIdInput) return;
		setApiError(null);

		try {
			await registrarResultadoMutation.mutateAsync({
				sesionId,
				ganadoId: Number(ganadoIdInput),
				dosisAplicada: Number(dosisInput),
				observaciones: observacionesInput || undefined,
			});
			setAgregarAnimalOpen(false);
			setGanadoIdInput("");
			setDosisInput("1");
			setObservacionesInput("");
		} catch (err) {
			setApiError(formatApiError(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-6 gap-4">
				<DialogHeader className="space-y-1 text-left border-b border-border pb-3">
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						<Activity className="size-5 text-primary" />
						Ficha de Sesión Sanitaria #{sesionId}
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Detalles de la jornada médica masiva e historial de dosis
						individuales aplicadas al ganado.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
						<Loader2 className="size-7 animate-spin text-primary" />
						<span>Cargando detalle de la sesión...</span>
					</div>
				) : !sesion ? (
					<div className="text-center py-12 text-muted-foreground">
						No se encontró información para esta sesión.
					</div>
				) : (
					<div className="flex-1 overflow-y-auto space-y-5 pr-1">
						{/* Tarjeta de Resumen */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-4 rounded-xl border border-border text-xs">
							<div>
								<span className="text-muted-foreground flex items-center gap-1 font-medium">
									<Calendar className="size-3.5 text-primary" /> Fecha:
								</span>
								<p className="font-bold text-sm text-foreground mt-0.5">
									{new Date(sesion.fecha).toLocaleDateString()}
								</p>
							</div>

							<div>
								<span className="text-muted-foreground flex items-center gap-1 font-medium">
									<UserCheck className="size-3.5 text-primary" /> Veterinario:
								</span>
								<p className="font-bold text-sm text-foreground mt-0.5 truncate">
									{sesion.nombreVeterinario || `ID: ${sesion.veterinarioId}`}
								</p>
							</div>

							<div>
								<span className="text-muted-foreground flex items-center gap-1 font-medium">
									<Database className="size-3.5 text-primary" /> Insumo:
								</span>
								<p className="font-bold text-sm text-foreground mt-0.5 truncate">
									{sesion.nombreInsumo || `ID: ${sesion.insumoId}`}
								</p>
							</div>

							<div>
								<span className="text-muted-foreground flex items-center gap-1 font-medium">
									<Syringe className="size-3.5 text-primary" /> Dosis
									Consumidas:
								</span>
								<p className="font-bold text-sm text-foreground mt-0.5">
									{sesion.totalDosisAplicadas}{" "}
									{sesion.unidadMedidaInsumo || "dosis"}
								</p>
							</div>

							<div className="col-span-2 md:col-span-4 pt-2 border-t border-border/50">
								<span className="text-muted-foreground flex items-center gap-1 font-medium">
									<Stethoscope className="size-3.5 text-primary" /> Descripción
									/ Motivo:
								</span>
								<p className="text-sm font-semibold text-foreground mt-0.5">
									{sesion.descripcion}
								</p>
							</div>
						</div>

						{/* Tabla de aplicaciones por animal */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-bold flex items-center gap-2">
									<Tag className="size-4 text-primary" />
									Registros Individuales ({sesion.aplicaciones.length} Animales)
								</h4>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => setAgregarAnimalOpen(!agregarAnimalOpen)}
									className="h-8 text-xs gap-1.5 cursor-pointer"
								>
									<Plus className="size-3.5" />
									Añadir Animal a la Sesión
								</Button>
							</div>

							{/* Formulario desplegable para añadir animal adicional */}
							{agregarAnimalOpen && (
								<form
									onSubmit={handleAgregarResultado}
									className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 text-xs"
								>
									<h5 className="font-bold text-primary flex items-center gap-1.5">
										<Syringe className="size-3.5" /> Registrar Dosis a Animal
										Adicional
									</h5>

									{apiError && (
										<div className="p-2 rounded bg-red-500/10 text-red-600 text-xs flex items-center gap-1.5">
											<AlertCircle className="size-3.5 shrink-0" />
											<span>{apiError}</span>
										</div>
									)}

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div>
											<label
												htmlFor="det-select-ganado"
												className="font-semibold block mb-1"
											>
												Animal de Ganado:
											</label>
											<select
												id="det-select-ganado"
												value={ganadoIdInput}
												onChange={(e) => setGanadoIdInput(e.target.value)}
												className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
												required
											>
												<option value="">Seleccionar Ganado...</option>
												{(ganadosData?.data ?? []).map((g) => (
													<option key={g.id} value={g.id}>
														{g.identificador} ({g.peso} kg)
													</option>
												))}
											</select>
										</div>

										<div>
											<label
												htmlFor="det-input-dosis"
												className="font-semibold block mb-1"
											>
												Dosis ({sesion.unidadMedidaInsumo || "dosis"}):
											</label>
											<Input
												id="det-input-dosis"
												type="number"
												allowDecimals={true}
												value={dosisInput}
												onChange={(e) => setDosisInput(e.target.value)}
												className="h-8 text-xs"
												required
											/>
										</div>

										<div>
											<label
												htmlFor="det-input-obs"
												className="font-semibold block mb-1"
											>
												Observaciones / Reacción:
											</label>
											<Input
												id="det-input-obs"
												type="text"
												placeholder="Ej: Ninguna, Alergia leve"
												value={observacionesInput}
												onChange={(e) => setObservacionesInput(e.target.value)}
												className="h-8 text-xs"
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-1">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => setAgregarAnimalOpen(false)}
											className="h-7 text-xs cursor-pointer"
										>
											Cancelar
										</Button>
										<Button
											type="submit"
											size="sm"
											disabled={registrarResultadoMutation.isPending}
											className="h-7 text-xs cursor-pointer gap-1"
										>
											{registrarResultadoMutation.isPending && (
												<Loader2 className="size-3 animate-spin" />
											)}
											Guardar Aplicación
										</Button>
									</div>
								</form>
							)}

							<div className="border border-border rounded-xl overflow-hidden">
								<table className="w-full text-left text-xs">
									<thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
										<tr>
											<th className="p-3">Ganado / Arete</th>
											<th className="p-3">Dosis Aplicada</th>
											<th className="p-3">Observaciones</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{sesion.aplicaciones.length === 0 ? (
											<tr>
												<td
													colSpan={3}
													className="p-8 text-center text-muted-foreground"
												>
													No hay registros individuales en esta sesión.
												</td>
											</tr>
										) : (
											sesion.aplicaciones.map((app) => (
												<tr key={app.id} className="hover:bg-muted/20">
													<td className="p-3 font-bold text-foreground">
														<Badge variant="outline" className="text-xs">
															{app.identificadorGanado || `ID: ${app.ganadoId}`}
														</Badge>
													</td>
													<td className="p-3 font-semibold">
														{app.dosisAplicada}{" "}
														{sesion.unidadMedidaInsumo || "dosis"}
													</td>
													<td className="p-3 text-muted-foreground">
														{app.observaciones || "Sin observaciones"}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				<DialogFooter className="pt-2 border-t border-border flex justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="cursor-pointer"
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

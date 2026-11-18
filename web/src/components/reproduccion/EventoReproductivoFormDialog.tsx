import { useState, useEffect } from "react";
import { Baby, Plus, Trash2 } from "lucide-react";
import { GanadoSelectorModal } from "@/components/ganado/GanadoSelectorModal";
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
import type { GanadoDto, SexoGanado } from "@/modules/ganado/types";
import { useRegistrarEventoReproductivo } from "@/modules/reproduccion/hooks/useReproduccion";
import {
	TIPO_EVENTO_LABELS,
	type ResultadoDiagnostico,
	type TipoEventoReproductivo,
} from "@/modules/reproduccion/types";

const SELECT_CLASS =
	"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface CriaDraft {
	key: string;
	identificador: string;
	sexo: SexoGanado;
	peso: string;
}

interface EventoReproductivoFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	hembraInicial?: { id: number; identificador: string } | null;
}

export function EventoReproductivoFormDialog({
	open,
	onOpenChange,
	hembraInicial = null,
}: EventoReproductivoFormDialogProps) {
	const registrar = useRegistrarEventoReproductivo();

	const [hembra, setHembra] = useState<{
		id: number;
		identificador: string;
	} | null>(hembraInicial);
	const [macho, setMacho] = useState<{
		id: number;
		identificador: string;
	} | null>(null);
	const [tipo, setTipo] = useState<TipoEventoReproductivo>("MONTA");
	const [fecha, setFecha] = useState(
		() => new Date().toISOString().split("T")[0] ?? "",
	);
	const [resultado, setResultado] = useState<ResultadoDiagnostico>("POSITIVO");
	const [observaciones, setObservaciones] = useState("");
	const [crias, setCrias] = useState<CriaDraft[]>([]);
	const [formError, setFormError] = useState<string | null>(null);

	const [selectorTipo, setSelectorTipo] = useState<"HEMBRA" | "MACHO" | null>(
		null,
	);

	useEffect(() => {
		if (open) {
			setHembra(hembraInicial);
			setMacho(null);
			setTipo("MONTA");
			setFecha(new Date().toISOString().split("T")[0] ?? "");
			setResultado("POSITIVO");
			setObservaciones("");
			setCrias([]);
			setFormError(null);
		}
	}, [open, hembraInicial]);

	const handleSelectGanado = (g: GanadoDto | null) => {
		if (selectorTipo === "HEMBRA") {
			setHembra(g ? { id: g.id, identificador: g.identificador } : null);
		} else if (selectorTipo === "MACHO") {
			setMacho(g ? { id: g.id, identificador: g.identificador } : null);
		}
		setSelectorTipo(null);
	};

	const agregarCria = () => {
		setCrias((prev) => [
			...prev,
			{
				key: crypto.randomUUID(),
				identificador: "",
				sexo: "HEMBRA",
				peso: "",
			},
		]);
	};

	const actualizarCria = (
		key: string,
		campo: keyof Omit<CriaDraft, "key">,
		valor: string,
	) => {
		setCrias((prev) =>
			prev.map((c) => (c.key === key ? { ...c, [campo]: valor } : c)),
		);
	};

	const quitarCria = (key: string) => {
		setCrias((prev) => prev.filter((c) => c.key !== key));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!hembra) {
			setFormError("Selecciona la hembra del evento.");
			return;
		}
		if (!fecha) {
			setFormError("Indica la fecha del evento.");
			return;
		}

		const criasPayload =
			tipo === "PARTO"
				? crias.map((c) => ({
						identificador: c.identificador.trim(),
						sexo: c.sexo,
						peso: Number(c.peso),
					}))
				: undefined;

		if (criasPayload) {
			for (const c of criasPayload) {
				if (!c.identificador) {
					setFormError("Cada cría debe tener un arete/identificador.");
					return;
				}
				if (Number.isNaN(c.peso) || c.peso <= 0 || c.peso > 500) {
					setFormError(
						"El peso de cada cría debe ser mayor a 0 y hasta 500 kg.",
					);
					return;
				}
			}
		}

		try {
			await registrar.mutateAsync({
				hembraId: hembra.id,
				machoId: macho ? macho.id : null,
				tipo,
				fecha,
				resultado: tipo === "DIAGNOSTICO_GESTACION" ? resultado : null,
				observaciones: observaciones.trim() || null,
				crias: criasPayload,
			});
			onOpenChange(false);
		} catch {
			// El toast global muestra el error del backend
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Registrar evento reproductivo</DialogTitle>
						<DialogDescription>
							Registra montas, inseminaciones, diagnósticos, partos, destetes o
							abortos.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-1.5">
								<Label>Tipo de evento</Label>
								<select
									value={tipo}
									onChange={(e) =>
										setTipo(e.target.value as TipoEventoReproductivo)
									}
									className={SELECT_CLASS}
								>
									{(
										Object.keys(TIPO_EVENTO_LABELS) as TipoEventoReproductivo[]
									).map((t) => (
										<option key={t} value={t}>
											{TIPO_EVENTO_LABELS[t]}
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label>Hembra *</Label>
									<div className="flex items-center gap-2">
										<Input
											readOnly
											value={hembra ? hembra.identificador : ""}
											placeholder="Seleccionar hembra"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setSelectorTipo("HEMBRA")}
										>
											Elegir
										</Button>
									</div>
								</div>

								<div className="space-y-1.5">
									<Label>Fecha *</Label>
									<Input
										type="date"
										value={fecha}
										max={new Date().toISOString().split("T")[0]}
										onChange={(e) => setFecha(e.target.value)}
										required
									/>
								</div>
							</div>

							{(tipo === "MONTA" ||
								tipo === "INSEMINACION" ||
								tipo === "PARTO") && (
								<div className="space-y-1.5">
									<Label>Macho / Semental (opcional)</Label>
									<div className="flex items-center gap-2">
										<Input
											readOnly
											value={macho ? macho.identificador : ""}
											placeholder="Sin macho especificado"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setSelectorTipo("MACHO")}
										>
											Elegir
										</Button>
										{macho && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setMacho(null)}
											>
												Limpiar
											</Button>
										)}
									</div>
								</div>
							)}

							{tipo === "DIAGNOSTICO_GESTACION" && (
								<div className="space-y-1.5">
									<Label>Resultado del diagnóstico *</Label>
									<select
										value={resultado}
										onChange={(e) =>
											setResultado(e.target.value as ResultadoDiagnostico)
										}
										className={SELECT_CLASS}
									>
										<option value="POSITIVO">Positivo (gestante)</option>
										<option value="NEGATIVO">Negativo (vacía)</option>
									</select>
								</div>
							)}

							{tipo === "PARTO" && (
								<div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<Baby className="size-4 text-primary" />
											<span className="text-sm font-semibold">
												Registrar cría(s) nacida(s) (opcional)
											</span>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={agregarCria}
										>
											<Plus className="size-3.5 mr-1" />
											Añadir cría
										</Button>
									</div>

									{crias.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											Puedes guardar el parto sin crías o añadir una o más crías
											para crearlas automáticamente con su padre y madre.
										</p>
									) : (
										<div className="space-y-3">
											{crias.map((cria, index) => (
												<div
													key={cria.key}
													className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end rounded-md border border-border bg-background p-2.5"
												>
													<div className="sm:col-span-5 space-y-1">
														<Label className="text-xs">
															Arete cría #{index + 1}
														</Label>
														<Input
															value={cria.identificador}
															onChange={(e) =>
																actualizarCria(
																	cria.key,
																	"identificador",
																	e.target.value,
																)
															}
															placeholder="Ej. BOV-2026-01"
														/>
													</div>
													<div className="sm:col-span-3 space-y-1">
														<Label className="text-xs">Sexo</Label>
														<select
															value={cria.sexo}
															onChange={(e) =>
																actualizarCria(cria.key, "sexo", e.target.value)
															}
															className={SELECT_CLASS}
														>
															<option value="HEMBRA">HEMBRA</option>
															<option value="MACHO">MACHO</option>
														</select>
													</div>
													<div className="sm:col-span-3 space-y-1">
														<Label className="text-xs">Peso (kg)</Label>
														<Input
															type="number"
															allowDecimals={true}
															step="0.1"
															min="1"
															max="500"
															value={cria.peso}
															onChange={(e) =>
																actualizarCria(cria.key, "peso", e.target.value)
															}
															placeholder="35"
														/>
													</div>
													<div className="sm:col-span-1 flex justify-end">
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															aria-label="Quitar cría"
															onClick={() => quitarCria(cria.key)}
														>
															<Trash2 className="size-4 text-destructive" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							<div className="space-y-1.5">
								<Label>Observaciones</Label>
								<textarea
									value={observaciones}
									onChange={(e) => setObservaciones(e.target.value)}
									placeholder="Notas clínicas, pajilla, condición corporal..."
									rows={2}
									className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								/>
							</div>
						</div>

						{formError && (
							<p className="text-sm font-medium text-destructive">
								{formError}
							</p>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={registrar.isPending}>
								{registrar.isPending ? "Guardando..." : "Guardar evento"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{selectorTipo && (
				<GanadoSelectorModal
					open={true}
					onOpenChange={(v) => {
						if (!v) setSelectorTipo(null);
					}}
					title={
						selectorTipo === "HEMBRA"
							? "Seleccionar hembra"
							: "Seleccionar macho"
					}
					defaultSexo={selectorTipo}
					selectedId={selectorTipo === "HEMBRA" ? hembra?.id : macho?.id}
					onSelect={handleSelectGanado}
				/>
			)}
		</>
	);
}

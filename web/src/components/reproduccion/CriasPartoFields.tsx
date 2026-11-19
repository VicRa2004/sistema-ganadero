import { Baby, Plus, Trash2 } from "lucide-react";
import { SELECT_FIELD_CLASS } from "@/components/CampoSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SexoGanado } from "@/modules/ganado/types";

export interface CriaDraft {
	key: string;
	identificador: string;
	sexo: SexoGanado;
	peso: string;
}

interface CriasPartoFieldsProps {
	crias: CriaDraft[];
	onAgregar: () => void;
	onActualizar: (
		key: string,
		campo: keyof Omit<CriaDraft, "key">,
		valor: string,
	) => void;
	onQuitar: (key: string) => void;
}

export function CriasPartoFields({
	crias,
	onAgregar,
	onActualizar,
	onQuitar,
}: CriasPartoFieldsProps) {
	return (
		<div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Baby className="size-4 text-primary" />
					<span className="text-sm font-semibold">
						Registrar cría(s) nacida(s) (opcional)
					</span>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={onAgregar}>
					<Plus className="size-3.5 mr-1" />
					Añadir cría
				</Button>
			</div>

			{crias.length === 0 ? (
				<p className="text-xs text-muted-foreground">
					Puedes guardar el parto sin crías o añadir una o más crías para
					crearlas automáticamente con su padre y madre.
				</p>
			) : (
				<div className="space-y-3">
					{crias.map((cria, index) => (
						<div
							key={cria.key}
							className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end rounded-md border border-border bg-background p-2.5"
						>
							<div className="sm:col-span-5 space-y-1">
								<Label htmlFor={`cria-id-${cria.key}`} className="text-xs">
									Arete cría #{index + 1}
								</Label>
								<Input
									id={`cria-id-${cria.key}`}
									value={cria.identificador}
									onChange={(e) =>
										onActualizar(cria.key, "identificador", e.target.value)
									}
									placeholder="Ej. BOV-2026-01"
								/>
							</div>
							<div className="sm:col-span-3 space-y-1">
								<Label htmlFor={`cria-sexo-${cria.key}`} className="text-xs">
									Sexo
								</Label>
								<select
									id={`cria-sexo-${cria.key}`}
									value={cria.sexo}
									onChange={(e) =>
										onActualizar(cria.key, "sexo", e.target.value)
									}
									className={SELECT_FIELD_CLASS}
								>
									<option value="HEMBRA">HEMBRA</option>
									<option value="MACHO">MACHO</option>
								</select>
							</div>
							<div className="sm:col-span-3 space-y-1">
								<Label htmlFor={`cria-peso-${cria.key}`} className="text-xs">
									Peso (kg)
								</Label>
								<Input
									id={`cria-peso-${cria.key}`}
									type="number"
									allowDecimals={true}
									step="0.1"
									value={cria.peso}
									onChange={(e) =>
										onActualizar(cria.key, "peso", e.target.value)
									}
									placeholder="35"
								/>
							</div>
							<div className="sm:col-span-1 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label={`Quitar cría #${index + 1}`}
									onClick={() => onQuitar(cria.key)}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

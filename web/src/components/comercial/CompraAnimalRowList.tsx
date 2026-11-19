import { Plus, Trash2 } from "lucide-react";
import { SELECT_FIELD_CLASS } from "@/components/CampoSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SexoGanado } from "@/modules/ganado/types";
import type { PropietarioDto } from "@/modules/propietario/types";
import type { RazaDto } from "@/modules/raza/types";
import type { TerrenoDto } from "@/modules/terreno/types";

export interface CompraItemDraft {
	key: string;
	identificador: string;
	peso: string;
	fechaNacimiento: string;
	sexo: SexoGanado;
	razaId: string;
	terrenoId: string;
	propietarioId: string;
	precio: string;
	procedencia: string;
}

interface CompraAnimalRowListProps {
	items: CompraItemDraft[];
	razas: RazaDto[];
	terrenos: TerrenoDto[];
	propietarios: PropietarioDto[];
	disabled: boolean;
	onAgregar: () => void;
	onQuitar: (key: string) => void;
	onActualizar: (
		key: string,
		campo: keyof Omit<CompraItemDraft, "key">,
		valor: string,
	) => void;
}

export function CompraAnimalRowList({
	items,
	razas,
	terrenos,
	propietarios,
	disabled,
	onAgregar,
	onQuitar,
	onActualizar,
}: CompraAnimalRowListProps) {
	const total = items.reduce((acc, i) => acc + (Number(i.precio) || 0), 0);

	return (
		<div className="space-y-2 rounded-lg border border-border bg-muted/10 p-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-semibold">
					Animales adquiridos ({items.length}) · Total: ${total.toFixed(2)}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onAgregar}
					disabled={disabled}
					className="gap-1"
				>
					<Plus className="size-3.5" />
					Añadir animal
				</Button>
			</div>

			<div className="space-y-3 max-h-72 overflow-y-auto pr-1">
				{items.map((item, idx) => (
					<div
						key={item.key}
						className="space-y-2 rounded-lg border border-border bg-background p-2.5"
					>
						<div className="flex items-center justify-between text-xs font-semibold">
							<span>Animal #{idx + 1}</span>
							{items.length > 1 && (
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label={`Quitar animal #${idx + 1}`}
									onClick={() => onQuitar(item.key)}
								>
									<Trash2 className="size-3.5 text-destructive" />
								</Button>
							)}
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							<div>
								<Label htmlFor={`cmp-id-${item.key}`} className="text-[10px]">
									Arete *
								</Label>
								<Input
									id={`cmp-id-${item.key}`}
									value={item.identificador}
									placeholder="AR-COMP-01"
									onChange={(e) =>
										onActualizar(item.key, "identificador", e.target.value)
									}
									className="h-8 text-xs"
									disabled={disabled}
								/>
							</div>
							<div>
								<Label htmlFor={`cmp-peso-${item.key}`} className="text-[10px]">
									Peso (kg) *
								</Label>
								<Input
									id={`cmp-peso-${item.key}`}
									type="number"
									allowDecimals={true}
									value={item.peso}
									onChange={(e) =>
										onActualizar(item.key, "peso", e.target.value)
									}
									className="h-8 text-xs"
									disabled={disabled}
								/>
							</div>
							<div>
								<Label
									htmlFor={`cmp-precio-${item.key}`}
									className="text-[10px]"
								>
									Precio ($) *
								</Label>
								<Input
									id={`cmp-precio-${item.key}`}
									type="number"
									allowDecimals={true}
									value={item.precio}
									onChange={(e) =>
										onActualizar(item.key, "precio", e.target.value)
									}
									className="h-8 text-xs"
									disabled={disabled}
								/>
							</div>
							<div>
								<Label htmlFor={`cmp-sexo-${item.key}`} className="text-[10px]">
									Sexo *
								</Label>
								<select
									id={`cmp-sexo-${item.key}`}
									value={item.sexo}
									onChange={(e) =>
										onActualizar(item.key, "sexo", e.target.value)
									}
									className={`${SELECT_FIELD_CLASS} h-8 text-xs`}
									disabled={disabled}
								>
									<option value="MACHO">MACHO</option>
									<option value="HEMBRA">HEMBRA</option>
								</select>
							</div>
							<div>
								<Label htmlFor={`cmp-fnac-${item.key}`} className="text-[10px]">
									Nacimiento *
								</Label>
								<Input
									id={`cmp-fnac-${item.key}`}
									type="date"
									value={item.fechaNacimiento}
									onChange={(e) =>
										onActualizar(item.key, "fechaNacimiento", e.target.value)
									}
									className="h-8 text-xs"
									disabled={disabled}
								/>
							</div>
							<div>
								<Label htmlFor={`cmp-raza-${item.key}`} className="text-[10px]">
									Raza *
								</Label>
								<select
									id={`cmp-raza-${item.key}`}
									value={item.razaId}
									onChange={(e) =>
										onActualizar(item.key, "razaId", e.target.value)
									}
									className={`${SELECT_FIELD_CLASS} h-8 text-xs`}
									disabled={disabled}
								>
									<option value="">Elegir...</option>
									{razas.map((r) => (
										<option key={r.id} value={r.id}>
											{r.nombre}
										</option>
									))}
								</select>
							</div>
							<div>
								<Label
									htmlFor={`cmp-terreno-${item.key}`}
									className="text-[10px]"
								>
									Terreno *
								</Label>
								<select
									id={`cmp-terreno-${item.key}`}
									value={item.terrenoId}
									onChange={(e) =>
										onActualizar(item.key, "terrenoId", e.target.value)
									}
									className={`${SELECT_FIELD_CLASS} h-8 text-xs`}
									disabled={disabled}
								>
									<option value="">Elegir...</option>
									{terrenos.map((t) => (
										<option key={t.id} value={t.id}>
											{t.nombre}
										</option>
									))}
								</select>
							</div>
							<div>
								<Label htmlFor={`cmp-prop-${item.key}`} className="text-[10px]">
									Propietario *
								</Label>
								<select
									id={`cmp-prop-${item.key}`}
									value={item.propietarioId}
									onChange={(e) =>
										onActualizar(item.key, "propietarioId", e.target.value)
									}
									className={`${SELECT_FIELD_CLASS} h-8 text-xs`}
									disabled={disabled}
								>
									<option value="">Elegir...</option>
									{propietarios.map((p) => (
										<option key={p.id} value={p.id}>
											{p.nombre}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<Label htmlFor={`cmp-proc-${item.key}`} className="text-[10px]">
								Procedencia (opcional)
							</Label>
							<Input
								id={`cmp-proc-${item.key}`}
								value={item.procedencia}
								placeholder="Ej. Rancho El Roble"
								onChange={(e) =>
									onActualizar(item.key, "procedencia", e.target.value)
								}
								className="h-8 text-xs"
								disabled={disabled}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

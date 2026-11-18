import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useCrearPlanSanitario } from "@/modules/sesion-sanitaria/hooks/useCalendarioYPlanes";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import { formatApiError } from "@/lib/utils";

interface PlanSanitarioFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SELECT_CLASS =
	"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer";

export function PlanSanitarioFormDialog({
	open,
	onOpenChange,
}: PlanSanitarioFormDialogProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const crearPlan = useCrearPlanSanitario();

	const { data: vetsData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: razasData = [] } = useListarRazas();

	const insumosSanitarios = (insumosData?.data ?? []).filter((i) =>
		["VACUNA", "MEDICAMENTO"].includes(i.tipo),
	);

	const form = useForm({
		defaultValues: {
			nombre: "",
			descripcion: "",
			frecuenciaDias: "180",
			dosisPorAnimal: "5",
			veterinarioId: "",
			insumoId: "",
			terrenoId: "",
			razaId: "",
			edadMinimaMeses: "",
			proximaEjecucion: new Date().toISOString().slice(0, 10),
		},
		onSubmit: ({ value }) => {
			setApiError(null);
			if (!value.veterinarioId || !value.insumoId) {
				setApiError("Debes seleccionar un veterinario y un insumo.");
				return;
			}
			crearPlan.mutate(
				{
					nombre: value.nombre.trim(),
					descripcion: value.descripcion.trim(),
					frecuenciaDias: Number(value.frecuenciaDias),
					dosisPorAnimal: Number(value.dosisPorAnimal),
					veterinarioId: Number(value.veterinarioId),
					insumoId: Number(value.insumoId),
					terrenoId: value.terrenoId ? Number(value.terrenoId) : null,
					razaId: value.razaId ? Number(value.razaId) : null,
					edadMinimaMeses: value.edadMinimaMeses
						? Number(value.edadMinimaMeses)
						: null,
					proximaEjecucion: new Date(value.proximaEjecucion).toISOString(),
					activo: true,
				},
				{
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
					onError: (err) => setApiError(formatApiError(err)),
				},
			);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Nuevo Plan de Vacunación Recurrente</DialogTitle>
					<DialogDescription>
						Programa jornadas sanitarias automáticas según frecuencia, terreno,
						raza o edad mínima.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{apiError && (
						<div className="p-3 text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg dark:text-red-400">
							{apiError}
						</div>
					)}

					<form.Field name="nombre">
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor="plan-nombre">Nombre del plan *</Label>
								<Input
									id="plan-nombre"
									placeholder="Ej: Vacuna Triple Semestral"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="descripcion">
						{(field) => (
							<div className="space-y-1.5 text-left">
								<Label htmlFor="plan-desc">Descripción *</Label>
								<Input
									id="plan-desc"
									placeholder="Ej: Refuerzo preventivo para lote de engorda"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
						<form.Field name="veterinarioId">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-vet">Veterinario *</Label>
									<select
										id="plan-vet"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
										required
									>
										<option value="">Seleccionar...</option>
										{(vetsData?.data ?? []).map((v) => (
											<option key={v.id} value={v.id}>
												{v.nombre}
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						<form.Field name="insumoId">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-insumo">Vacuna / Medicamento *</Label>
									<select
										id="plan-insumo"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
										required
									>
										<option value="">Seleccionar...</option>
										{insumosSanitarios.map((i) => (
											<option key={i.id} value={i.id}>
												{i.nombre} ({i.unidadMedida})
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
						<form.Field name="frecuenciaDias">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-frec">Frecuencia (días) *</Label>
									<Input
										id="plan-frec"
										type="number"
										allowDecimals={false}
										min="1"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										required
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="dosisPorAnimal">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-dosis">Dosis / animal *</Label>
									<Input
										id="plan-dosis"
										type="number"
										allowDecimals
										min="0.1"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										required
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="proximaEjecucion">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-prox">Próxima fecha *</Label>
									<Input
										id="plan-prox"
										type="date"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										required
									/>
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
						<form.Field name="terrenoId">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-terreno">Terreno (opcional)</Label>
									<select
										id="plan-terreno"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
									>
										<option value="">Todos</option>
										{(terrenosData?.data ?? []).map((t) => (
											<option key={t.id} value={t.id}>
												{t.nombre}
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						<form.Field name="razaId">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-raza">Raza (opcional)</Label>
									<select
										id="plan-raza"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={SELECT_CLASS}
									>
										<option value="">Todas</option>
										{razasData.map((r) => (
											<option key={r.id} value={r.id}>
												{r.nombre}
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						<form.Field name="edadMinimaMeses">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="plan-edad">Edad mín. (meses)</Label>
									<Input
										id="plan-edad"
										type="number"
										allowDecimals={false}
										min="0"
										placeholder="Opcional"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={crearPlan.isPending}
							className="cursor-pointer gap-1.5"
						>
							{crearPlan.isPending && (
								<Loader2 className="h-4 w-4 animate-spin" />
							)}
							Guardar Plan
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import { useForm } from "@tanstack/react-form";
import { Loader2, Stethoscope } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useListarGanado } from "@/modules/ganado/hooks/useListarGanado";
import { useListarInsumos } from "@/modules/inventario-insumos/hooks/useListarInsumos";
import { useRegistrarSesionSanitaria } from "@/modules/sesion-sanitaria/hooks/useRegistrarSesionSanitaria";
import { registrarSesionSanitariaSchema } from "@/modules/sesion-sanitaria/schemas";
import { useListarVeterinarios } from "@/modules/veterinario/hooks/useListarVeterinarios";
import {
	type AplicacionItem,
	SesionSanitariaAnimalList,
} from "./SesionSanitariaAnimalList";

interface RegistrarSesionSanitariaModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TIPOS_INSUMO_SANITARIO = new Set(["VACUNA", "MEDICAMENTO"]);

export function RegistrarSesionSanitariaModal({
	open,
	onOpenChange,
}: RegistrarSesionSanitariaModalProps) {
	const [busquedaGanado, setBusquedaGanado] = useState("");
	const [ganadoPage, setGanadoPage] = useState(1);
	const [aplicaciones, setAplicaciones] = useState<AplicacionItem[]>([]);

	const { mutate: registrar, isPending } = useRegistrarSesionSanitaria();
	const { data: veterinariosData } = useListarVeterinarios(1, 100);
	const { data: insumosData } = useListarInsumos({ page: 1, limit: 100 });
	const { data: ganadosData, isLoading: isLoadingGanado } = useListarGanado(
		{
			page: ganadoPage,
			limit: 10,
			soloActivos: true,
			identificador: busquedaGanado || undefined,
		},
		open,
	);

	const insumosList = (insumosData?.data ?? []).filter((i) =>
		TIPOS_INSUMO_SANITARIO.has(i.tipo),
	);

	const resetState = () => {
		setAplicaciones([]);
		setBusquedaGanado("");
		setGanadoPage(1);
	};

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0] ?? "",
			veterinarioId: "",
			insumoId: "",
			descripcion: "",
			estado: "REALIZADA" as "REALIZADA" | "PROGRAMADA",
		},
		validators: { onChange: registrarSesionSanitariaSchema },
		onSubmit: ({ value }) => {
			if (aplicaciones.length === 0) {
				toast.error("Debe agregar al menos un animal a la sesión sanitaria.");
				return;
			}
			const dosisInvalida = aplicaciones.some(
				(a) =>
					a.dosisAplicada.trim() === "" ||
					Number.isNaN(Number(a.dosisAplicada)) ||
					Number(a.dosisAplicada) <= 0,
			);
			if (dosisInvalida) {
				toast.error(
					"Todas las dosis aplicadas por animal deben ser mayores a 0.",
				);
				return;
			}

			registrar(
				{
					fecha: value.fecha,
					veterinarioId: Number(value.veterinarioId),
					insumoId: Number(value.insumoId),
					descripcion: value.descripcion.trim(),
					estado: value.estado,
					aplicaciones: aplicaciones.map((a) => ({
						ganadoId: a.ganadoId,
						dosisAplicada: Number(a.dosisAplicada),
						observaciones: a.observaciones.trim() || null,
					})),
				},
				{
					onSuccess: () => {
						form.reset();
						resetState();
						onOpenChange(false);
					},
				},
			);
		},
	});

	const handleAgregarGanado = (
		id: number,
		identificador: string,
		peso: number,
	) => {
		if (aplicaciones.some((a) => a.ganadoId === id)) return;
		setAplicaciones((prev) => [
			...prev,
			{
				ganadoId: id,
				identificador,
				peso,
				dosisAplicada: "1",
				observaciones: "",
			},
		]);
	};

	const handleSeleccionarTodos = () => {
		const actualesIds = new Set(aplicaciones.map((a) => a.ganadoId));
		const nuevos = (ganadosData?.data ?? [])
			.filter((g) => !actualesIds.has(g.id))
			.map((g) => ({
				ganadoId: g.id,
				identificador: g.identificador,
				peso: g.peso,
				dosisAplicada: "1",
				observaciones: "",
			}));
		if (nuevos.length > 0) setAplicaciones((prev) => [...prev, ...nuevos]);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					if (!nextOpen) {
						form.reset();
						resetState();
					}
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<Stethoscope className="size-5 text-primary" />
						Registrar Sesión Sanitaria Masiva
					</DialogTitle>
					<DialogDescription>
						Documenta una jornada de vacunación, desparasitación o tratamiento y
						descuenta el insumo del inventario automáticamente.
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
					className="space-y-5 text-left"
				>
					<form.Subscribe
						selector={(s) =>
							Object.values(s.fieldMeta).filter(
								(m) => m?.isTouched && (m.errors?.length ?? 0) > 0,
							).length
						}
					>
						{(errorCount) => <FormErrorAnnouncer errorCount={errorCount} />}
					</form.Subscribe>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<form.Field name="fecha">
							{(field) => (
								<CampoTexto
									id="reg-sesion-fecha"
									label="Fecha de Jornada *"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field name="veterinarioId">
							{(field) => (
								<CampoSelect
									id="reg-sesion-vet"
									label="Veterinario Responsable *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="">Seleccionar Veterinario...</option>
									{(veterinariosData?.data ?? []).map((vet) => (
										<option key={vet.id} value={vet.id}>
											{vet.nombre} ({vet.cedulaProfesional})
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<form.Field name="insumoId">
							{(field) => (
								<CampoSelect
									id="reg-sesion-insumo"
									label="Vacuna o Medicamento *"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								>
									<option value="">Seleccionar Medicamento / Vacuna...</option>
									{insumosList.map((ins) => (
										<option key={ins.id} value={ins.id}>
											[{ins.tipo}] {ins.nombre} (Stock: {ins.stock}{" "}
											{ins.unidadMedida})
										</option>
									))}
								</CampoSelect>
							)}
						</form.Field>

						<div className="md:col-span-2">
							<form.Field name="descripcion">
								{(field) => (
									<CampoTexto
										id="reg-sesion-descripcion"
										label="Descripción / Motivo de la Sesión *"
										placeholder="Ej: Vacunación Anual contra Brucelosis"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
						</div>

						<form.Field name="estado">
							{(field) => (
								<CampoSelect
									id="reg-sesion-estado"
									label="Estado"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value as "REALIZADA" | "PROGRAMADA",
										)
									}
									disabled={isPending}
								>
									<option value="REALIZADA">Realizada (descuenta stock)</option>
									<option value="PROGRAMADA">
										Programada (futura, sin descontar)
									</option>
								</CampoSelect>
							)}
						</form.Field>
					</div>

					<form.Subscribe selector={(state) => state.values.insumoId}>
						{(insumoIdActual) => (
							<SesionSanitariaAnimalList
								insumoSeleccionado={insumosList.find(
									(i) => i.id === Number(insumoIdActual),
								)}
								aplicaciones={aplicaciones}
								ganados={ganadosData?.data ?? []}
								isLoadingGanado={isLoadingGanado}
								busquedaGanado={busquedaGanado}
								onBusquedaChange={(val) => {
									setBusquedaGanado(val);
									setGanadoPage(1);
								}}
								ganadoPage={ganadoPage}
								totalGanadoPages={ganadosData?.totalPages ?? 1}
								onPageChange={setGanadoPage}
								onSeleccionarTodos={handleSeleccionarTodos}
								onAgregarGanado={handleAgregarGanado}
								onQuitarGanado={(id) =>
									setAplicaciones((prev) =>
										prev.filter((a) => a.ganadoId !== id),
									)
								}
								onActualizarDosis={(id, dosis) =>
									setAplicaciones((prev) =>
										prev.map((a) =>
											a.ganadoId === id ? { ...a, dosisAplicada: dosis } : a,
										),
									)
								}
								onActualizarObservaciones={(id, obs) =>
									setAplicaciones((prev) =>
										prev.map((a) =>
											a.ganadoId === id ? { ...a, observaciones: obs } : a,
										),
									)
								}
							/>
						)}
					</form.Subscribe>

					<DialogFooter className="pt-3 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending} className="gap-2">
							{isPending && <Loader2 className="size-4 animate-spin" />}
							Guardar Sesión Sanitaria
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

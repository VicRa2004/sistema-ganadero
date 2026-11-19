import { useForm } from "@tanstack/react-form";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useRegistrarCompra } from "@/modules/comercial/hooks/useComercial";
import { compraHeaderSchema } from "@/modules/comercial/schemas";
import { useListarPropietarios } from "@/modules/propietario/hooks/useListarPropietarios";
import { useListarRazas } from "@/modules/raza/hooks/useListarRazas";
import { useListarTerrenos } from "@/modules/terreno/hooks/useListarTerrenos";
import {
	CompraAnimalRowList,
	type CompraItemDraft,
} from "./CompraAnimalRowList";

interface RegistrarCompraDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const crearDraftVacio = (idx: number): CompraItemDraft => ({
	key: `${Date.now()}-${idx}`,
	identificador: "",
	peso: "250",
	fechaNacimiento: "2025-01-01",
	sexo: "MACHO",
	razaId: "",
	terrenoId: "",
	propietarioId: "",
	precio: "12000",
	procedencia: "",
});

export function RegistrarCompraDialog({
	open,
	onOpenChange,
}: RegistrarCompraDialogProps) {
	const [items, setItems] = useState<CompraItemDraft[]>([crearDraftVacio(0)]);
	const [archivo, setArchivo] = useState<File | null>(null);

	const { mutate: registrarCompra, isPending } = useRegistrarCompra();
	const { data: razas = [] } = useListarRazas();
	const { data: terrenosData } = useListarTerrenos(1, 100);
	const { data: propietariosData } = useListarPropietarios(1, 100);

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0] ?? "",
			contraparte: "",
			moneda: "MXN",
			documento: "",
			observaciones: "",
		},
		validators: { onChange: compraHeaderSchema },
		onSubmit: ({ value }) => {
			if (items.length === 0) {
				toast.error("Debes agregar al menos un animal a la compra.");
				return;
			}
			for (const [idx, i] of items.entries()) {
				if (!i.identificador.trim()) {
					toast.error(`El arete del animal #${idx + 1} es requerido.`);
					return;
				}
				if (Number(i.peso) <= 0 || Number.isNaN(Number(i.peso))) {
					toast.error(`El peso del animal #${idx + 1} debe ser mayor a 0.`);
					return;
				}
				if (!i.razaId || !i.terrenoId || !i.propietarioId) {
					toast.error(
						`Selecciona raza, terreno y propietario del animal #${idx + 1}.`,
					);
					return;
				}
			}

			registrarCompra(
				{
					fecha: value.fecha,
					contraparte: value.contraparte.trim(),
					moneda: value.moneda.trim() || "MXN",
					documento: value.documento.trim() || null,
					observaciones: value.observaciones.trim() || null,
					items: items.map((i) => ({
						identificador: i.identificador.trim(),
						peso: Number(i.peso),
						fechaNacimiento: i.fechaNacimiento,
						sexo: i.sexo,
						razaId: Number(i.razaId),
						terrenoId: Number(i.terrenoId),
						propietarioId: Number(i.propietarioId),
						precio: Number(i.precio),
						procedencia: i.procedencia.trim() || null,
					})),
					documentoAdjunto: archivo,
				},
				{
					onSuccess: () => {
						form.reset();
						setItems([crearDraftVacio(0)]);
						setArchivo(null);
						onOpenChange(false);
					},
				},
			);
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					if (!nextOpen) {
						form.reset();
						setItems([crearDraftVacio(0)]);
						setArchivo(null);
					}
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-bold">
						<ShoppingCart className="size-5 text-blue-600" />
						Registrar Compra de Ganado
					</DialogTitle>
					<DialogDescription>
						Da de alta automáticamente los animales adquiridos con su
						procedencia y costo de compra.
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
					className="space-y-4 text-left"
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

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<form.Field name="fecha">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Fecha *"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
						<form.Field name="contraparte">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Proveedor / Vendedor *"
									placeholder="Ej. Ganadería Los Pinos"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
						<form.Field name="documento">
							{(field) => (
								<CampoTexto
									id={field.name}
									label="Factura / Guía REEMO (opcional)"
									placeholder="Ej. REEMO-8921"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
						<div className="space-y-1.5">
							<Label htmlFor="compra-adjunto">Comprobante (opcional)</Label>
							<Input
								id="compra-adjunto"
								type="file"
								accept=".pdf,image/*"
								onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
								disabled={isPending}
							/>
						</div>
					</div>

					<CompraAnimalRowList
						items={items}
						razas={razas}
						terrenos={terrenosData?.data ?? []}
						propietarios={propietariosData?.data ?? []}
						disabled={isPending}
						onAgregar={() =>
							setItems((prev) => [...prev, crearDraftVacio(prev.length)])
						}
						onQuitar={(key) =>
							setItems((prev) => prev.filter((x) => x.key !== key))
						}
						onActualizar={(key, campo, valor) =>
							setItems((prev) =>
								prev.map((x) => (x.key === key ? { ...x, [campo]: valor } : x)),
							)
						}
					/>

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
							Registrar compra
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

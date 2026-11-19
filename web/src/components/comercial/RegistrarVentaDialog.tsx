import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CampoTexto } from "@/components/CampoTexto";
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
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useRegistrarVenta } from "@/modules/comercial/hooks/useComercial";
import { ventaHeaderSchema } from "@/modules/comercial/schemas";
import type { GanadoDto } from "@/modules/ganado/types";

interface VentaItemDraft {
	ganadoId: number;
	identificador: string;
	pesoRegistro: string;
	precio: string;
}

interface RegistrarVentaDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RegistrarVentaDialog({
	open,
	onOpenChange,
}: RegistrarVentaDialogProps) {
	const [items, setItems] = useState<VentaItemDraft[]>([]);
	const [selectorOpen, setSelectorOpen] = useState(false);
	const [archivo, setArchivo] = useState<File | null>(null);

	const { mutate: registrarVenta, isPending } = useRegistrarVenta();

	const form = useForm({
		defaultValues: {
			fecha: new Date().toISOString().split("T")[0] ?? "",
			contraparte: "",
			moneda: "MXN",
			documento: "",
			observaciones: "",
		},
		validators: { onChange: ventaHeaderSchema },
		onSubmit: ({ value }) => {
			if (items.length === 0) {
				toast.error("Debes agregar al menos un animal a la venta.");
				return;
			}
			for (const [idx, item] of items.entries()) {
				const precio = Number(item.precio);
				if (item.precio.trim() === "" || Number.isNaN(precio) || precio < 0) {
					toast.error(
						`El precio del animal #${idx + 1} (${item.identificador}) es inválido.`,
					);
					return;
				}
			}

			registrarVenta(
				{
					fecha: value.fecha,
					contraparte: value.contraparte.trim(),
					moneda: value.moneda.trim() || "MXN",
					documento: value.documento.trim() || null,
					observaciones: value.observaciones.trim() || null,
					items: items.map((i) => ({
						ganadoId: i.ganadoId,
						precio: Number(i.precio),
						...(i.pesoRegistro.trim() !== "" &&
							Number(i.pesoRegistro) > 0 && {
								pesoRegistro: Number(i.pesoRegistro),
							}),
					})),
					documentoAdjunto: archivo,
				},
				{
					onSuccess: () => {
						form.reset();
						setItems([]);
						setArchivo(null);
						onOpenChange(false);
					},
				},
			);
		},
	});

	const handleSelectGanado = (ganado: GanadoDto | null) => {
		setSelectorOpen(false);
		if (!ganado) return;
		if (items.some((i) => i.ganadoId === ganado.id)) {
			toast.error(`El animal ${ganado.identificador} ya fue agregado.`);
			return;
		}
		setItems((prev) => [
			...prev,
			{
				ganadoId: ganado.id,
				identificador: ganado.identificador,
				pesoRegistro: String(ganado.peso),
				precio: "15000",
			},
		]);
	};

	const totalCalculado = items.reduce(
		(acc, i) => acc + (Number(i.precio) || 0),
		0,
	);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!isPending) {
						if (!nextOpen) {
							form.reset();
							setItems([]);
							setArchivo(null);
						}
						onOpenChange(nextOpen);
					}
				}}
			>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-lg font-bold">
							<ShoppingBag className="size-5 text-emerald-600" />
							Registrar Venta de Ganado
						</DialogTitle>
						<DialogDescription>
							Da de baja automáticamente los animales vendidos por motivo VENTA.
							Bloqueado si algún animal tiene período de retiro vigente.
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
										label="Comprador / Contraparte *"
										placeholder="Ej. Empacadora del Norte"
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
										label="Factura / Folio (opcional)"
										placeholder="Ej. FAC-2026-001"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										errors={getVisibleFieldErrors(field.state.meta)}
										disabled={isPending}
									/>
								)}
							</form.Field>
							<div className="space-y-1.5">
								<Label htmlFor="venta-adjunto">Comprobante (opcional)</Label>
								<Input
									id="venta-adjunto"
									type="file"
									accept=".pdf,image/*"
									onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
									disabled={isPending}
								/>
							</div>
						</div>

						<div className="space-y-2 rounded-lg border border-border bg-muted/10 p-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-semibold">
									Animales en venta ({items.length}) · Total: $
									{totalCalculado.toFixed(2)}
								</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setSelectorOpen(true)}
									className="gap-1"
								>
									<Plus className="size-3.5" />
									Añadir animal
								</Button>
							</div>
							{items.length === 0 ? (
								<p className="text-xs text-muted-foreground py-3 text-center">
									Selecciona los animales activos que forman parte de esta
									venta.
								</p>
							) : (
								<div className="space-y-2">
									{items.map((item) => (
										<div
											key={item.ganadoId}
											className="grid grid-cols-12 gap-2 items-end rounded-md border border-border bg-background p-2"
										>
											<div className="col-span-4 text-xs font-bold py-2">
												{item.identificador}
											</div>
											<div className="col-span-3 space-y-1">
												<Label
													htmlFor={`venta-peso-${item.ganadoId}`}
													className="text-[10px]"
												>
													Peso (kg)
												</Label>
												<Input
													id={`venta-peso-${item.ganadoId}`}
													type="number"
													allowDecimals={true}
													value={item.pesoRegistro}
													onChange={(e) =>
														setItems((prev) =>
															prev.map((x) =>
																x.ganadoId === item.ganadoId
																	? { ...x, pesoRegistro: e.target.value }
																	: x,
															),
														)
													}
													className="h-8 text-xs"
												/>
											</div>
											<div className="col-span-4 space-y-1">
												<Label
													htmlFor={`venta-precio-${item.ganadoId}`}
													className="text-[10px]"
												>
													Precio ($) *
												</Label>
												<Input
													id={`venta-precio-${item.ganadoId}`}
													type="number"
													allowDecimals={true}
													value={item.precio}
													onChange={(e) =>
														setItems((prev) =>
															prev.map((x) =>
																x.ganadoId === item.ganadoId
																	? { ...x, precio: e.target.value }
																	: x,
															),
														)
													}
													className="h-8 text-xs"
												/>
											</div>
											<div className="col-span-1 flex justify-end">
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													aria-label={`Quitar ${item.identificador}`}
													onClick={() =>
														setItems((prev) =>
															prev.filter((x) => x.ganadoId !== item.ganadoId),
														)
													}
												>
													<Trash2 className="size-4 text-destructive" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
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
								Confirmar venta
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<GanadoSelectorModal
				open={selectorOpen}
				onOpenChange={setSelectorOpen}
				title="Seleccionar Animal para Venta"
				description="Solo animales activos sin período de retiro vigente pueden venderse."
				onSelect={handleSelectGanado}
			/>
		</>
	);
}

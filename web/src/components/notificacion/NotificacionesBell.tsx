import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	Bell,
	Calendar,
	CheckCheck,
	Loader2,
	Package,
	RefreshCw,
	Stethoscope,
	Syringe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
	useEvaluarAlertas,
	useListarNotificaciones,
	useMarcarNotificacionLeida,
	useMarcarTodasLeidas,
} from "@/modules/notificacion/hooks/useNotificaciones";
import type {
	NotificacionDto,
	TipoNotificacion,
} from "@/modules/notificacion/types";
import { cn } from "@/lib/utils";

function iconForTipo(tipo: TipoNotificacion) {
	switch (tipo) {
		case "STOCK_BAJO":
			return Package;
		case "INSUMO_POR_CADUCAR":
			return AlertTriangle;
		case "TRATAMIENTO_POR_VENCER":
			return Stethoscope;
		case "SESION_PROGRAMADA":
			return Calendar;
		case "VACUNA_PENDIENTE":
			return Syringe;
	}
}

function rutaParaNotificacion(n: NotificacionDto): string {
	switch (n.tipo) {
		case "STOCK_BAJO":
		case "INSUMO_POR_CADUCAR":
			return "/dashboard/insumos";
		case "TRATAMIENTO_POR_VENCER":
			return "/dashboard/tratamientos-medicos";
		case "SESION_PROGRAMADA":
		case "VACUNA_PENDIENTE":
			return "/dashboard/calendario-sanitario";
	}
}

export function NotificacionesBell() {
	const [open, setOpen] = useState(false);
	const [soloNoLeidas, setSoloNoLeidas] = useState(false);
	const navigate = useNavigate();

	const { data, isLoading } = useListarNotificaciones({
		page: 1,
		limit: 20,
		soloNoLeidas,
	});
	const marcarLeida = useMarcarNotificacionLeida();
	const marcarTodas = useMarcarTodasLeidas();
	const evaluar = useEvaluarAlertas();

	const noLeidas = data?.noLeidas ?? 0;
	const items = data?.data ?? [];

	const handleAbrirItem = (n: NotificacionDto) => {
		if (!n.leida) {
			marcarLeida.mutate(n.id);
		}
		setOpen(false);
		navigate({ to: rutaParaNotificacion(n) });
	};

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => setOpen(true)}
				aria-label={`Notificaciones (${noLeidas} sin leer)`}
				title="Notificaciones y alertas sanitarias"
				className="relative h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground cursor-pointer"
			>
				<Bell className="h-4 w-4" />
				{noLeidas > 0 && (
					<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
						{noLeidas > 99 ? "99+" : noLeidas}
					</span>
				)}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-lg">
							<Bell className="h-5 w-5 text-primary" />
							Notificaciones y Recordatorios
							{noLeidas > 0 && (
								<Badge variant="destructive" className="text-[10px]">
									{noLeidas} nuevas
								</Badge>
							)}
						</DialogTitle>
						<DialogDescription>
							Alertas de stock bajo, caducidades, tratamientos y sesiones
							programadas.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								size="sm"
								variant={!soloNoLeidas ? "default" : "outline"}
								onClick={() => setSoloNoLeidas(false)}
								className="h-7 text-xs cursor-pointer"
							>
								Todas
							</Button>
							<Button
								type="button"
								size="sm"
								variant={soloNoLeidas ? "default" : "outline"}
								onClick={() => setSoloNoLeidas(true)}
								className="h-7 text-xs cursor-pointer"
							>
								Sin leer
							</Button>
						</div>

						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={() => evaluar.mutate()}
								disabled={evaluar.isPending}
								className="h-7 text-xs gap-1 cursor-pointer"
								title="Verificar alertas ahora"
							>
								{evaluar.isPending ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<RefreshCw className="h-3.5 w-3.5" />
								)}
								Revisar
							</Button>
							{noLeidas > 0 && (
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => marcarTodas.mutate()}
									disabled={marcarTodas.isPending}
									className="h-7 text-xs gap-1 cursor-pointer"
								>
									<CheckCheck className="h-3.5 w-3.5" />
									Leer todas
								</Button>
							)}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
						{isLoading ? (
							<div className="flex items-center justify-center py-10 text-muted-foreground gap-2 text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								Cargando notificaciones...
							</div>
						) : items.length === 0 ? (
							<div className="text-center py-10 text-muted-foreground text-sm">
								No tienes notificaciones {soloNoLeidas ? "sin leer" : ""}.
							</div>
						) : (
							items.map((n) => {
								const Icon = iconForTipo(n.tipo);
								return (
									<button
										key={n.id}
										type="button"
										onClick={() => handleAbrirItem(n)}
										className={cn(
											"w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3",
											n.leida
												? "border-border bg-card/40 opacity-75 hover:bg-muted/40"
												: "border-primary/30 bg-primary/5 hover:bg-primary/10",
										)}
									>
										<div
											className={cn(
												"size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
												n.leida
													? "bg-muted text-muted-foreground"
													: "bg-primary/15 text-primary",
											)}
										>
											<Icon className="h-4 w-4" />
										</div>
										<div className="flex-1 min-w-0 space-y-0.5">
											<div className="flex items-center justify-between gap-2">
												<p className="text-xs font-semibold text-foreground truncate">
													{n.titulo}
												</p>
												{!n.leida && (
													<span className="size-2 rounded-full bg-primary shrink-0" />
												)}
											</div>
											<p className="text-xs text-muted-foreground leading-relaxed">
												{n.cuerpo}
											</p>
											<p className="text-[10px] text-muted-foreground/70">
												{new Date(n.createdAt).toLocaleString("es-MX")}
											</p>
										</div>
									</button>
								);
							})
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

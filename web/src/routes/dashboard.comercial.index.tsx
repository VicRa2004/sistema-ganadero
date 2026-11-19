import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, DollarSign, Receipt, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { GastosSection } from "@/components/comercial/GastosSection";
import { RentabilidadSection } from "@/components/comercial/RentabilidadSection";
import { TransaccionesSection } from "@/components/comercial/TransaccionesSection";
import { Button } from "@/components/ui/button";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";

export const Route = createFileRoute("/dashboard/comercial/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "comercial", "read");
	},
	component: ComercialComponent,
});

type TabComercial = "rentabilidad" | "transacciones" | "gastos";

function ComercialComponent() {
	const [tab, setTab] = useState<TabComercial>("rentabilidad");

	return (
		<div className="space-y-6 py-4 sm:py-6 animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 text-left">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<DollarSign className="size-6" />
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Comercial, Costos y Rentabilidad
						</h1>
						<p className="text-sm text-muted-foreground">
							Gestiona compras, ventas de ganado, gastos operativos y balance
							económico.
						</p>
					</div>
				</div>
			</div>

			<div
				role="tablist"
				aria-label="Secciones comerciales y financieras"
				className="flex flex-wrap gap-2 border-b border-border pb-3"
			>
				<Button
					type="button"
					role="tab"
					aria-selected={tab === "rentabilidad"}
					variant={tab === "rentabilidad" ? "default" : "outline"}
					size="sm"
					onClick={() => setTab("rentabilidad")}
					className="gap-1.5"
				>
					<BarChart3 className="size-4" />
					Rentabilidad
				</Button>
				<Button
					type="button"
					role="tab"
					aria-selected={tab === "transacciones"}
					variant={tab === "transacciones" ? "default" : "outline"}
					size="sm"
					onClick={() => setTab("transacciones")}
					className="gap-1.5"
				>
					<ShoppingBag className="size-4" />
					Compras y Ventas
				</Button>
				<Button
					type="button"
					role="tab"
					aria-selected={tab === "gastos"}
					variant={tab === "gastos" ? "default" : "outline"}
					size="sm"
					onClick={() => setTab("gastos")}
					className="gap-1.5"
				>
					<Receipt className="size-4" />
					Gastos Operativos
				</Button>
			</div>

			{tab === "rentabilidad" && <RentabilidadSection />}
			{tab === "transacciones" && <TransaccionesSection />}
			{tab === "gastos" && <GastosSection />}
		</div>
	);
}

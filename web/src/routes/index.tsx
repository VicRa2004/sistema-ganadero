import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	Activity,
	Sprout,
	Package,
	TrendingUp,
	ShieldCheck,
	CheckCircle2,
	Coins,
	ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingComponent,
});

function LandingComponent() {
	const features = [
		{
			title: "Trazabilidad de Ganado",
			description:
				"Registra la genealogía, traslados entre potreros, pesajes y evolución física del ganado de manera exacta y en tiempo real.",
			icon: Sprout,
			badge: "Ganado",
		},
		{
			title: "Salud y Vacunación",
			description:
				"Monitorea sesiones sanitarias, dosifica tratamientos veterinarios y prevé brotes epidémicos controlando historiales clínicos.",
			icon: Activity,
			badge: "Sanidad",
		},
		{
			title: "Inventario de Insumos",
			description:
				"Control automatizado de stock para alimentos, vacunas y herramientas con alertas de existencias críticas.",
			icon: Package,
			badge: "Insumos",
		},
		{
			title: "Análisis y Reportes",
			description:
				"Proyecta la rentabilidad de tu producción mediante gráficos avanzados de ganancia de peso diaria y costos de alimentación.",
			icon: TrendingUp,
			badge: "Reportes",
		},
	];

	const benefits = [
		{
			title: "Decisiones Basadas en Datos",
			description:
				"Gráficos de rendimiento e informes históricos que permiten tomar decisiones fundamentadas en lugar de basarse en intuiciones.",
			icon: CheckCircle2,
		},
		{
			title: "Trazabilidad Completa",
			description:
				"Accede al registro de vida completo de cada animal: genealogía, tratamientos médicos aplicados y traslados de potreros.",
			icon: ShieldCheck,
		},
		{
			title: "Optimización de Gastos",
			description:
				"Reduce mermas de insumos mediante el control exacto de existencias y dosificaciones médicas por cabeza de ganado.",
			icon: Coins,
		},
	];

	return (
		<div className="flex flex-col gap-20 py-8 animate-fade-in text-foreground">
			{/* Hero Section */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div className="flex flex-col gap-6 text-left">
					<div>
						<Badge variant="secondary" className="px-3 py-1 text-xs">
							Sistema Ganadero v0.1.0
						</Badge>
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl leading-tight">
						Gestión Ganadera Inteligente y Trazabilidad Total
					</h1>
					<p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
						Automatiza y digitaliza los procesos críticos de tu rancho.
						Monitorea la salud animal, administra el inventario de insumos y
						obtén análisis detallados de rendimiento desde una única plataforma
						digital.
					</p>
					<div className="flex flex-wrap gap-4 mt-2">
						<Button className="gap-2 cursor-pointer">
							Comenzar ahora
							<ArrowRight className="size-4" />
						</Button>
						<Button variant="outline" className="gap-2 cursor-pointer">
							Explorar Módulos
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>

				<div className="relative">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
						<img
							src="/hero.png"
							alt="Panel del Sistema Ganadero inteligente"
							className="w-full h-auto object-cover aspect-video lg:aspect-square max-h-[500px]"
						/>
					</div>
				</div>
			</section>

			{/* Features / Modules Section */}
			<section className="flex flex-col gap-12">
				<div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
					<h2 className="text-3xl font-bold tracking-tight text-foreground">
						Módulos Integrados del Sistema
					</h2>
					<p className="text-muted-foreground text-sm md:text-base leading-relaxed">
						Nuestra plataforma cubre todos los aspectos de la administración
						agropecuaria para asegurar la trazabilidad, eficiencia y
						rentabilidad de tu negocio ganadero.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{features.map((feat) => {
						const Icon = feat.icon;
						return (
							<Card key={feat.title} className="bg-card border-border">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<div className="flex items-center gap-3">
										<div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
											<Icon className="size-5" />
										</div>
										<CardTitle className="text-lg font-bold text-foreground">
											{feat.title}
										</CardTitle>
									</div>
									<Badge variant="outline" className="text-[10px]">
										{feat.badge}
									</Badge>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-sm text-left leading-relaxed">
										{feat.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Benefits / Impact Section */}
			<section className="flex flex-col gap-12 border-t border-border pt-16">
				<div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
					<h2 className="text-3xl font-bold tracking-tight text-foreground">
						Diseñado para el Productor Moderno
					</h2>
					<p className="text-muted-foreground text-sm md:text-base leading-relaxed">
						Optimiza los flujos de trabajo tradicionales para reducir costos
						operativos, mejorar el control sanitario y maximizar los márgenes de
						producción.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{benefits.map((benefit) => {
						const Icon = benefit.icon;
						return (
							<Card key={benefit.title} className="bg-card border-border">
								<CardHeader className="flex flex-col items-center text-center pb-2">
									<div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
										<Icon className="size-6" />
									</div>
									<CardTitle className="text-base font-bold text-foreground">
										{benefit.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<p className="text-muted-foreground text-sm leading-relaxed">
										{benefit.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>
		</div>
	);
}

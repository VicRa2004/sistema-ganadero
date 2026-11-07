import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
	ArrowRight,
	Activity,
	Sprout,
	Package,
	ShieldCheck,
	CheckCircle2,
	Coins,
	ChevronRight,
	Warehouse,
	Scale,
	Stethoscope,
	Users,
	Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingComponent,
});

function LandingComponent() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const isAuthenticated = !!accessToken;

	const modules = [
		{
			title: "Trazabilidad y Ganado",
			description:
				"Control individual por arete, historial de pesajes periódicos, genealogía y registro de traslados entre potreros.",
			icon: Sprout,
			badge: "Bovinos",
			href: "/dashboard/ganado",
		},
		{
			title: "Potreros y Terrenos",
			description:
				"Administración de predios, cálculo de carga animal por hectárea y control de rotación para conservar pastizales.",
			icon: Warehouse,
			badge: "Pastos",
			href: "/dashboard/terrenos",
		},
		{
			title: "Sesiones Sanitarias",
			description:
				"Planificación de campañas de vacunación, desparasitación colectiva y control de calendarios sanitarios oficiales.",
			icon: Activity,
			badge: "Sanidad",
			href: "/dashboard/sesiones-sanitarias",
		},
		{
			title: "Tratamientos Veterinarios",
			description:
				"Historial clínico detallado, recetas por animal, dosificación diaria y seguimiento de tiempos de retiro.",
			icon: Stethoscope,
			badge: "Clínica",
			href: "/dashboard/tratamientos-medicos",
		},
		{
			title: "Inventario de Insumos",
			description:
				"Control de existencias para forrajes, sales minerales, vacunas y herramientas con alertas de stock mínimo.",
			icon: Package,
			badge: "Almacén",
			href: "/dashboard/insumos",
		},
		{
			title: "Propietarios y Veterinarios",
			description:
				"Padrón organizado de propietarios de ganado y directorio de médicos veterinarios responsables con cédula.",
			icon: Users,
			badge: "Directorio",
			href: "/dashboard/propietarios",
		},
	];

	const stats = [
		{
			metric: "100%",
			label: "Trazabilidad de Aretes",
			description: "Identificación única y genealogía",
		},
		{
			metric: "24/7",
			label: "Control de Potreros",
			description: "Carga animal y rotación de pastos",
		},
		{
			metric: "0 Rastreos",
			label: "Mermas de Insumos",
			description: "Dosificación precisa por dosis",
		},
		{
			metric: "+35%",
			label: "Eficiencia Operativa",
			description: "Menos papeleo, mejores decisiones",
		},
	];

	const benefits = [
		{
			title: "Decisiones Basadas en Pesajes Reales",
			description:
				"Monitorea la ganancia diaria de peso (GDP) de cada lote para identificar animales de alto rendimiento y descartes a tiempo.",
			icon: CheckCircle2,
		},
		{
			title: "Historial Clínico y Sanidad Preventiva",
			description:
				"Prevé brotes de enfermedades y cumple con las normativas sanitarias registrando cada vacuna, dosis y fecha de aplicación.",
			icon: ShieldCheck,
		},
		{
			title: "Optimización de Costos y Forrajes",
			description:
				"Evita desperdicios de suplementos alimenticios y medicamentos mediante el control automatizado de entradas y salidas de almacén.",
			icon: Coins,
		},
	];

	return (
		<div className="flex flex-col gap-12 sm:gap-20 py-3 sm:py-6 animate-fade-in text-foreground">
			{/* Hero Section */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center pt-2">
				<div className="flex flex-col gap-5 sm:gap-6 text-left">
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="px-3 py-1 text-xs gap-1.5 border-primary/30 bg-primary/10 text-primary font-medium shadow-xs"
						>
							<Sparkles className="size-3.5 text-primary" />
							Ganadería de Precisión · v0.1.0
						</Badge>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
						Gestión Ganadera Inteligente y{" "}
						<span className="text-primary">Trazabilidad Total</span>
					</h1>

					<p className="text-muted-foreground text-sm sm:text-lg leading-relaxed max-w-xl">
						Digitaliza la operación integral de tu rancho: control de aretes y
						genealogía, rotación de potreros, pesajes periódicos, sanidad
						preventiva e inventario veterinario desde una sola plataforma.
					</p>

					{/* Botones de acción principales */}
					<div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
						<Link to={isAuthenticated ? "/dashboard" : "/login"}>
							<Button
								size="lg"
								className="gap-2 cursor-pointer shadow-md font-semibold h-10 sm:h-11 px-5 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
							>
								{isAuthenticated ? "Ir al Panel de Control" : "Comenzar ahora"}
								<ArrowRight className="size-4" />
							</Button>
						</Link>

						<Button
							type="button"
							variant="outline"
							size="lg"
							className="gap-2 cursor-pointer font-medium h-10 sm:h-11 px-5 sm:px-6 border-border hover:bg-secondary/60 hover:text-foreground transition-all text-sm sm:text-base"
							onClick={() => {
								const el = document.getElementById("modulos");
								el?.scrollIntoView({ behavior: "smooth" });
							}}
						>
							Explorar Módulos
							<ChevronRight className="size-4" />
						</Button>
					</div>

					{/* Estado de conectividad o acceso rápido */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
						<span className="size-2 rounded-full bg-primary animate-pulse" />
						<span>
							Sistema activo y listo para registrar operaciones de campo
						</span>
					</div>
				</div>

				{/* Visual Hero con badges flotantes */}
				<div className="relative group">
					<div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl transition-shadow duration-300">
						<img
							src="/hero.png"
							alt="Pastoreo de ganado bovino en campo verde al atardecer"
							className="w-full h-auto object-cover aspect-video lg:aspect-[4/3] max-h-[500px] group-hover:scale-105 transition-transform duration-700 ease-out"
						/>
						{/* Gradiente de fondo sutil */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

						{/* Badge flotante superior: Estado de potrero (escalado en móvil) */}
						<div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-background/95 backdrop-blur-md border border-border/70 rounded-xl p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 max-w-[200px] sm:max-w-none">
							<div className="size-7 sm:size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
								<Warehouse className="size-3.5 sm:size-5 text-primary" />
							</div>
							<div className="text-left min-w-0">
								<p className="font-semibold text-[11px] sm:text-xs text-foreground truncate">
									Potrero San Carlos #3
								</p>
								<p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
									Pastoreo activo · 45 Cabezas
								</p>
							</div>
						</div>

						{/* Badge flotante inferior: Métrica de pesaje (escalado en móvil) */}
						<div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-background/95 backdrop-blur-md border border-border/70 rounded-xl p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 max-w-[200px] sm:max-w-none">
							<div className="size-7 sm:size-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
								<Scale className="size-3.5 sm:size-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div className="text-left min-w-0">
								<p className="font-semibold text-[11px] sm:text-xs text-foreground truncate">
									Ganancia Media Diaria
								</p>
								<p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
									+0.85 kg/día · Estado Óptimo
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Franja de Métricas / Impacto en el Rancho */}
			<section className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-5 sm:py-6 border-y border-border/80 bg-card/40 rounded-2xl p-4 sm:p-6">
				{stats.map((item, idx) => (
					<div
						key={item.label}
						className={cn(
							"flex flex-col gap-1 text-center sm:text-left px-2 sm:px-4",
							idx % 2 === 0
								? "border-r border-border/50 lg:border-r"
								: "lg:border-r",
							idx === stats.length - 1 && "lg:border-r-0",
						)}
					>
						<span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
							{item.metric}
						</span>
						<span className="text-xs sm:text-sm font-bold text-foreground">
							{item.label}
						</span>
						<span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">
							{item.description}
						</span>
					</div>
				))}
			</section>

			{/* Features / Modules Section */}
			<section id="modulos" className="flex flex-col gap-10 scroll-mt-24">
				<div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
					<Badge
						variant="outline"
						className="w-fit mx-auto text-xs px-3 py-0.5 border-primary/30 text-primary bg-primary/5"
					>
						Operación Ganadera Completa
					</Badge>
					<h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
						Módulos Especializados para el Campo
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
						Cada herramienta fue diseñada pensando en la realidad del trabajo
						agropecuario: rapidez en la captura, precisión en los aretes y
						disponibilidad para el operario y el administrador.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{modules.map((feat) => {
						const Icon = feat.icon;
						return (
							<Card
								key={feat.title}
								className="bg-card border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col justify-between group overflow-hidden relative"
							>
								{/* Indicador superior con color de marca */}
								<div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 group-hover:bg-primary transition-colors" />

								<div>
									<CardHeader className="flex flex-row items-center justify-between pb-3">
										<div className="flex items-center gap-3">
											<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
												<Icon className="size-5" />
											</div>
											<CardTitle className="text-base font-bold text-foreground">
												{feat.title}
											</CardTitle>
										</div>
										<Badge
											variant="secondary"
											className="text-[10px] font-semibold text-secondary-foreground"
										>
											{feat.badge}
										</Badge>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-xs sm:text-sm text-left leading-relaxed">
											{feat.description}
										</p>
									</CardContent>
								</div>

								<div className="px-6 pb-5 pt-2 flex justify-end">
									<Link to={isAuthenticated ? feat.href : "/login"}>
										<Button
											variant="ghost"
											size="sm"
											className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium p-0 h-auto"
										>
											{isAuthenticated
												? "Acceder al módulo"
												: "Ingresar para ver"}
											<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
										</Button>
									</Link>
								</div>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Benefits / Impact Section */}
			<section className="flex flex-col gap-10 border-t border-border/80 pt-16">
				<div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						Diseñado para el Productor Ganadero Moderno
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
						Reemplaza las libretas de campo y los archivos dispersos con una
						base de datos centralizada, segura y trazable para toda tu
						ganadería.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{benefits.map((benefit) => {
						const Icon = benefit.icon;
						return (
							<Card
								key={benefit.title}
								className="bg-card border-border/80 p-6 flex flex-col gap-4 text-left shadow-xs"
							>
								<div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
									<Icon className="size-6 text-primary" />
								</div>
								<h3 className="text-base font-bold text-foreground">
									{benefit.title}
								</h3>
								<p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
									{benefit.description}
								</p>
							</Card>
						);
					})}
				</div>
			</section>

			{/* CTA Card de Cierre */}
			<section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/20 p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-sm">
				<div className="max-w-2xl space-y-2">
					<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						¿Listo para optimizar la rentabilidad de tu rancho?
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
						Comienza a registrar altas de ganado, pesajes periódicos y programas
						sanitarios con la plataforma líder en trazabilidad agropecuaria.
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Link to={isAuthenticated ? "/dashboard" : "/login"}>
						<Button
							size="lg"
							className="gap-2 cursor-pointer shadow-md font-semibold h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isAuthenticated ? "Abrir Panel de Control" : "Iniciar Sesión"}
							<ArrowRight className="size-4" />
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

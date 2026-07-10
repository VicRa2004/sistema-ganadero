import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Activity,
	ArrowUpRight,
	ClipboardList,
	Database,
	Plus,
	ShieldAlert,
	ShieldCheck,
	Sprout,
	User,
	Users,
	Warehouse,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardIndexComponent,
});

function DashboardIndexComponent() {
	const user = useAuthStore((state) => state.user);
	const permissions = useAuthStore((state) => state.permissions) || [];

	const hasPermission = (resource: string, action: string): boolean => {
		return permissions.includes(`${resource}:${action}`);
	};

	// Lista de tarjetas operativas de negocio
	const operationsData = [
		{
			resource: "ganado",
			title: "Trazabilidad de Ganado",
			description: "Control de pesaje, historial clínico y genealogía.",
			icon: Sprout,
			readAction: "read",
			createAction: "create",
			badge: "Operativo",
		},
		{
			resource: "ranchos",
			title: "Control de Ranchos",
			description: "Asignación de potreros y administración de sedes.",
			icon: Warehouse,
			readAction: "read",
			createAction: "create",
			badge: "Infraestructura",
		},
		{
			resource: "inventario-insumos",
			title: "Inventario de Insumos",
			description: "Stock de vacunas, alimentos y herramientas.",
			icon: Database,
			readAction: "read",
			createAction: "create",
			badge: "Insumos",
		},
		{
			resource: "sesiones-sanitarias",
			title: "Sesiones Sanitarias",
			description: "Control de campañas de vacunación y desparasitación.",
			icon: Activity,
			readAction: "read",
			createAction: "create",
			badge: "Sanidad",
		},
	];

	return (
		<div className="space-y-10 py-6 animate-fade-in text-foreground">
			{/* Bienvenida */}
			<section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
				<div className="space-y-1 text-left">
					<h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
						¡Hola, {user?.name}!
					</h1>
					<p className="text-muted-foreground text-sm md:text-base">
						Bienvenido de vuelta. Aquí tienes el estado actual del rancho
						ganadero.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Badge
						variant={user?.role === "ADMIN" ? "default" : "secondary"}
						className="px-3 py-1 font-semibold text-xs tracking-wider gap-1.5 flex items-center"
					>
						{user?.role === "ADMIN" ? (
							<ShieldCheck className="h-3.5 w-3.5" />
						) : (
							<User className="h-3.5 w-3.5" />
						)}
						{user?.role || "USER"}
					</Badge>
				</div>
			</section>

			{/* Contenedor principal de operaciones de negocio */}
			<section className="space-y-6">
				<h2 className="text-xl font-bold tracking-tight text-left flex items-center gap-2">
					<ClipboardList className="h-5 w-5 text-primary" />
					Operaciones del Rancho
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
					{operationsData.map((op) => {
						const Icon = op.icon;
						const canRead = hasPermission(op.resource, op.readAction);
						const canCreate = hasPermission(op.resource, op.createAction);

						if (!canRead) return null;

						return (
							<Card
								key={op.title}
								className="border border-border bg-card/45 hover:bg-card/85 transition-all duration-300 shadow-sm relative overflow-hidden group"
							>
								{/* Adorno visual superior */}
								<div className="absolute top-0 left-0 w-full h-[3px] bg-primary/20 group-hover:bg-primary transition-colors" />

								<CardHeader className="flex flex-row items-start justify-between pb-2">
									<div className="flex items-center gap-3">
										<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<Icon className="size-5" />
										</div>
										<div className="text-left">
											<CardTitle className="text-base font-bold text-foreground">
												{op.title}
											</CardTitle>
											<Badge variant="outline" className="text-[10px] mt-1">
												{op.badge}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-muted-foreground text-sm text-left leading-relaxed">
										{op.description}
									</p>
									<div className="flex gap-3 justify-end pt-2">
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 cursor-pointer text-xs"
										>
											Ver Registros
											<ArrowUpRight className="h-3 w-3" />
										</Button>

										{canCreate && (
											<Button
												size="sm"
												className="h-8 gap-1.5 cursor-pointer text-xs"
											>
												<Plus className="h-3 w-3" />
												Registrar
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Sección Administrativa Exclusiva */}
			{hasPermission("users", "read") && (
				<section className="space-y-6 pt-6 border-t border-border animate-fade-in">
					<h2 className="text-xl font-bold tracking-tight text-left flex items-center gap-2 text-foreground">
						<ShieldAlert className="h-5 w-5 text-amber-500" />
						Panel de Administración del Sistema
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="border border-border bg-amber-500/5 shadow-sm relative overflow-hidden group">
							<div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500/40" />
							<CardHeader className="flex flex-row items-center gap-3 pb-2">
								<div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
									<Users className="size-5" />
								</div>
								<div className="text-left">
									<CardTitle className="text-base font-bold text-foreground">
										Gestión de Usuarios
									</CardTitle>
									<CardDescription className="text-xs text-muted-foreground">
										Crea, edita y administra accesos
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground text-sm text-left leading-relaxed">
									Accede al control total de personal, define quién puede operar
									y visualiza bitácoras de actividad.
								</p>
								<div className="flex justify-end pt-2">
									<Button
										variant="outline"
										size="sm"
										className="h-8 gap-1.5 cursor-pointer text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
									>
										Administrar Usuarios
										<ArrowUpRight className="h-3 w-3" />
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-border bg-amber-500/5 shadow-sm relative overflow-hidden group">
							<div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500/40" />
							<CardHeader className="flex flex-row items-center gap-3 pb-2">
								<div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
									<Users className="size-5" />
								</div>
								<div className="text-left">
									<CardTitle className="text-base font-bold text-foreground">
										Roles y Permisos Granulares
									</CardTitle>
									<CardDescription className="text-xs text-muted-foreground">
										Configuración de seguridad
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground text-sm text-left leading-relaxed">
									Administra la matriz de permisos atómicos y gestiona
									excepciones por usuario para restringir acciones críticas.
								</p>
								<div className="flex justify-end pt-2">
									<Button
										variant="outline"
										size="sm"
										className="h-8 gap-1.5 cursor-pointer text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
									>
										Ver Matriz de Permisos
										<ArrowUpRight className="h-3 w-3" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>
			)}
		</div>
	);
}

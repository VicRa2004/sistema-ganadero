import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Activity,
	Beef,
	Calendar,
	Database,
	Dna,
	DollarSign,
	Heart,
	KeyRound,
	Layers,
	LayoutDashboard,
	Lock,
	Menu,
	Shield,
	Sprout,
	Stethoscope,
	UserCheck,
	Users,
	Warehouse,
	Wheat,
	type LucideIcon,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SidebarItem {
	label: string;
	resource: string;
	href: string;
	icon: LucideIcon;
}

interface SidebarGroup {
	title: string;
	items: SidebarItem[];
	/** Si es true, el grupo se oculta completamente cuando el usuario no tiene acceso a ningún item */
	hideIfNoAccess?: boolean;
}

// ─── Definición de grupos y módulos ───────────────────────────────────────────

const SIDEBAR_GROUPS: SidebarGroup[] = [
	{
		title: "General",
		items: [
			{
				label: "Dashboard",
				resource: "",
				href: "/dashboard",
				icon: LayoutDashboard,
			},
		],
	},
	{
		title: "Operaciones",
		items: [
			{
				label: "Ganado",
				resource: "ganado",
				href: "/dashboard/ganado",
				icon: Sprout,
			},
			{
				label: "Lotes",
				resource: "lotes",
				href: "/dashboard/lotes",
				icon: Layers,
			},
			{
				label: "Reproducción",
				resource: "reproduccion",
				href: "/dashboard/reproduccion",
				icon: Heart,
			},
			{
				label: "Terrenos",
				resource: "terreno",
				href: "/dashboard/terrenos",
				icon: Warehouse,
			},
			{
				label: "Propietarios",
				resource: "propietario",
				href: "/dashboard/propietarios",
				icon: Users,
			},
		],
	},
	{
		title: "Sanidad",
		items: [
			{
				label: "Calendario Sanitario",
				resource: "sesiones-sanitarias",
				href: "/dashboard/calendario-sanitario",
				icon: Calendar,
			},
			{
				label: "Sesiones Sanitarias",
				resource: "sesiones-sanitarias",
				href: "/dashboard/sesiones-sanitarias",
				icon: Activity,
			},
			{
				label: "Tratamientos Médicos",
				resource: "tratamientos-medicos",
				href: "/dashboard/tratamientos-medicos",
				icon: Stethoscope,
			},
			{
				label: "Veterinarios",
				resource: "veterinarios",
				href: "/dashboard/veterinarios",
				icon: UserCheck,
			},
		],
	},
	{
		title: "Insumos",
		items: [
			{
				label: "Inventario de Insumos",
				resource: "inventario-insumos",
				href: "/dashboard/insumos",
				icon: Database,
			},
			{
				label: "Alimentación",
				resource: "alimentacion",
				href: "/dashboard/alimentacion",
				icon: Wheat,
			},
		],
	},
	{
		title: "Finanzas",
		hideIfNoAccess: true,
		items: [
			{
				label: "Comercial y Costos",
				resource: "comercial",
				href: "/dashboard/comercial",
				icon: DollarSign,
			},
		],
	},
	{
		title: "Administración",
		hideIfNoAccess: true,
		items: [
			{
				label: "Usuarios",
				resource: "users",
				href: "/dashboard/usuarios",
				icon: Shield,
			},
			{
				label: "Permisos",
				resource: "permissions",
				href: "/dashboard/permisos",
				icon: KeyRound,
			},
			{
				label: "Razas",
				resource: "razas",
				href: "/dashboard/razas",
				icon: Dna,
			},
		],
	},
];

// ─── Logo (compartido con Navbar) ─────────────────────────────────────────────

export function Logo() {
	return (
		<span className="size-8 rounded-lg bg-primary/10 border border-primary/25 text-primary flex items-center justify-center shrink-0">
			<Beef className="size-4.5" aria-hidden />
		</span>
	);
}

// ─── Item de navegación ───────────────────────────────────────────────────────

interface SidebarNavItemProps {
	item: SidebarItem;
	hasAccess: boolean;
	onNavigate?: () => void;
}

function SidebarNavItem({ item, hasAccess, onNavigate }: SidebarNavItemProps) {
	const Icon = item.icon;
	const isPlaceholder = item.href === "#";

	if (!hasAccess) {
		return (
			<div
				className="flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed select-none"
				title={`Sin permiso: ${item.label}`}
			>
				<Icon className="h-4 w-4 shrink-0" />
				<span className="flex-1 truncate">{item.label}</span>
				<Lock className="h-3 w-3 shrink-0 opacity-60" />
			</div>
		);
	}

	if (isPlaceholder) {
		return (
			<div
				className="flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm text-muted-foreground/60 cursor-not-allowed select-none"
				title={`${item.label} (próximamente)`}
			>
				<Icon className="h-4 w-4 shrink-0" />
				<span className="flex-1 truncate">{item.label}</span>
				<span className="text-[9px] text-muted-foreground/40 font-medium tracking-wide uppercase">
					Pronto
				</span>
			</div>
		);
	}

	return (
		<Link
			to={item.href}
			onClick={onNavigate}
			activeProps={{
				className:
					"bg-primary/10 text-primary font-semibold [&>svg]:text-primary before:absolute before:left-0 before:inset-y-1.5 before:w-0.5 before:rounded-full before:bg-primary",
			}}
			inactiveProps={{
				className:
					"text-muted-foreground hover:bg-accent hover:text-foreground",
			}}
			activeOptions={{ exact: item.href === "/dashboard" }}
			className="relative flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm transition-colors duration-150"
		>
			<Icon className="h-4 w-4 shrink-0" />
			<span className="flex-1 truncate">{item.label}</span>
		</Link>
	);
}

// ─── Contenido del Sidebar (compartido entre desktop y mobile) ────────────────

interface SidebarContentProps {
	onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
	const { can } = usePermissions();

	const hasPermission = (resource: string) => {
		if (resource === "") return true;
		return can(resource, "read");
	};

	return (
		<nav
			aria-label="Navegación principal"
			className="flex-1 py-4 px-3 space-y-5 overflow-y-auto overscroll-contain"
		>
			{SIDEBAR_GROUPS.map((group) => {
				// Grupos con hideIfNoAccess se ocultan completamente si no hay acceso a ningún item
				if (group.hideIfNoAccess) {
					const anyAccessible = group.items.some((item) =>
						hasPermission(item.resource),
					);
					if (!anyAccessible) return null;
				}

				return (
					<div key={group.title}>
						<p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 select-none">
							{group.title}
						</p>
						<ul className="space-y-0.5">
							{group.items.map((item) => (
								<li key={item.label}>
									<SidebarNavItem
										item={item}
										hasAccess={hasPermission(item.resource)}
										onNavigate={onNavigate}
									/>
								</li>
							))}
						</ul>
					</div>
				);
			})}
		</nav>
	);
}

// ─── Sidebar Desktop (fijo, visible desde md en adelante) ─────────────────────

export function Sidebar() {
	return (
		<aside className="hidden md:flex sticky top-16 h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-border bg-muted/20">
			<SidebarContent />
			<div className="px-4 py-3 border-t border-border">
				<p className="text-[10px] text-muted-foreground/40 text-center">
					v0.1.0
				</p>
			</div>
		</aside>
	);
}

// ─── Sidebar Mobile (Sheet/Drawer, visible solo en móvil) ─────────────────────

export function MobileSidebarTrigger({
	className,
}: {
	className?: string;
} = {}) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"md:hidden size-10 shrink-0 text-muted-foreground hover:text-foreground",
							className,
						)}
						aria-label="Abrir menú de navegación"
					/>
				}
			>
				<Menu className="h-5 w-5" />
			</SheetTrigger>
			<SheetContent
				side="left"
				className="w-72 max-w-[85vw] p-0 gap-0 flex flex-col"
			>
				<SheetHeader className="h-14 px-4 flex-row items-center gap-2.5 border-b border-border">
					<Logo />
					<SheetTitle className="text-left text-base font-extrabold tracking-tight">
						Sistema Ganadero
					</SheetTitle>
				</SheetHeader>
				<SidebarContent onNavigate={() => setOpen(false)} />
				<div className="px-4 py-3 border-t border-border">
					<p className="text-[10px] text-muted-foreground/40 text-center">
						v0.1.0
					</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}

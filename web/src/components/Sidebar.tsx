import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	Activity,
	Database,
	Dna,
	KeyRound,
	LayoutDashboard,
	Lock,
	Menu,
	Shield,
	Sprout,
	Stethoscope,
	Users,
	Warehouse,
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
			{ label: "Ganado", resource: "ganado", href: "#", icon: Sprout },
			{ label: "Ranchos", resource: "ranchos", href: "#", icon: Warehouse },
			{
				label: "Propietarios",
				resource: "propietario",
				href: "/dashboard/propietarios",
				icon: Users,
			},
			{ label: "Razas", resource: "razas", href: "#", icon: Dna },
		],
	},
	{
		title: "Sanidad",
		items: [
			{
				label: "Sesiones Sanitarias",
				resource: "sesiones-sanitarias",
				href: "#",
				icon: Activity,
			},
			{
				label: "Tratamientos Médicos",
				resource: "tratamientos-medicos",
				href: "#",
				icon: Stethoscope,
			},
		],
	},
	{
		title: "Insumos",
		items: [
			{
				label: "Inventario de Insumos",
				resource: "inventario-insumos",
				href: "#",
				icon: Database,
			},
		],
	},
	{
		title: "Administración",
		hideIfNoAccess: true,
		items: [
			{ label: "Usuarios", resource: "users", href: "#", icon: Shield },
			{
				label: "Permisos",
				resource: "permissions",
				href: "#",
				icon: KeyRound,
			},
		],
	},
];

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
				className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground/50 cursor-not-allowed select-none"
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
				className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground/60 cursor-not-allowed select-none"
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
					"bg-primary/10 text-primary font-semibold [&>svg]:text-primary",
			}}
			inactiveProps={{
				className:
					"text-muted-foreground hover:bg-accent hover:text-foreground",
			}}
			activeOptions={{ exact: item.href === "/dashboard" }}
			className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150"
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
	const permissions = useAuthStore((state) => state.permissions) ?? [];

	const hasPermission = (resource: string) => {
		if (resource === "") return true;
		return permissions.includes(`${resource}:read`);
	};

	return (
		<nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
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
						<p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
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
		<aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-background/60 min-h-[calc(100vh-4rem)]">
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

export function MobileSidebarTrigger() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
						aria-label="Abrir menú de navegación"
					/>
				}
			>
				<Menu className="h-5 w-5" />
			</SheetTrigger>
			<SheetContent side="left" className="w-64 p-0 flex flex-col">
				<SheetHeader className="px-4 py-4 border-b border-border">
					<SheetTitle className="text-left text-base font-bold">
						🐮 Sistema Ganadero
					</SheetTitle>
				</SheetHeader>
				<div className="flex-1 overflow-y-auto">
					<SidebarContent onNavigate={() => setOpen(false)} />
				</div>
				<div className="px-4 py-3 border-t border-border">
					<p className="text-[10px] text-muted-foreground/40 text-center">
						v0.1.0
					</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}

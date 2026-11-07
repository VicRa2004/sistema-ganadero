import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { MobileSidebarTrigger } from "@/components/Sidebar";
import {
	Sun,
	Moon,
	LogOut,
	Loader2,
	LayoutDashboard,
	Search,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLOW_PUBLIC_REGISTER } from "@/config/features";

export function Navbar() {
	const user = useAuthStore((state) => state.user);
	const accessToken = useAuthStore((state) => state.accessToken);
	const isAuthenticated = !!accessToken;

	const navigate = useNavigate();
	const permissions = useAuthStore((state) => state.permissions) ?? [];
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const [showMobileSearch, setShowMobileSearch] = useState(false);

	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const saved = localStorage.getItem("theme");
		if (saved === "light" || saved === "dark") return saved;
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	});

	useEffect(() => {
		const root = window.document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
			<div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{showMobileSearch ? (
					/* Vista expandida de búsqueda en móvil */
					<div className="flex-1 flex items-center gap-2">
						<form
							className="relative flex-1 flex items-center"
							onSubmit={(e) => {
								e.preventDefault();
								const campo = e.currentTarget.elements.namedItem(
									"arete",
								) as HTMLInputElement;
								const val = campo.value.trim();
								if (val) {
									navigate({
										to: "/dashboard/ganado",
										search: { identificador: val },
									});
									setShowMobileSearch(false);
								}
							}}
						>
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								name="arete"
								type="search"
								autoFocus
								aria-label="Buscar ganado por arete"
								placeholder="Buscar por arete (Ej: AR-01)..."
								className="h-9 w-full pl-8 pr-8 text-xs"
							/>
						</form>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setShowMobileSearch(false)}
							aria-label="Cerrar búsqueda"
							className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<>
						{/* Lado izquierdo: Hamburger (móvil) + Logo */}
						<div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
							{isAuthenticated && <MobileSidebarTrigger />}

							<Link
								to="/"
								className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-95 transition-opacity min-w-0"
							>
								<div className="size-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shadow-xs shrink-0">
									<span className="text-base select-none leading-none">🐮</span>
								</div>
								<div className="flex flex-col leading-none text-left min-w-0">
									<span className="text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate">
										Sistema Ganadero
									</span>
									<span className="hidden sm:inline text-[10px] font-semibold text-primary tracking-wider uppercase">
										Gestión Bovina
									</span>
								</div>
							</Link>
						</div>

						{/* Lado derecho — Búsqueda, Dashboard, Tema y Auth */}
						<div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
							{/* Botón de búsqueda para móvil */}
							{isAuthenticated && permissions.includes("ganado:read") && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowMobileSearch(true)}
									className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
									aria-label="Buscar ganado por arete"
									title="Buscar ganado por arete"
								>
									<Search className="h-4 w-4" />
								</Button>
							)}

							{/* Buscador de escritorio/tablet */}
							{isAuthenticated && permissions.includes("ganado:read") && (
								<search className="hidden sm:block">
									<form
										className="relative"
										onSubmit={(e) => {
											e.preventDefault();
											const campo = e.currentTarget.elements.namedItem(
												"arete",
											) as HTMLInputElement;
											const val = campo.value.trim();
											if (val) {
												navigate({
													to: "/dashboard/ganado",
													search: { identificador: val },
												});
											}
										}}
									>
										<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											name="arete"
											type="search"
											aria-label="Buscar ganado por arete"
											placeholder="Arete..."
											className="h-9 w-28 md:w-44 pl-8 text-xs"
										/>
									</form>
								</search>
							)}

							{/* Acceso a Dashboard en escritorio */}
							{isAuthenticated && (
								<Link to="/dashboard" className="hidden md:inline-flex">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="gap-1.5 cursor-pointer h-9 text-xs"
									>
										<LayoutDashboard className="h-3.5 w-3.5" />
										<span>Dashboard</span>
									</Button>
								</Link>
							)}

							{/* Toggle de tema */}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={toggleTheme}
								aria-label="Alternar modo oscuro"
								className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground cursor-pointer"
							>
								{theme === "dark" ? (
									<Sun className="h-4 w-4" />
								) : (
									<Moon className="h-4 w-4" />
								)}
							</Button>

							{isAuthenticated ? (
								<div className="flex items-center gap-1.5 sm:gap-3">
									{/* Perfil del usuario */}
									<Link
										to="/dashboard/perfil"
										aria-label="Mi perfil"
										className="flex items-center gap-2 group"
									>
										<div className="hidden lg:flex flex-col items-end text-right leading-none gap-0.5">
											<span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
												{user?.name || "Usuario"}
											</span>
											<span
												className="text-[10px] text-muted-foreground max-w-[120px] truncate"
												title={user?.email}
											>
												{user?.email || "sin correo"}
											</span>
										</div>
										<div
											className={cn(
												"h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold select-none border shadow-xs shrink-0 transition-transform group-hover:scale-105",
												user?.role === "ADMIN"
													? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
													: "bg-primary/10 border-primary/20 text-primary",
											)}
											title={
												user?.role === "ADMIN"
													? "Rol: Administrador"
													: "Rol: Usuario Estándar"
											}
										>
											{userInitial}
										</div>
									</Link>

									{/* Cerrar Sesión */}
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-1.5 cursor-pointer h-8 sm:h-9 text-xs px-2 sm:px-3"
										onClick={() => logout()}
										disabled={isLoggingOut}
										title="Cerrar Sesión"
									>
										{isLoggingOut ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<LogOut className="h-3.5 w-3.5" />
										)}
										<span className="hidden sm:inline">Cerrar Sesión</span>
									</Button>
								</div>
							) : (
								<div className="flex items-center gap-1.5 sm:gap-2">
									<Link to="/login">
										<Button
											variant="ghost"
											size="sm"
											className="cursor-pointer text-xs h-8 sm:h-9 px-2 sm:px-3"
										>
											Iniciar Sesión
										</Button>
									</Link>
									{ALLOW_PUBLIC_REGISTER && (
										<Link to="/register">
											<Button
												size="sm"
												className="cursor-pointer text-xs h-8 sm:h-9 px-2 sm:px-3 shadow-xs"
											>
												Registrarse
											</Button>
										</Link>
									)}
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</header>
	);
}

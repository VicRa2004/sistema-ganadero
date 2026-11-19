import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { MobileSidebarTrigger, Logo } from "@/components/Sidebar";
import { NotificacionesBell } from "@/components/notificacion/NotificacionesBell";
import {
	Sun,
	Moon,
	LogOut,
	Loader2,
	LayoutDashboard,
	Search,
	X,
	UserRound,
	ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLOW_PUBLIC_REGISTER } from "@/config/features";

type Theme = "light" | "dark";

function useTheme() {
	const [theme, setTheme] = useState<Theme>(() =>
		document.documentElement.classList.contains("dark") ? "dark" : "light",
	);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			localStorage.setItem("theme", theme);
		} catch {
			// almacenamiento bloqueado: el tema solo dura esta sesión
		}
	}, [theme]);

	return {
		theme,
		toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
	};
}

export function Navbar() {
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => !!state.accessToken);

	const navigate = useNavigate();
	const { can } = usePermissions();
	const canSearch = isAuthenticated && can("ganado", "read");
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const { theme, toggleTheme } = useTheme();

	const buscarArete = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const campo = e.currentTarget.elements.namedItem(
			"arete",
		) as HTMLInputElement;
		const val = campo.value.trim();
		if (!val) return;
		navigate({ to: "/dashboard/ganado", search: { identificador: val } });
		setShowMobileSearch(false);
	};

	const isAdmin = user?.role === "ADMIN";
	const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
	const ThemeIcon = theme === "dark" ? Sun : Moon;

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70">
			<div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-2">
				{showMobileSearch ? (
					<search className="flex-1 flex items-center gap-2 sm:hidden">
						<form className="relative flex-1" onSubmit={buscarArete}>
							<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								name="arete"
								type="search"
								autoFocus
								aria-label="Buscar ganado por arete"
								placeholder="Buscar por arete (Ej: AR-01)"
								className="h-10 w-full pl-9"
							/>
						</form>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setShowMobileSearch(false)}
							aria-label="Cerrar búsqueda"
							className="size-10 shrink-0"
						>
							<X className="size-5" />
						</Button>
					</search>
				) : (
					<>
						{/* Izquierda: menú (móvil) + logo */}
						<div className="flex items-center gap-1 min-w-0 flex-1">
							{isAuthenticated && <MobileSidebarTrigger />}
							<Link
								to="/"
								className="flex items-center gap-2.5 min-w-0 rounded-md hover:opacity-90 transition-opacity"
							>
								<Logo />
								<span className="flex flex-col leading-none min-w-0">
									<span className="text-[15px] sm:text-base font-extrabold tracking-tight truncate">
										Sistema Ganadero
									</span>
									<span className="hidden sm:block mt-0.5 text-[10px] font-semibold text-primary tracking-wider uppercase">
										Gestión Bovina
									</span>
								</span>
							</Link>
						</div>

						{/* Derecha */}
						<div className="flex items-center gap-1 sm:gap-2 shrink-0">
							{canSearch && (
								<>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setShowMobileSearch(true)}
										className="sm:hidden size-10 text-muted-foreground hover:text-foreground"
										aria-label="Buscar ganado por arete"
									>
										<Search className="size-5" />
									</Button>
									<search className="hidden sm:block">
										<form className="relative" onSubmit={buscarArete}>
											<Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
											<Input
												name="arete"
												type="search"
												aria-label="Buscar ganado por arete"
												placeholder="Buscar arete..."
												className="h-9 w-36 md:w-52 pl-8 text-sm"
											/>
										</form>
									</search>
								</>
							)}

							{isAuthenticated && <NotificacionesBell />}

							{isAuthenticated ? (
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="ghost"
												className="h-10 gap-2 pl-1 pr-1 sm:pr-2 rounded-full"
												aria-label="Menú de usuario"
											/>
										}
									>
										<span
											className={cn(
												"size-8 rounded-full flex items-center justify-center text-xs font-bold select-none border shrink-0",
												isAdmin
													? "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400"
													: "bg-primary/10 border-primary/25 text-primary",
											)}
										>
											{userInitial}
										</span>
										<span className="hidden lg:block max-w-32 truncate text-sm font-semibold">
											{user?.name || "Usuario"}
										</span>
										<ChevronDown className="hidden sm:block size-4 text-muted-foreground" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-60">
										<DropdownMenuGroup>
											<DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2">
												<span className="text-sm font-semibold text-foreground truncate">
													{user?.name || "Usuario"}
												</span>
												<span className="text-xs font-normal truncate">
													{user?.email || "sin correo"}
												</span>
												<span
													className={cn(
														"mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
														isAdmin
															? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
															: "bg-primary/10 text-primary",
													)}
												>
													{isAdmin ? "Administrador" : "Usuario"}
												</span>
											</DropdownMenuLabel>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="py-2"
											render={<Link to="/dashboard" />}
										>
											<LayoutDashboard />
											Dashboard
										</DropdownMenuItem>
										<DropdownMenuItem
											className="py-2"
											render={<Link to="/dashboard/perfil" />}
										>
											<UserRound />
											Mi perfil
										</DropdownMenuItem>
										<DropdownMenuItem
											className="py-2"
											closeOnClick={false}
											onClick={toggleTheme}
										>
											<ThemeIcon />
											{theme === "dark" ? "Modo claro" : "Modo oscuro"}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="py-2"
											variant="destructive"
											disabled={isLoggingOut}
											onClick={() => logout()}
										>
											{isLoggingOut ? (
												<Loader2 className="animate-spin" />
											) : (
												<LogOut />
											)}
											Cerrar sesión
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={toggleTheme}
										aria-label={
											theme === "dark"
												? "Activar modo claro"
												: "Activar modo oscuro"
										}
										className="size-10 text-muted-foreground hover:text-foreground"
									>
										<ThemeIcon className="size-5" />
									</Button>
									<Button
										variant="ghost"
										nativeButton={false}
										render={<Link to="/login" />}
									>
										Iniciar sesión
									</Button>
									{ALLOW_PUBLIC_REGISTER && (
										<Button
											nativeButton={false}
											render={<Link to="/register" />}
										>
											Registrarse
										</Button>
									)}
								</>
							)}
						</div>
					</>
				)}
			</div>
		</header>
	);
}

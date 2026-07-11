import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { Sun, Moon, LogOut, Loader2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
	const user = useAuthStore((state) => state.user);
	const accessToken = useAuthStore((state) => state.accessToken);
	const isAuthenticated = !!accessToken;

	const { mutate: logout, isPending: isLoggingOut } = useLogout();

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
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Logo */}
				<Link
					to="/"
					className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity"
				>
					🐮 Sistema Ganadero
				</Link>

				{/* Lado derecho — Tema y Auth */}
				<div className="flex items-center gap-4">
					{/* Toggle de tema */}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						aria-label="Alternar modo oscuro"
						className="text-muted-foreground hover:text-foreground cursor-pointer"
					>
						{theme === "dark" ? <Sun /> : <Moon />}
					</Button>

					{isAuthenticated ? (
						<div className="flex items-center gap-4">
							<Link to="/dashboard">
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

							{/* Perfil del usuario */}
							<div className="flex items-center gap-2.5">
								<div className="hidden sm:flex flex-col items-end text-right leading-none gap-0.5">
									<span className="text-xs font-bold text-foreground">
										{user?.name || "Usuario"}
									</span>
									<span
										className="text-[10px] text-muted-foreground max-w-[140px] truncate"
										title={user?.email}
									>
										{user?.email || "sin correo"}
									</span>
								</div>
								<div
									className={cn(
										"h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold select-none border shadow-sm",
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
							</div>

							{/* Cerrar Sesión */}
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5 cursor-pointer h-9 text-xs"
								onClick={() => logout()}
								disabled={isLoggingOut}
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
						<div className="flex items-center gap-2">
							<Link to="/login">
								<Button
									variant="ghost"
									size="sm"
									className="cursor-pointer text-xs h-9"
								>
									Iniciar Sesión
								</Button>
							</Link>
							<Link to="/register">
								<Button
									size="sm"
									className="cursor-pointer text-xs h-9 shadow-sm"
								>
									Registrarse
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

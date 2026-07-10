import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function Navbar() {
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

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<Link
						to="/"
						className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity"
					>
						🐮 Sistema Ganadero
					</Link>
					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/"
							activeProps={{ className: "text-primary font-semibold" }}
							inactiveProps={{
								className: "text-muted-foreground hover:text-foreground",
							}}
							activeOptions={{ exact: true }}
							className="text-sm transition-colors"
						>
							Inicio
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-4">
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
					<div className="h-8 w-8 rounded-full bg-accent border border-border flex items-center justify-center text-sm font-semibold text-accent-foreground">
						U
					</div>
				</div>
			</div>
		</header>
	);
}

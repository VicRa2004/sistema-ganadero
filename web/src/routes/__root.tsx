import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";

import type { UserDto } from "@/modules/auth/types";

export interface RouterAuthContext {
	isAuthenticated: boolean;
	accessToken: string | null;
	user: UserDto | null;
}

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	auth: RouterAuthContext;
}>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
			<a
				href="#contenido"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
			>
				Saltar al contenido
			</a>

			{/* Navbar Principal */}
			<Navbar />

			{/* Main Content Area */}
			<main
				id="contenido"
				tabIndex={-1}
				className="flex-1 outline-none max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
			>
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t border-border bg-card/60 backdrop-blur-xs py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span className="font-semibold text-foreground">
							🐮 Sistema Ganadero
						</span>
						<span>·</span>
						<span>Trazabilidad Bovina y Gestión Agropecuaria de Precisión</span>
					</div>
					<div className="flex gap-4 text-xs text-muted-foreground">
						<span>v0.1.0</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

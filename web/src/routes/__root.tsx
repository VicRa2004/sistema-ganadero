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
			{/* Navbar Principal */}
			<Navbar />

			{/* Main Content Area */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t border-border bg-background py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} Sistema Ganadero. Todos los
						derechos reservados.
					</p>
					<div className="flex gap-4 text-xs text-muted-foreground">
						<span>v0.1.0</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

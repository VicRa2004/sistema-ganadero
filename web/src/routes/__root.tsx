import {
	createRootRouteWithContext,
	Link,
	Outlet,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
			{/* Navbar */}
			<header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
						>
							🐮 Sistema Ganadero
						</Link>
						<nav className="hidden md:flex items-center gap-6">
							<Link
								to="/"
								activeProps={{ className: "text-indigo-400 font-semibold" }}
								inactiveProps={{
									className: "text-slate-400 hover:text-slate-200",
								}}
								activeOptions={{ exact: true }}
								className="text-sm transition-colors"
							>
								Dashboard
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-4">
						<div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-sm font-semibold text-indigo-300">
							U
						</div>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t border-slate-900 bg-slate-950 py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-xs text-slate-500">
						&copy; {new Date().getFullYear()} Sistema Ganadero. Todos los
						derechos reservados.
					</p>
					<div className="flex gap-4 text-xs text-slate-500">
						<span>v0.1.0</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { Sidebar, MobileSidebarTrigger } from "@/components/Sidebar";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	const isAuthenticated = useAuthStore((state) => !!state.accessToken);

	if (!isAuthenticated) return null;

	return (
		// Compensar el padding horizontal del <main> en __root.tsx
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 flex flex-col min-h-[calc(100vh-4rem)]">
			{/* Barra superior mobile — solo visible en pantallas < md */}
			<div className="md:hidden flex items-center gap-3 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm">
				<MobileSidebarTrigger />
				<span className="text-sm font-semibold text-foreground">Menú</span>
			</div>

			{/* Layout de dos columnas (sidebar + contenido) */}
			<div className="flex flex-1 min-h-0">
				{/* Sidebar fijo — solo visible desde md */}
				<Sidebar />

				{/* Área de contenido principal */}
				<div className="flex-1 min-w-0 px-4 sm:px-6 py-6 overflow-auto">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

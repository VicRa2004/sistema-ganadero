import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { Sidebar } from "@/components/Sidebar";

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
		// Compensar el padding de <main> en __root.tsx para que el layout conecte directamente con el navbar
		<div className="-my-8 -mx-4 sm:-mx-6 lg:-mx-8 flex flex-col min-h-[calc(100vh-4rem)]">
			{/* Layout de dos columnas (sidebar + contenido) */}
			<div className="flex flex-1 min-h-0">
				{/* Sidebar fijo — solo visible desde md */}
				<Sidebar />

				{/* Área de contenido principal */}
				{/* Sin padding superior: cada página ya trae el suyo */}
				<div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pb-8">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

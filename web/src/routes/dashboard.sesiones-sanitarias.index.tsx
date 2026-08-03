import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { SesionesSanitariasTable } from "@/components/sesion-sanitaria/SesionesSanitariasTable";

export const Route = createFileRoute("/dashboard/sesiones-sanitarias/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("sesiones-sanitarias:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: SesionesSanitariasComponent,
});

function SesionesSanitariasComponent() {
	return (
		<div className="py-6 animate-fade-in">
			<SesionesSanitariasTable />
		</div>
	);
}

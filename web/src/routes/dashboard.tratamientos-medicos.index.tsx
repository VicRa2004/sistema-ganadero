import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { TratamientoMedicoTable } from "@/components/tratamiento-medico/TratamientoMedicoTable";

export const Route = createFileRoute("/dashboard/tratamientos-medicos/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		const permissions: string[] = useAuthStore.getState().permissions ?? [];
		if (!permissions.includes("tratamientos-medicos:read")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: TratamientosMedicosComponent,
});

function TratamientosMedicosComponent() {
	return (
		<div className="py-6 animate-fade-in">
			<TratamientoMedicoTable />
		</div>
	);
}

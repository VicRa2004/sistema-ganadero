import { createFileRoute } from "@tanstack/react-router";
import { TratamientoMedicoTable } from "@/components/tratamiento-medico/TratamientoMedicoTable";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";

export const Route = createFileRoute("/dashboard/tratamientos-medicos/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "tratamientos-medicos", "read");
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

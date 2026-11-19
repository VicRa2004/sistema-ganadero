import { createFileRoute } from "@tanstack/react-router";
import { SesionesSanitariasTable } from "@/components/sesion-sanitaria/SesionesSanitariasTable";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";

export const Route = createFileRoute("/dashboard/sesiones-sanitarias/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "sesiones-sanitarias", "read");
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

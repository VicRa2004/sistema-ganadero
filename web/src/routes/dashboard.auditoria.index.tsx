import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
import { ListaEstado } from "@/components/ListaEstado";
import { Paginacion } from "@/components/Paginacion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { requireAuthAndPermission } from "@/modules/auth/guards/permissionGuard";
import { useListarAuditoria } from "@/modules/auditoria/hooks/useListarAuditoria";
import type { MetodoAuditoria } from "@/modules/auditoria/types";

export const Route = createFileRoute("/dashboard/auditoria/")({
	beforeLoad: async ({ context }) => {
		await requireAuthAndPermission(context, "auditoria", "read");
	},
	component: AuditoriaComponent,
});

const PAGE_SIZE = 25;

function AuditoriaComponent() {
	const [page, setPage] = useState(1);
	const [metodo, setMetodo] = useState<MetodoAuditoria | "">("");
	const [ruta, setRuta] = useState("");
	const { data, isLoading, isError } = useListarAuditoria({
		page,
		limit: PAGE_SIZE,
		metodo: metodo || undefined,
		ruta,
	});

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			<section className="flex items-center gap-3 pb-6 border-b border-border">
				<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
					<ScrollText className="size-5" />
				</div>
				<div className="text-left">
					<h1 className="text-2xl font-extrabold tracking-tight">Auditoría</h1>
					<p className="text-sm text-muted-foreground">
						Cambios realizados por los usuarios en el sistema
					</p>
				</div>
			</section>

			<div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
				<CampoSelect
					id="filtro-metodo"
					label="Operación"
					value={metodo}
					onChange={(e) => {
						setMetodo(e.target.value as MetodoAuditoria | "");
						setPage(1);
					}}
				>
					<option value="">Todas</option>
					<option value="POST">Creación (POST)</option>
					<option value="PUT">Edición (PUT)</option>
					<option value="PATCH">Edición parcial (PATCH)</option>
					<option value="DELETE">Eliminación (DELETE)</option>
				</CampoSelect>
				<div className="space-y-1.5">
					<Label htmlFor="filtro-ruta">Ruta contiene</Label>
					<Input
						id="filtro-ruta"
						placeholder="/api/ganado"
						value={ruta}
						onChange={(e) => {
							setRuta(e.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<ListaEstado isLoading={isLoading} isError={isError} />

			{data && (
				<div className="overflow-x-auto rounded-xl border border-border">
					<Table className="min-w-[700px]">
						<TableHeader>
							<TableRow>
								<TableHead>Fecha</TableHead>
								<TableHead>Usuario</TableHead>
								<TableHead>Operación</TableHead>
								<TableHead>Ruta</TableHead>
								<TableHead>IP</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.data.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-10 text-center text-muted-foreground"
									>
										Sin registros.
									</TableCell>
								</TableRow>
							)}
							{data.data.map((r) => (
								<TableRow key={r.id}>
									<TableCell className="whitespace-nowrap">
										{new Date(r.fecha).toLocaleString()}
									</TableCell>
									<TableCell>
										{r.usuario ? (
											<>
												<span className="font-medium">{r.usuario.nombre}</span>
												<span className="block text-xs text-muted-foreground">
													{r.usuario.email}
												</span>
											</>
										) : (
											<span className="text-muted-foreground">
												Usuario eliminado
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												r.metodo === "DELETE" ? "destructive" : "secondary"
											}
										>
											{r.metodo}
										</Badge>
									</TableCell>
									<TableCell className="font-mono text-xs break-all">
										{r.ruta}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{r.ip ?? "—"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{data && data.data.length > 0 && (
				<Paginacion
					page={page}
					totalPages={data.totalPages}
					onChange={setPage}
				/>
			)}
		</div>
	);
}

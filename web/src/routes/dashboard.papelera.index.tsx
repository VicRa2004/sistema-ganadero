import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Trash, Trash2 } from "lucide-react";
import { ConfirmarDialog } from "@/components/ConfirmarDialog";
import { ListaEstado } from "@/components/ListaEstado";
import { Paginacion } from "@/components/Paginacion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";
import {
	useEliminarDefinitivo,
	useListarPapelera,
	useRestaurarElemento,
} from "@/modules/papelera/hooks/usePapelera";
import {
	type ElementoPapeleraDto,
	TIPOS_PAPELERA,
	type TipoPapelera,
} from "@/modules/papelera/types";

export const Route = createFileRoute("/dashboard/papelera/")({
	component: PapeleraComponent,
});

const fecha = (iso: string) => new Date(iso).toLocaleDateString();

function TablaPapelera({ tipo }: { tipo: TipoPapelera }) {
	const { can } = usePermissions();
	const recurso = TIPOS_PAPELERA.find((t) => t.tipo === tipo)?.recurso ?? "";
	const [page, setPage] = useState(1);
	const { data, isLoading, isError } = useListarPapelera(tipo, page);
	const { mutate: restaurar, isPending: restaurando } = useRestaurarElemento();
	const { mutate: eliminar, isPending: eliminando } = useEliminarDefinitivo();
	const [aEliminar, setAEliminar] = useState<ElementoPapeleraDto | null>(null);

	return (
		<div className="space-y-4">
			<ListaEstado isLoading={isLoading} isError={isError} />

			{data && (
				<div className="overflow-x-auto rounded-xl border border-border">
					<Table className="min-w-[600px]">
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Eliminado</TableHead>
								<TableHead>Se borra el</TableHead>
								<TableHead className="w-24 text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.data.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-10 text-center text-muted-foreground"
									>
										La papelera está vacía.
									</TableCell>
								</TableRow>
							)}
							{data.data.map((e) => (
								<TableRow key={e.id}>
									<TableCell className="font-medium">
										{e.nombre}
										{e.dependeDeEliminado && (
											<Badge variant="outline" className="ml-2">
												Depende de un elemento eliminado
											</Badge>
										)}
									</TableCell>
									<TableCell>{fecha(e.eliminadoEn)}</TableCell>
									<TableCell>{fecha(e.purgaEn)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											{can(recurso, "update") && (
												<Button
													variant="ghost"
													size="icon"
													title={
														e.dependeDeEliminado
															? "Restaura antes el elemento del que depende"
															: "Restaurar"
													}
													aria-label={`Restaurar ${e.nombre}`}
													disabled={restaurando || e.dependeDeEliminado}
													onClick={() => restaurar({ tipo, id: e.id })}
												>
													<RotateCcw className="size-4" />
												</Button>
											)}
											{can(recurso, "delete") && (
												<Button
													variant="ghost"
													size="icon"
													title="Eliminar definitivamente"
													aria-label={`Eliminar definitivamente ${e.nombre}`}
													onClick={() => setAEliminar(e)}
												>
													<Trash2 className="size-4" />
												</Button>
											)}
										</div>
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

			<ConfirmarDialog
				open={aEliminar !== null}
				onOpenChange={(o) => !o && setAEliminar(null)}
				titulo="Eliminar definitivamente"
				descripcion={
					<>
						<strong>{aEliminar?.nombre}</strong> se borrará para siempre y no se
						podrá recuperar. Si aún tiene historial asociado, el sistema lo
						impedirá.
					</>
				}
				isPending={eliminando}
				accion="Eliminar definitivamente"
				onConfirm={() =>
					aEliminar &&
					eliminar(
						{ tipo, id: aEliminar.id },
						{ onSettled: () => setAEliminar(null) },
					)
				}
			/>
		</div>
	);
}

function PapeleraComponent() {
	const { can } = usePermissions();
	const visibles = TIPOS_PAPELERA.filter((t) => can(t.recurso, "read"));
	const [tipo, setTipo] = useState<TipoPapelera | undefined>(visibles[0]?.tipo);
	const actual = visibles.some((t) => t.tipo === tipo)
		? tipo
		: visibles[0]?.tipo;

	return (
		<div className="space-y-8 py-6 animate-fade-in">
			<section className="flex items-center gap-3 pb-6 border-b border-border">
				<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
					<Trash className="size-5" />
				</div>
				<div className="text-left">
					<h1 className="text-2xl font-extrabold tracking-tight">Papelera</h1>
					<p className="text-sm text-muted-foreground">
						Lo eliminado se puede restaurar durante 30 días; después se borra
						automáticamente.
					</p>
				</div>
			</section>

			{actual ? (
				<>
					<Tabs
						value={actual}
						onValueChange={(v) => setTipo(v as TipoPapelera)}
					>
						<div className="overflow-x-auto">
							<TabsList>
								{visibles.map((t) => (
									<TabsTrigger
										key={t.tipo}
										value={t.tipo}
										className="cursor-pointer"
									>
										{t.etiqueta}
									</TabsTrigger>
								))}
							</TabsList>
						</div>
					</Tabs>
					<TablaPapelera key={actual} tipo={actual} />
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					No tienes acceso a ningún módulo con papelera.
				</p>
			)}
		</div>
	);
}

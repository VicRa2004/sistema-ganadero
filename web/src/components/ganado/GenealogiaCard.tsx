import { Link } from "@tanstack/react-router";
import { GitBranch, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useObtenerGenealogia } from "@/modules/ganado/hooks/useObtenerGenealogia";
import type { NodoGenealogiaDto } from "@/modules/ganado/types";
import { cn } from "@/lib/utils";

function NodoTarjeta({
	nodo,
	rol,
	esRaiz = false,
}: {
	nodo: NodoGenealogiaDto | null;
	rol: string;
	esRaiz?: boolean;
}) {
	if (!nodo) {
		return (
			<div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
				<span className="block font-medium uppercase tracking-wide text-[10px]">
					{rol}
				</span>
				<span>Sin registro</span>
			</div>
		);
	}

	const estiloSexo =
		nodo.sexo === "MACHO"
			? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
			: "border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10";

	const contenido = (
		<div
			className={cn(
				"rounded-lg border px-3 py-2 transition-colors",
				esRaiz ? "border-primary/40 bg-primary/5" : estiloSexo,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
					{rol}
				</span>
				<Badge variant="outline" className="text-[10px] px-1.5 py-0">
					{nodo.sexo === "MACHO" ? "M" : "H"}
				</Badge>
			</div>
			<p className="text-sm font-bold text-foreground truncate">
				{nodo.identificador}
			</p>
			<p className="text-[11px] text-muted-foreground truncate">
				{nodo.razaNombre} · {nodo.peso} kg
			</p>
		</div>
	);

	if (esRaiz) return contenido;

	return (
		<Link
			to="/dashboard/ganado/$id"
			params={{ id: String(nodo.id) }}
			className="block"
		>
			{contenido}
		</Link>
	);
}

function RamaAncestro({
	nodo,
	rol,
	nivel,
}: {
	nodo: NodoGenealogiaDto | null;
	rol: string;
	nivel: number;
}) {
	if (nivel <= 0) return null;
	return (
		<div className="space-y-2">
			<NodoTarjeta nodo={nodo} rol={rol} />
			{nodo && nivel > 1 && (nodo.padre || nodo.madre) && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 border-l-2 border-border">
					<RamaAncestro nodo={nodo.padre} rol="Padre" nivel={nivel - 1} />
					<RamaAncestro nodo={nodo.madre} rol="Madre" nivel={nivel - 1} />
				</div>
			)}
		</div>
	);
}

export function GenealogiaCard({ ganadoId }: { ganadoId: number }) {
	const { data, isLoading, isError } = useObtenerGenealogia(ganadoId, 3);

	return (
		<Card className="border border-border bg-card/60 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<GitBranch className="size-4 text-primary" />
					Genealogía y descendencia
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{isLoading && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Cargando árbol genealógico...
					</div>
				)}
				{isError && (
					<p className="text-sm text-destructive">
						No se pudo cargar la genealogía.
					</p>
				)}
				{data && (
					<>
						<div className="space-y-3">
							<NodoTarjeta nodo={data.animal} rol="Animal actual" esRaiz />
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
								<RamaAncestro
									nodo={data.animal.padre}
									rol="Padre"
									nivel={data.generaciones}
								/>
								<RamaAncestro
									nodo={data.animal.madre}
									rol="Madre"
									nivel={data.generaciones}
								/>
							</div>
						</div>

						<div className="space-y-2 pt-2 border-t border-border">
							<h4 className="text-sm font-semibold flex items-center gap-2">
								<Users className="size-4 text-primary" />
								Descendencia directa ({data.descendencia.length})
							</h4>
							{data.descendencia.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Sin crías registradas.
								</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
									{data.descendencia.map((cria) => (
										<Link
											key={cria.id}
											to="/dashboard/ganado/$id"
											params={{ id: String(cria.id) }}
											className="rounded-lg border border-border bg-card p-3 hover:bg-muted/40 transition-colors"
										>
											<div className="flex items-center justify-between gap-2">
												<span className="font-semibold text-sm text-foreground">
													{cria.identificador}
												</span>
												<Badge variant="outline" className="text-xs">
													{cria.sexo}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												{cria.razaNombre} · {cria.peso} kg · Nac.{" "}
												{cria.fechaNacimiento}
											</p>
										</Link>
									))}
								</div>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

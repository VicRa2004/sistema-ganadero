import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, FileQuestion } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/** Se muestra cuando una ruta lanza un error: aísla el fallo sin tumbar el resto de la app */
export function RouteError({ error, reset }: ErrorComponentProps) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center gap-4 py-24 text-center"
		>
			<AlertTriangle className="size-10 text-destructive" />
			<h1 className="text-xl font-bold">Algo salió mal</h1>
			<p className="max-w-md text-sm text-muted-foreground">
				{error.message || "Ocurrió un error inesperado."}
			</p>
			<div className="flex gap-2">
				<Button variant="outline" onClick={reset}>
					Reintentar
				</Button>
				<Link to="/dashboard" className={buttonVariants()}>
					Ir al inicio
				</Link>
			</div>
		</div>
	);
}

export function NotFound() {
	return (
		<div className="flex flex-col items-center gap-4 py-24 text-center">
			<FileQuestion className="size-10 text-muted-foreground" />
			<h1 className="text-xl font-bold">Página no encontrada</h1>
			<p className="text-sm text-muted-foreground">
				La dirección no existe o fue movida.
			</p>
			<Link to="/dashboard" className={buttonVariants()}>
				Ir al inicio
			</Link>
		</div>
	);
}

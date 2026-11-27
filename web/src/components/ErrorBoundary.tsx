import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { reportarError } from "@/config/monitoreo";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

/**
 * Red de seguridad global para errores no capturados fuera de las rutas
 * (providers, router o raíz de la aplicación).
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(error, info.componentStack);
		reportarError(error);
	}

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<div
				role="alert"
				className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center"
			>
				<AlertTriangle className="size-10 text-destructive" />
				<h1 className="text-xl font-bold">Algo salió mal</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					Ocurrió un error inesperado en la aplicación. Recarga la página para
					continuar.
				</p>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Recargar página
				</Button>
			</div>
		);
	}
}

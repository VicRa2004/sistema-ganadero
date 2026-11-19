import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractErrorMessages } from "@/lib/formAccessibility";

interface CampoTextoProps extends Omit<InputProps, "id"> {
	id: string;
	label: string;
	/** Errores del campo (TanStack Form + Zod entrega objetos con `message`) */
	errors?: unknown[];
}

/** Etiqueta + input + mensajes de validación, con aria-invalid explícito para lectores de pantalla */
export function CampoTexto({
	id,
	label,
	errors = [],
	...props
}: CampoTextoProps) {
	const mensajes = extractErrorMessages(errors);
	const esInvalido = mensajes.length > 0;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				name={id}
				aria-invalid={esInvalido ? "true" : "false"}
				aria-describedby={esInvalido ? `${id}-error` : undefined}
				{...props}
			/>
			{esInvalido && (
				<p id={`${id}-error`} className="text-xs font-medium text-destructive">
					{mensajes.join(", ")}
				</p>
			)}
		</div>
	);
}

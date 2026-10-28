import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CampoTextoProps extends Omit<InputProps, "id"> {
	id: string;
	label: string;
	/** Errores del campo (TanStack Form + Zod entrega objetos con `message`) */
	errors?: unknown[];
}

/** Etiqueta + input + mensajes de validación, con aria-invalid para lectores de pantalla */
export function CampoTexto({
	id,
	label,
	errors = [],
	...props
}: CampoTextoProps) {
	const mensajes = errors
		.map((e) =>
			typeof e === "string" ? e : (e as { message?: string })?.message,
		)
		.filter(Boolean);

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				name={id}
				aria-invalid={mensajes.length > 0}
				aria-describedby={mensajes.length ? `${id}-error` : undefined}
				{...props}
			/>
			{mensajes.length > 0 && (
				<p id={`${id}-error`} className="text-xs font-medium text-destructive">
					{mensajes.join(", ")}
				</p>
			)}
		</div>
	);
}

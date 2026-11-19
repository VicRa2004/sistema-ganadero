import type { SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { extractErrorMessages } from "@/lib/formAccessibility";
import { cn } from "@/lib/utils";

export const SELECT_FIELD_CLASS =
	"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

interface CampoSelectProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
	id: string;
	label: string;
	errors?: unknown[];
}

/** Etiqueta + select accesible con aria-invalid explícito y aria-describedby condicional */
export function CampoSelect({
	id,
	label,
	errors = [],
	className,
	children,
	...props
}: CampoSelectProps) {
	const mensajes = extractErrorMessages(errors);
	const esInvalido = mensajes.length > 0;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<select
				id={id}
				name={id}
				aria-invalid={esInvalido ? "true" : "false"}
				aria-describedby={esInvalido ? `${id}-error` : undefined}
				className={cn(SELECT_FIELD_CLASS, className)}
				{...props}
			>
				{children}
			</select>
			{esInvalido && (
				<p id={`${id}-error`} className="text-xs font-medium text-destructive">
					{mensajes.join(", ")}
				</p>
			)}
		</div>
	);
}

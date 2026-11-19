export function extractErrorMessages(errors: readonly unknown[]): string[] {
	return errors
		.map((e) =>
			typeof e === "string" ? e : (e as { message?: string })?.message,
		)
		.filter((m): m is string => Boolean(m));
}

/**
 * Devuelve los errores visibles de un campo solo tras haber interactuado (`isTouched` o intento de envío),
 * permitiendo limpiar al instante cuando el usuario corrige el input.
 */
export function getVisibleFieldErrors(meta: {
	isTouched: boolean;
	errors: unknown[];
}): unknown[] {
	return meta.isTouched ? meta.errors : [];
}

/**
 * Enfoca el primer control con `aria-invalid="true"` dentro del formulario tras fallar la validación en submit.
 */
export function focusFirstInvalidField(form: HTMLFormElement | null): void {
	if (!form) return;
	const invalid = form.querySelector<HTMLElement>(
		'[aria-invalid="true"]:not([disabled])',
	);
	if (invalid) {
		invalid.focus();
		invalid.scrollIntoView?.({ block: "nearest" });
	}
}

export async function handleFormSubmitWithFocus(
	e: React.FormEvent<HTMLFormElement>,
	handleSubmit: () => Promise<void> | void,
): Promise<void> {
	e.preventDefault();
	e.stopPropagation();
	const formEl = e.currentTarget;
	await handleSubmit();
	requestAnimationFrame(() => focusFirstInvalidField(formEl));
}

interface FormErrorAnnouncerProps {
	errorCount: number;
}

/**
 * Región aria-live="polite" única por formulario para anunciar errores de validación al lector de pantalla.
 */
export function FormErrorAnnouncer({ errorCount }: FormErrorAnnouncerProps) {
	return (
		<div aria-live="polite" role="status" className="sr-only">
			{errorCount > 0
				? `Hay ${errorCount} campo${errorCount === 1 ? "" : "s"} con errores de validación. Revisa el formulario.`
				: ""}
		</div>
	);
}

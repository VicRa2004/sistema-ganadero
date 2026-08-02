import type * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	allowDecimals?: boolean;
	allowNegative?: boolean;
};

export function Input({
	className,
	type,
	allowDecimals = true,
	allowNegative = false,
	onKeyDown,
	onPaste,
	onWheel,
	...props
}: InputProps) {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Teclas de control/navegación permitidas siempre
		const isControlKey =
			e.key === "Backspace" ||
			e.key === "Delete" ||
			e.key === "Tab" ||
			e.key === "Escape" ||
			e.key === "Enter" ||
			e.key === "ArrowLeft" ||
			e.key === "ArrowRight" ||
			e.key === "ArrowUp" ||
			e.key === "ArrowDown" ||
			e.key === "Home" ||
			e.key === "End" ||
			e.ctrlKey ||
			e.metaKey;

		if (type === "number") {
			if (!isControlKey) {
				const isDigit = /^\d$/.test(e.key);
				const isDecimalSeparator =
					(e.key === "." || e.key === ",") && allowDecimals;
				const isNegativeSign = e.key === "-" && allowNegative;

				// Si la tecla no es un dígito, separador decimal válido o signo negativo válido -> bloquear
				if (!isDigit && !isDecimalSeparator && !isNegativeSign) {
					e.preventDefault();
					return;
				}

				// Evitar duplicar punto decimal o coma
				if (isDecimalSeparator) {
					const val = e.currentTarget.value;
					if (val.includes(".") || val.includes(",")) {
						e.preventDefault();
						return;
					}
				}

				// Evitar signo negativo que no esté al inicio
				if (isNegativeSign) {
					const val = e.currentTarget.value;
					if (val.includes("-") || e.currentTarget.selectionStart !== 0) {
						e.preventDefault();
						return;
					}
				}
			}
		} else if (type === "tel") {
			if (!isControlKey) {
				const isPhoneChar = /^[\d+\-()\s]$/.test(e.key);
				if (!isPhoneChar) {
					e.preventDefault();
					return;
				}
			}
		}

		if (onKeyDown) {
			onKeyDown(e);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		if (type === "number") {
			const pastedText = e.clipboardData.getData("text");
			let sanitized = pastedText;
			if (!allowDecimals) {
				sanitized = sanitized.replace(/[^0-9]/g, "");
			} else {
				sanitized = sanitized.replace(/[^0-9.]/g, "");
				const parts = sanitized.split(".");
				if (parts.length > 2) {
					sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
				}
			}
			if (!allowNegative) {
				sanitized = sanitized.replace(/-/g, "");
			}
			if (sanitized !== pastedText) {
				e.preventDefault();
				const target = e.currentTarget;
				const start = target.selectionStart ?? 0;
				const end = target.selectionEnd ?? 0;
				const val = target.value;
				const newVal = val.slice(0, start) + sanitized + val.slice(end);
				target.value = newVal;

				const event = new Event("input", { bubbles: true });
				target.dispatchEvent(event);
			}
		}
		if (onPaste) {
			onPaste(e);
		}
	};

	const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
		if (type === "number") {
			e.currentTarget.blur();
		}
		if (onWheel) {
			onWheel(e);
		}
	};

	return (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}
			onWheel={handleWheel}
			{...props}
		/>
	);
}

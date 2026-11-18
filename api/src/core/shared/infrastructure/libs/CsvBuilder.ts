/**
 * Construye un CSV RFC-4180 con BOM UTF-8 y protección contra inyección de fórmulas.
 */
export function buildCsv(
	headers: string[],
	rows: Array<Array<string | number | boolean | null | undefined>>,
): string {
	const escapeCell = (
		value: string | number | boolean | null | undefined,
	): string => {
		if (value === null || value === undefined) return "";
		let str = String(value);
		// Neutralizar posibles fórmulas si empieza por =, +, @, tab o guion no numérico
		if (/^[=+\t\r@]|^-(?![\d.,]+$)/.test(str)) {
			str = `'${str}`;
		}
		if (/[",\n\r]/.test(str)) {
			return `"${str.replaceAll('"', '""')}"`;
		}
		return str;
	};

	const lines = [
		headers.map(escapeCell).join(","),
		...rows.map((row) => row.map(escapeCell).join(",")),
	];

	return `\uFEFF${lines.join("\r\n")}`;
}

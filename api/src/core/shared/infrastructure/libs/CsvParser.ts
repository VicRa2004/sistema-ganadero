export interface ParsedCsvRow {
	rowNumber: number;
	values: Record<string, string>;
}

export interface ParsedCsvResult {
	headers: string[];
	rows: ParsedCsvRow[];
}

/**
 * Parsea un texto CSV compatible con RFC-4180 (comillas dobles, comas internas, CRLF/LF y BOM UTF-8).
 */
export function parseCsv(rawContent: string): ParsedCsvResult {
	const content = rawContent.replace(/^\uFEFF/, "");
	const records: string[][] = [];
	let currentRow: string[] = [];
	let currentField = "";
	let inQuotes = false;

	for (let i = 0; i < content.length; i++) {
		const ch = content[i];
		const next = content[i + 1];

		if (inQuotes) {
			if (ch === '"' && next === '"') {
				currentField += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				currentField += ch;
			}
			continue;
		}

		if (ch === '"') {
			inQuotes = true;
		} else if (ch === ",") {
			currentRow.push(currentField.trim());
			currentField = "";
		} else if (ch === "\r" && next === "\n") {
			currentRow.push(currentField.trim());
			records.push(currentRow);
			currentRow = [];
			currentField = "";
			i++;
		} else if (ch === "\n" || ch === "\r") {
			currentRow.push(currentField.trim());
			records.push(currentRow);
			currentRow = [];
			currentField = "";
		} else {
			currentField += ch;
		}
	}

	if (currentField.length > 0 || currentRow.length > 0) {
		currentRow.push(currentField.trim());
		records.push(currentRow);
	}

	const nonEmptyRecords = records.filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);
	if (nonEmptyRecords.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = (nonEmptyRecords[0] ?? []).map((h) => h.trim());
	const rows: ParsedCsvRow[] = [];

	for (let r = 1; r < nonEmptyRecords.length; r++) {
		const record = nonEmptyRecords[r] ?? [];
		const values: Record<string, string> = {};
		for (let c = 0; c < headers.length; c++) {
			const key = headers[c];
			if (key) {
				values[key] = (record[c] ?? "").trim();
			}
		}
		rows.push({
			rowNumber: r + 1,
			values,
		});
	}

	return { headers, rows };
}

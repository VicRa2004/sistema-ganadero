/**
 * Generador nativo de documentos PDF 1.4 multipágina sin dependencias externas.
 * Soporta texto en español (WinAnsiEncoding), grillas de metadatos, secciones y tablas.
 */

const PAGE_WIDTH = 595.28; // A4 puntos
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 42;
const MARGIN_RIGHT = 42;
const MARGIN_TOP = 46;
const MARGIN_BOTTOM = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const WIN_ANSI_EXTENDED: Record<string, number> = {
	"€": 0x80,
	"–": 0x96,
	"—": 0x97,
	"¡": 0xa1,
	"°": 0xb0,
	º: 0xba,
	ª: 0xaa,
	"¿": 0xbf,
	Á: 0xc1,
	É: 0xc9,
	Í: 0xcd,
	Ñ: 0xd1,
	Ó: 0xd3,
	Ú: 0xda,
	Ü: 0xdc,
	á: 0xe1,
	é: 0xe9,
	í: 0xed,
	ñ: 0xf1,
	ó: 0xf3,
	ú: 0xfa,
	ü: 0xfc,
};

function encodePdfText(input: string): string {
	let out = "(";
	for (const ch of input) {
		const code = ch.charCodeAt(0);
		if (ch === "(" || ch === ")" || ch === "\\") {
			out += `\\${ch}`;
		} else if (code >= 0x20 && code <= 0x7e) {
			out += ch;
		} else if (WIN_ANSI_EXTENDED[ch] !== undefined) {
			const byte = WIN_ANSI_EXTENDED[ch];
			out += `\\${byte.toString(8).padStart(3, "0")}`;
		} else if (code >= 0xa0 && code <= 0xff) {
			out += `\\${code.toString(8).padStart(3, "0")}`;
		} else {
			out += "?";
		}
	}
	out += ")";
	return out;
}

function wrapText(
	text: string,
	maxWidthPt: number,
	fontSize: number,
): string[] {
	const avgCharWidth = fontSize * 0.52;
	const maxChars = Math.max(8, Math.floor(maxWidthPt / avgCharWidth));
	const paragraphs = text.split(/\r?\n/);
	const lines: string[] = [];

	for (const para of paragraphs) {
		const words = para.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) {
			lines.push("");
			continue;
		}
		let current = "";
		for (const word of words) {
			if (!current) {
				if (word.length > maxChars) {
					for (let i = 0; i < word.length; i += maxChars) {
						lines.push(word.slice(i, i + maxChars));
					}
				} else {
					current = word;
				}
			} else if (current.length + 1 + word.length <= maxChars) {
				current += ` ${word}`;
			} else {
				lines.push(current);
				if (word.length > maxChars) {
					for (let i = 0; i < word.length; i += maxChars) {
						const chunk = word.slice(i, i + maxChars);
						if (i + maxChars < word.length) {
							lines.push(chunk);
						} else {
							current = chunk;
						}
					}
				} else {
					current = word;
				}
			}
		}
		if (current) lines.push(current);
	}

	return lines;
}

export interface PdfTableColumn {
	header: string;
	widthRatio: number;
	align?: "left" | "right";
}

export class PdfBuilder {
	private pages: string[][] = [[]];
	private currentY = PAGE_HEIGHT - MARGIN_TOP;
	private readonly title: string;
	private readonly subtitle: string;

	constructor(title: string, subtitle = "") {
		this.title = title;
		this.subtitle = subtitle;
		this.drawHeaderBanner();
	}

	private currentStream(): string[] {
		const stream = this.pages[this.pages.length - 1];
		if (!stream) {
			const next: string[] = [];
			this.pages.push(next);
			return next;
		}
		return stream;
	}

	private newPage(): void {
		this.pages.push([]);
		this.currentY = PAGE_HEIGHT - MARGIN_TOP;
	}

	private ensureSpace(neededHeight: number): void {
		if (this.currentY - neededHeight < MARGIN_BOTTOM) {
			this.newPage();
		}
	}

	private drawText(
		x: number,
		y: number,
		text: string,
		fontSize = 10,
		bold = false,
		rgb: [number, number, number] = [0.12, 0.14, 0.17],
	): void {
		const fontName = bold ? "F2" : "F1";
		this.currentStream().push(
			`BT /${fontName} ${fontSize} Tf ${rgb[0]} ${rgb[1]} ${rgb[2]} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${encodePdfText(text)} Tj ET`,
		);
	}

	private drawRect(
		x: number,
		y: number,
		w: number,
		h: number,
		fillRgb: [number, number, number],
		strokeRgb?: [number, number, number],
	): void {
		const ops: string[] = [
			`${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg`,
			`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`,
		];
		if (strokeRgb) {
			ops.push(`${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG 0.5 w B`);
		} else {
			ops.push("f");
		}
		this.currentStream().push(ops.join(" "));
	}

	private drawLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		rgb: [number, number, number] = [0.82, 0.85, 0.88],
	): void {
		this.currentStream().push(
			`${rgb[0]} ${rgb[1]} ${rgb[2]} RG 0.6 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`,
		);
	}

	private drawHeaderBanner(): void {
		const boxHeight = this.subtitle ? 52 : 38;
		const top = this.currentY;
		this.drawRect(
			MARGIN_LEFT,
			top - boxHeight,
			CONTENT_WIDTH,
			boxHeight,
			[0.11, 0.34, 0.24],
		);
		this.drawText(MARGIN_LEFT + 14, top - 20, this.title, 15, true, [1, 1, 1]);
		if (this.subtitle) {
			this.drawText(
				MARGIN_LEFT + 14,
				top - 36,
				this.subtitle,
				9.5,
				false,
				[0.86, 0.94, 0.89],
			);
		}
		const fechaStr = `Generado: ${new Date().toLocaleString("es-MX")}`;
		this.drawText(
			PAGE_WIDTH - MARGIN_RIGHT - Math.min(180, fechaStr.length * 4.8),
			top - 18,
			fechaStr,
			8,
			false,
			[0.86, 0.94, 0.89],
		);
		this.currentY = top - boxHeight - 16;
	}

	public addSectionTitle(title: string): void {
		this.ensureSpace(26);
		this.drawText(
			MARGIN_LEFT,
			this.currentY,
			title,
			11.5,
			true,
			[0.11, 0.34, 0.24],
		);
		this.drawLine(
			MARGIN_LEFT,
			this.currentY - 5,
			PAGE_WIDTH - MARGIN_RIGHT,
			this.currentY - 5,
			[0.11, 0.34, 0.24],
		);
		this.currentY -= 20;
	}

	public addParagraph(text: string, fontSize = 9.5): void {
		const lines = wrapText(text, CONTENT_WIDTH, fontSize);
		const lineHeight = fontSize + 4;
		for (const line of lines) {
			this.ensureSpace(lineHeight + 2);
			if (line) {
				this.drawText(MARGIN_LEFT, this.currentY, line, fontSize);
			}
			this.currentY -= lineHeight;
		}
		this.currentY -= 4;
	}

	public addCallout(text: string, isWarning = false): void {
		const lines = wrapText(text, CONTENT_WIDTH - 20, 9.5);
		const height = lines.length * 13 + 14;
		this.ensureSpace(height + 6);
		const fill: [number, number, number] = isWarning
			? [0.99, 0.94, 0.88]
			: [0.94, 0.97, 0.95];
		const stroke: [number, number, number] = isWarning
			? [0.85, 0.48, 0.15]
			: [0.22, 0.55, 0.36];
		const textRgb: [number, number, number] = isWarning
			? [0.58, 0.24, 0.05]
			: [0.11, 0.34, 0.24];
		this.drawRect(
			MARGIN_LEFT,
			this.currentY - height + 10,
			CONTENT_WIDTH,
			height,
			fill,
			stroke,
		);
		let y = this.currentY - 4;
		for (const line of lines) {
			this.drawText(MARGIN_LEFT + 10, y, line, 9.5, true, textRgb);
			y -= 13;
		}
		this.currentY -= height + 8;
	}

	public addInfoGrid(items: Array<{ label: string; value: string }>): void {
		const colWidth = CONTENT_WIDTH / 2;
		for (let i = 0; i < items.length; i += 2) {
			this.ensureSpace(26);
			const left = items[i];
			const right = items[i + 1];
			if (left) {
				this.drawText(
					MARGIN_LEFT,
					this.currentY,
					left.label.toUpperCase(),
					7.5,
					true,
					[0.45, 0.49, 0.54],
				);
				this.drawText(MARGIN_LEFT, this.currentY - 11, left.value, 9.5, false);
			}
			if (right) {
				this.drawText(
					MARGIN_LEFT + colWidth,
					this.currentY,
					right.label.toUpperCase(),
					7.5,
					true,
					[0.45, 0.49, 0.54],
				);
				this.drawText(
					MARGIN_LEFT + colWidth,
					this.currentY - 11,
					right.value,
					9.5,
					false,
				);
			}
			this.currentY -= 26;
		}
		this.currentY -= 4;
	}

	public addTable(columns: PdfTableColumn[], rows: string[][]): void {
		const totalRatio = columns.reduce((acc, c) => acc + c.widthRatio, 0) || 1;
		const widths = columns.map(
			(c) => (c.widthRatio / totalRatio) * CONTENT_WIDTH,
		);

		const drawTableHeader = () => {
			this.ensureSpace(24);
			const yTop = this.currentY;
			this.drawRect(
				MARGIN_LEFT,
				yTop - 18,
				CONTENT_WIDTH,
				20,
				[0.92, 0.94, 0.93],
			);
			let x = MARGIN_LEFT + 5;
			for (let c = 0; c < columns.length; c++) {
				const col = columns[c];
				const w = widths[c] ?? 60;
				if (col) {
					this.drawText(x, yTop - 12, col.header, 8, true, [0.2, 0.24, 0.28]);
				}
				x += w;
			}
			this.currentY -= 22;
		};

		drawTableHeader();

		if (rows.length === 0) {
			this.addParagraph("Sin registros para mostrar.", 9);
			return;
		}

		for (let r = 0; r < rows.length; r++) {
			const row = rows[r] ?? [];
			const cellLines = columns.map((_col, idx) =>
				wrapText(row[idx] ?? "-", (widths[idx] ?? 60) - 8, 8.5),
			);
			const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
			const rowHeight = maxLines * 11 + 6;

			if (this.currentY - rowHeight < MARGIN_BOTTOM) {
				this.newPage();
				drawTableHeader();
			}

			if (r % 2 === 1) {
				this.drawRect(
					MARGIN_LEFT,
					this.currentY - rowHeight + 8,
					CONTENT_WIDTH,
					rowHeight,
					[0.97, 0.98, 0.98],
				);
			}

			let x = MARGIN_LEFT + 5;
			for (let c = 0; c < columns.length; c++) {
				const lines = cellLines[c] ?? ["-"];
				let ly = this.currentY - 3;
				for (const line of lines) {
					this.drawText(x, ly, line, 8.5, false);
					ly -= 11;
				}
				x += widths[c] ?? 60;
			}

			this.drawLine(
				MARGIN_LEFT,
				this.currentY - rowHeight + 8,
				PAGE_WIDTH - MARGIN_RIGHT,
				this.currentY - rowHeight + 8,
				[0.9, 0.91, 0.93],
			);
			this.currentY -= rowHeight;
		}
		this.currentY -= 8;
	}

	public build(): Uint8Array {
		const totalPages = this.pages.length;
		const objects: string[] = [];

		// 1: Catalog, 2: Pages, 3: F1 Helvetica, 4: F2 Helvetica-Bold
		const pageObjectIds: number[] = [];
		const contentObjectIds: number[] = [];

		// Placeholder for 1..4
		objects.push("");
		objects.push("");
		objects.push(
			"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
		);
		objects.push(
			"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
		);

		for (let p = 0; p < totalPages; p++) {
			const ops = [...(this.pages[p] ?? [])];
			const footer = `Sistema Ganadero  ·  Página ${p + 1} de ${totalPages}`;
			ops.push(
				`BT /F1 8 Tf 0.45 0.49 0.54 rg 1 0 0 1 ${MARGIN_LEFT.toFixed(2)} 24.00 Tm ${encodePdfText(footer)} Tj ET`,
			);
			const streamData = ops.join("\n");
			const contentId = objects.length + 1;
			contentObjectIds.push(contentId);
			objects.push(
				`<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`,
			);

			const pageId = objects.length + 1;
			pageObjectIds.push(pageId);
			objects.push(
				`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
			);
		}

		objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
		objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${totalPages} >>`;

		let pdf = "%PDF-1.4\n";
		const offsets: number[] = [0];
		for (let i = 0; i < objects.length; i++) {
			offsets.push(pdf.length);
			pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
		}

		const xrefOffset = pdf.length;
		pdf += `xref\n0 ${objects.length + 1}\n`;
		pdf += "0000000000 65535 f \n";
		for (let i = 1; i < offsets.length; i++) {
			const off = offsets[i] ?? 0;
			pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
		}
		pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

		return Buffer.from(pdf, "latin1");
	}
}

import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { runInTransaction } from "@/core/config/transaction";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { buildCsv } from "@/core/shared/infrastructure/libs/CsvBuilder";
import { parseCsv } from "@/core/shared/infrastructure/libs/CsvParser";
import type { SexoGanado } from "../../domain/Ganado";

export interface FilaImportacionGanadoDto {
	fila: number;
	valido: boolean;
	errores: string[];
	identificador: string;
	sexo: string;
	peso: number | null;
	fechaNacimiento: string;
	raza: string;
	terreno: string;
	propietario: string;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
}

export interface PrevisualizacionImportacionGanadoDto {
	totalFilas: number;
	validasCount: number;
	erroresCount: number;
	filas: FilaImportacionGanadoDto[];
}

export interface ConfirmacionImportacionGanadoDto {
	insertados: number;
	identificadores: string[];
}

const COLUMNAS_REQUERIDAS = [
	"identificador",
	"sexo",
	"peso",
	"fechaNacimiento",
	"raza",
	"terreno",
	"propietario",
] as const;

@injectable()
export class ImportarGanadoCsvUseCase {
	public generarPlantilla(): string {
		return buildCsv(
			[...COLUMNAS_REQUERIDAS],
			[
				[
					"AR-1001",
					"HEMBRA",
					380.5,
					"2024-03-15",
					"Angus",
					"Potrero Norte",
					"Juan Pérez",
				],
			],
		);
	}

	private async validarCsv(
		csvContent: string,
		actor: Actor,
	): Promise<PrevisualizacionImportacionGanadoDto> {
		const parsed = parseCsv(csvContent);
		if (parsed.headers.length === 0) {
			throw new ValidationError("El archivo CSV está vacío");
		}

		const faltantes = COLUMNAS_REQUERIDAS.filter(
			(col) => !parsed.headers.includes(col),
		);
		if (faltantes.length > 0) {
			throw new ValidationError(
				`Faltan columnas obligatorias en el CSV: ${faltantes.join(", ")}`,
			);
		}

		if (parsed.rows.length === 0) {
			throw new ValidationError("El archivo CSV no contiene filas de datos");
		}

		const usuarioFiltro = usuarioIdDeFiltro(actor);
		const [razas, terrenos, propietarios, existentes] = await Promise.all([
			prisma.raza.findMany({ select: { id: true, nombre: true } }),
			prisma.terreno.findMany({
				where: usuarioFiltro !== undefined ? { usuarioId: usuarioFiltro } : {},
				select: {
					id: true,
					nombre: true,
					capacidadMaxima: true,
					_count: { select: { ganados: { where: { fechaBaja: null } } } },
				},
			}),
			prisma.propietario.findMany({
				where: usuarioFiltro !== undefined ? { usuarioId: usuarioFiltro } : {},
				select: { id: true, nombre: true },
			}),
			prisma.ganado.findMany({
				select: { identificador: true },
			}),
		]);

		const razaMap = new Map(
			razas.map((r) => [r.nombre.trim().toLowerCase(), r.id]),
		);
		const terrenoMap = new Map(
			terrenos.map((t) => [
				t.nombre.trim().toLowerCase(),
				{
					id: t.id,
					capacidadMaxima: t.capacidadMaxima,
					ocupacionActual: t._count.ganados,
				},
			]),
		);
		const propietarioMap = new Map(
			propietarios.map((p) => [p.nombre.trim().toLowerCase(), p.id]),
		);
		const existentesSet = new Set(
			existentes.map((g) => g.identificador.trim().toLowerCase()),
		);

		const vistosCsv = new Set<string>();
		const incrementoPorTerreno = new Map<number, number>();
		const filas: FilaImportacionGanadoDto[] = [];
		const ahora = new Date();

		for (const row of parsed.rows) {
			const errores: string[] = [];
			const v = row.values;
			const identificador = (v.identificador ?? "").trim();
			const sexoRaw = (v.sexo ?? "").trim().toUpperCase();
			const pesoRaw = (v.peso ?? "").trim();
			const fechaRaw = (v.fechaNacimiento ?? "").trim();
			const razaNombre = (v.raza ?? "").trim();
			const terrenoNombre = (v.terreno ?? "").trim();
			const propietarioNombre = (v.propietario ?? "").trim();

			if (!identificador) {
				errores.push("El identificador (arete) es obligatorio");
			} else if (identificador.length > 50) {
				errores.push("El identificador excede 50 caracteres");
			} else {
				const idNorm = identificador.toLowerCase();
				if (existentesSet.has(idNorm)) {
					errores.push(`El arete "${identificador}" ya existe en el sistema`);
				}
				if (vistosCsv.has(idNorm)) {
					errores.push(`El arete "${identificador}" está duplicado en el CSV`);
				}
				vistosCsv.add(idNorm);
			}

			if (sexoRaw !== "MACHO" && sexoRaw !== "HEMBRA") {
				errores.push('El sexo debe ser "MACHO" o "HEMBRA"');
			}

			const pesoNum = Number(pesoRaw);
			if (!pesoRaw || Number.isNaN(pesoNum) || pesoNum <= 0) {
				errores.push("El peso debe ser un número mayor a 0");
			}

			const fechaNac = new Date(fechaRaw);
			if (!fechaRaw || Number.isNaN(fechaNac.getTime())) {
				errores.push("La fechaNacimiento no es válida (use YYYY-MM-DD)");
			} else if (fechaNac > ahora) {
				errores.push("La fechaNacimiento no puede ser futura");
			}

			const razaId = razaMap.get(razaNombre.toLowerCase());
			if (!razaId) {
				errores.push(`Raza no encontrada: "${razaNombre || "(vacía)"}"`);
			}

			const terrenoInfo = terrenoMap.get(terrenoNombre.toLowerCase());
			if (!terrenoInfo) {
				errores.push(
					`Terreno no encontrado o sin acceso: "${terrenoNombre || "(vacío)"}"`,
				);
			} else {
				const suma = (incrementoPorTerreno.get(terrenoInfo.id) ?? 0) + 1;
				if (terrenoInfo.ocupacionActual + suma > terrenoInfo.capacidadMaxima) {
					errores.push(
						`El terreno "${terrenoNombre}" excede su capacidad máxima (${terrenoInfo.capacidadMaxima})`,
					);
				} else {
					incrementoPorTerreno.set(terrenoInfo.id, suma);
				}
			}

			const propietarioId = propietarioMap.get(propietarioNombre.toLowerCase());
			if (!propietarioId) {
				errores.push(
					`Propietario no encontrado o sin acceso: "${propietarioNombre || "(vacío)"}"`,
				);
			}

			filas.push({
				fila: row.rowNumber,
				valido: errores.length === 0,
				errores,
				identificador,
				sexo: sexoRaw,
				peso: Number.isNaN(pesoNum) ? null : pesoNum,
				fechaNacimiento: fechaRaw,
				raza: razaNombre,
				terreno: terrenoNombre,
				propietario: propietarioNombre,
				razaId,
				terrenoId: terrenoInfo?.id,
				propietarioId,
			});
		}

		const validasCount = filas.filter((f) => f.valido).length;
		return {
			totalFilas: filas.length,
			validasCount,
			erroresCount: filas.length - validasCount,
			filas,
		};
	}

	public async previsualizar(
		csvContent: string,
		actor: Actor,
	): Promise<PrevisualizacionImportacionGanadoDto> {
		return this.validarCsv(csvContent, actor);
	}

	public async confirmar(
		csvContent: string,
		actor: Actor,
	): Promise<ConfirmacionImportacionGanadoDto> {
		const validacion = await this.validarCsv(csvContent, actor);
		if (validacion.erroresCount > 0) {
			const primerError = validacion.filas.find((f) => !f.valido);
			throw new ValidationError(
				`El CSV contiene ${validacion.erroresCount} fila(s) con errores. Fila ${primerError?.fila}: ${primerError?.errores.join("; ")}`,
			);
		}

		const ahora = new Date();
		const identificadores: string[] = [];

		await runInTransaction(async () => {
			for (const fila of validacion.filas) {
				if (
					!fila.razaId ||
					!fila.terrenoId ||
					!fila.propietarioId ||
					fila.peso === null
				) {
					continue;
				}
				await prisma.ganado.create({
					data: {
						identificador: fila.identificador,
						peso: fila.peso,
						fechaNacimiento: new Date(fila.fechaNacimiento),
						sexo: fila.sexo as SexoGanado,
						razaId: fila.razaId,
						terrenoId: fila.terrenoId,
						propietarioId: fila.propietarioId,
						pesajes: {
							create: {
								peso: fila.peso,
								fecha: ahora,
								observaciones: "Peso inicial (importación CSV)",
							},
						},
					},
				});
				identificadores.push(fila.identificador);
			}
		});

		return {
			insertados: identificadores.length,
			identificadores,
		};
	}
}

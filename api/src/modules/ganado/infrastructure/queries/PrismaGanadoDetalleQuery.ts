import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type {
	GanadoDetalleQuery,
	RetiroVigenteInfo,
} from "../../application/queries/GanadoDetalleQuery";
import type {
	DescendienteDto,
	GanadoDetalleOutputDto,
	GenealogiaOutputDto,
	NodoGenealogiaDto,
} from "../../application/dtos/GanadoDto";

interface PrismaGanadoDetalleRecord {
	id: number;
	identificador: string;
	peso: number;
	fechaNacimiento: Date;
	sexo: "MACHO" | "HEMBRA";
	imagenGanado: string | null;
	fechaBaja: Date | null;
	procedencia: string | null;
	raza: { id: number; nombre: string };
	terreno: { id: number; nombre: string; ubicacion: string };
	propietario: { id: number; nombre: string };
	padre: { id: number; identificador: string } | null;
	madre: { id: number; identificador: string } | null;
	motivoBaja: { id: number; nombre: string } | null;
}

@injectable()
export class PrismaGanadoDetalleQuery implements GanadoDetalleQuery {
	private readonly includeRelaciones = {
		raza: true,
		terreno: true,
		propietario: true,
		padre: { select: { id: true, identificador: true } },
		madre: { select: { id: true, identificador: true } },
		motivoBaja: { select: { id: true, nombre: true } },
	} as const;

	private formatRecord(
		record: PrismaGanadoDetalleRecord,
		retiro: RetiroVigenteInfo,
	): GanadoDetalleOutputDto {
		return {
			id: record.id,
			identificador: record.identificador,
			peso: record.peso,
			fechaNacimiento: record.fechaNacimiento.toISOString().split("T")[0] ?? "",
			sexo: record.sexo,
			imagenGanado: record.imagenGanado,
			raza: { id: record.raza.id, nombre: record.raza.nombre },
			terreno: {
				id: record.terreno.id,
				nombre: record.terreno.nombre,
				ubicacion: record.terreno.ubicacion,
			},
			propietario: {
				id: record.propietario.id,
				nombre: record.propietario.nombre,
			},
			padre: record.padre
				? { id: record.padre.id, identificador: record.padre.identificador }
				: null,
			madre: record.madre
				? { id: record.madre.id, identificador: record.madre.identificador }
				: null,
			fechaBaja: record.fechaBaja?.toISOString() ?? null,
			motivoBaja: record.motivoBaja
				? { id: record.motivoBaja.id, nombre: record.motivoBaja.nombre }
				: null,
			enPeriodoRetiro: retiro.vigente,
			retiroHasta: retiro.hasta
				? (retiro.hasta.toISOString().split("T")[0] ?? null)
				: null,
			retiroMotivo: retiro.motivo,
			procedencia: record.procedencia ?? null,
		};
	}

	public async obtenerRetiroVigente(
		ganadoId: number,
		fechaReferencia = new Date(),
	): Promise<RetiroVigenteInfo> {
		const [aplicaciones, tratamientos] = await Promise.all([
			prisma.aplicacionSanitaria.findMany({
				where: {
					ganadoId,
					sesion: {
						deletedAt: null,
						estado: "REALIZADA",
						insumo: { periodoRetiroDias: { gt: 0 } },
					},
				},
				include: {
					sesion: {
						select: {
							fecha: true,
							insumo: { select: { nombre: true, periodoRetiroDias: true } },
						},
					},
				},
			}),
			prisma.tratamientoMedico.findMany({
				where: {
					ganadoId,
					insumo: { periodoRetiroDias: { gt: 0 } },
				},
				include: {
					insumo: { select: { nombre: true, periodoRetiroDias: true } },
				},
			}),
		]);

		let maxHasta: Date | null = null;
		let motivo: string | null = null;

		for (const app of aplicaciones) {
			const dias = app.sesion.insumo.periodoRetiroDias;
			const fin = new Date(app.sesion.fecha);
			fin.setDate(fin.getDate() + dias);
			if (fin > fechaReferencia && (!maxHasta || fin > maxHasta)) {
				maxHasta = fin;
				motivo = `${app.sesion.insumo.nombre} (${dias} días de retiro)`;
			}
		}

		for (const trt of tratamientos) {
			const dias = trt.insumo.periodoRetiroDias;
			const base =
				trt.activo && fechaReferencia > trt.fechaFin
					? fechaReferencia
					: trt.fechaFin;
			const fin = new Date(base);
			fin.setDate(fin.getDate() + dias);
			if (fin > fechaReferencia && (!maxHasta || fin > maxHasta)) {
				maxHasta = fin;
				motivo = `${trt.insumo.nombre} (${dias} días de retiro)`;
			}
		}

		return {
			vigente: maxHasta !== null,
			hasta: maxHasta,
			motivo,
		};
	}

	public async obtenerFichaPorId(
		id: number,
		actor: Actor,
	): Promise<GanadoDetalleOutputDto | null> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const record = await prisma.ganado.findFirst({
			where: {
				id,
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
			},
			include: this.includeRelaciones,
		});

		if (!record) return null;
		const retiro = await this.obtenerRetiroVigente(record.id);
		return this.formatRecord(
			record as unknown as PrismaGanadoDetalleRecord,
			retiro,
		);
	}

	public async obtenerFichaPorIdentificador(
		identificador: string,
		actor: Actor,
	): Promise<GanadoDetalleOutputDto | null> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const record = await prisma.ganado.findFirst({
			where: {
				identificador,
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
			},
			include: this.includeRelaciones,
		});

		if (!record) return null;
		const retiro = await this.obtenerRetiroVigente(record.id);
		return this.formatRecord(
			record as unknown as PrismaGanadoDetalleRecord,
			retiro,
		);
	}

	public async obtenerGenealogia(
		ganadoId: number,
		generaciones: number,
		actor: Actor,
	): Promise<GenealogiaOutputDto | null> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const filtroPropiedad =
			usuarioId !== undefined ? { terreno: { usuarioId } } : {};

		type NodoDb = {
			id: number;
			identificador: string;
			sexo: "MACHO" | "HEMBRA";
			fechaNacimiento: Date;
			peso: number;
			padreId: number | null;
			madreId: number | null;
			fechaBaja: Date | null;
			raza: { nombre: string };
		};

		const selectNodo = {
			id: true,
			identificador: true,
			sexo: true,
			fechaNacimiento: true,
			peso: true,
			padreId: true,
			madreId: true,
			fechaBaja: true,
			raza: { select: { nombre: true } },
		} as const;

		const raiz = await prisma.ganado.findFirst({
			where: { id: ganadoId, ...filtroPropiedad },
			select: selectNodo,
		});
		if (!raiz) return null;

		const mapa = new Map<number, NodoDb>([[raiz.id, raiz as NodoDb]]);
		let nivelActual: NodoDb[] = [raiz as NodoDb];

		for (let gen = 0; gen < generaciones; gen++) {
			const idsPendientes = new Set<number>();
			for (const nodo of nivelActual) {
				if (nodo.padreId !== null && !mapa.has(nodo.padreId)) {
					idsPendientes.add(nodo.padreId);
				}
				if (nodo.madreId !== null && !mapa.has(nodo.madreId)) {
					idsPendientes.add(nodo.madreId);
				}
			}
			if (idsPendientes.size === 0) break;

			const encontrados = await prisma.ganado.findMany({
				where: {
					id: { in: Array.from(idsPendientes) },
					...filtroPropiedad,
				},
				select: selectNodo,
			});
			nivelActual = encontrados as NodoDb[];
			for (const item of nivelActual) {
				mapa.set(item.id, item);
			}
		}

		const construirNodo = (
			id: number,
			profundidadRestante: number,
			camino: Set<number>,
		): NodoGenealogiaDto | null => {
			if (camino.has(id)) return null;
			const registro = mapa.get(id);
			if (!registro) return null;

			const siguienteCamino = new Set(camino);
			siguienteCamino.add(id);

			return {
				id: registro.id,
				identificador: registro.identificador,
				sexo: registro.sexo,
				fechaNacimiento:
					registro.fechaNacimiento.toISOString().split("T")[0] ?? "",
				peso: registro.peso,
				razaNombre: registro.raza.nombre,
				fechaBaja: registro.fechaBaja?.toISOString() ?? null,
				padre:
					profundidadRestante > 0 && registro.padreId !== null
						? construirNodo(
								registro.padreId,
								profundidadRestante - 1,
								siguienteCamino,
							)
						: null,
				madre:
					profundidadRestante > 0 && registro.madreId !== null
						? construirNodo(
								registro.madreId,
								profundidadRestante - 1,
								siguienteCamino,
							)
						: null,
			};
		};

		const animal = construirNodo(raiz.id, generaciones, new Set<number>());
		if (!animal) return null;

		const hijos = await prisma.ganado.findMany({
			where: {
				OR: [{ padreId: ganadoId }, { madreId: ganadoId }],
				...filtroPropiedad,
			},
			select: {
				id: true,
				identificador: true,
				sexo: true,
				fechaNacimiento: true,
				peso: true,
				fechaBaja: true,
				raza: { select: { nombre: true } },
			},
			orderBy: [{ fechaNacimiento: "desc" }, { id: "desc" }],
		});

		const descendencia: DescendienteDto[] = hijos.map((h) => ({
			id: h.id,
			identificador: h.identificador,
			sexo: h.sexo,
			fechaNacimiento: h.fechaNacimiento.toISOString().split("T")[0] ?? "",
			peso: h.peso,
			razaNombre: h.raza.nombre,
			fechaBaja: h.fechaBaja?.toISOString() ?? null,
		}));

		return {
			generaciones,
			animal,
			descendencia,
		};
	}
}

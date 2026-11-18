import { inject, injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { buildCsv } from "@/core/shared/infrastructure/libs/CsvBuilder";
import { PdfBuilder } from "@/core/shared/infrastructure/libs/PdfBuilder";
import { gananciaDiaria } from "../../domain/Pesaje";
import type { GanadoFilters } from "../../domain/repository/GanadoFilters";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoDetalleQuery } from "../queries/GanadoDetalleQuery";

@injectable()
export class ExportarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoDetalleQuery")
		private readonly detalleQuery: GanadoDetalleQuery,
	) {}

	public async exportarCsv(
		filters: Omit<GanadoFilters, "page" | "limit" | "usuarioId">,
		actor: Actor,
	): Promise<string> {
		const usuarioFiltro = usuarioIdDeFiltro(actor);
		const soloActivos = filters.soloActivos !== false;

		const records = await prisma.ganado.findMany({
			where: {
				...(soloActivos && { fechaBaja: null }),
				...(filters.identificador?.trim() && {
					identificador: {
						contains: filters.identificador.trim(),
						mode: "insensitive",
					},
				}),
				...(filters.terrenoId && { terrenoId: filters.terrenoId }),
				...(filters.razaId && { razaId: filters.razaId }),
				...(filters.propietarioId && { propietarioId: filters.propietarioId }),
				...(filters.sexo && { sexo: filters.sexo }),
				...(usuarioFiltro !== undefined && {
					terreno: { usuarioId: usuarioFiltro },
				}),
			},
			include: {
				raza: { select: { nombre: true } },
				terreno: { select: { nombre: true } },
				propietario: { select: { nombre: true } },
				motivoBaja: { select: { nombre: true } },
			},
			orderBy: { id: "asc" },
		});

		return buildCsv(
			[
				"ID",
				"Arete",
				"Sexo",
				"Peso (kg)",
				"Fecha Nacimiento",
				"Raza",
				"Terreno",
				"Propietario",
				"Estado",
				"Fecha Baja",
				"Motivo Baja",
			],
			records.map((g) => [
				g.id,
				g.identificador,
				g.sexo,
				g.peso,
				g.fechaNacimiento.toISOString().slice(0, 10),
				g.raza.nombre,
				g.terreno.nombre,
				g.propietario.nombre,
				g.fechaBaja ? "BAJA" : "ACTIVO",
				g.fechaBaja ? g.fechaBaja.toISOString().slice(0, 10) : "",
				g.motivoBaja?.nombre ?? "",
			]),
		);
	}

	public async exportarFichaPdf(
		idOrIdentificador: string,
		actor: Actor,
	): Promise<Uint8Array> {
		const usuarioFiltro = usuarioIdDeFiltro(actor);
		const numericId = Number(idOrIdentificador);
		const isNumeric =
			!Number.isNaN(numericId) && /^\d+$/.test(idOrIdentificador);

		const ficha = isNumeric
			? await this.detalleQuery.obtenerFichaPorId(numericId, usuarioFiltro)
			: await this.detalleQuery.obtenerFichaPorIdentificador(
					idOrIdentificador,
					usuarioFiltro,
				);

		if (!ficha) {
			throw new GanadoNotFoundError(idOrIdentificador);
		}

		const [pesajes, aplicaciones, tratamientos] = await Promise.all([
			this.ganadoRepository.findPesajes(ficha.id),
			prisma.aplicacionSanitaria.findMany({
				where: {
					ganadoId: ficha.id,
					sesion: { deletedAt: null, estado: "REALIZADA" },
				},
				include: {
					sesion: {
						include: {
							insumo: { select: { nombre: true, unidadMedida: true } },
							veterinario: { select: { nombre: true } },
						},
					},
				},
				orderBy: { sesion: { fecha: "desc" } },
			}),
			prisma.tratamientoMedico.findMany({
				where: { ganadoId: ficha.id },
				include: {
					insumo: { select: { nombre: true, unidadMedida: true } },
					veterinario: { select: { nombre: true } },
				},
				orderBy: { fechaInicio: "desc" },
			}),
		]);

		const pdf = new PdfBuilder(
			`Ficha Técnica — ${ficha.identificador}`,
			`${ficha.raza.nombre} · ${ficha.sexo} · ${ficha.terreno.nombre}`,
		);

		if (ficha.enPeriodoRetiro && ficha.retiroHasta) {
			pdf.addCallout(
				`ALERTA DE RETIRO: Animal en período de retiro hasta ${ficha.retiroHasta} (${ficha.retiroMotivo ?? "medicamento"}). No apto para venta o faena.`,
				true,
			);
		}

		if (ficha.fechaBaja) {
			pdf.addCallout(
				`Animal dado de baja el ${ficha.fechaBaja.slice(0, 10)}${ficha.motivoBaja ? ` · Motivo: ${ficha.motivoBaja.nombre}` : ""}`,
				true,
			);
		}

		pdf.addSectionTitle("Datos Generales y Linaje");
		pdf.addInfoGrid([
			{ label: "Arete / Identificador", value: ficha.identificador },
			{ label: "Peso Actual", value: `${ficha.peso} kg` },
			{ label: "Sexo", value: ficha.sexo },
			{ label: "Fecha de Nacimiento", value: ficha.fechaNacimiento },
			{ label: "Raza", value: ficha.raza.nombre },
			{ label: "Propietario", value: ficha.propietario.nombre },
			{
				label: "Terreno",
				value: `${ficha.terreno.nombre} (${ficha.terreno.ubicacion})`,
			},
			{
				label: "Linaje",
				value: `Padre: ${ficha.padre?.identificador ?? "N/D"} · Madre: ${ficha.madre?.identificador ?? "N/D"}`,
			},
		]);

		pdf.addSectionTitle("Historial de Pesajes");
		pdf.addTable(
			[
				{ header: "Fecha", widthRatio: 1.5 },
				{ header: "Peso (kg)", widthRatio: 1.2 },
				{ header: "GDP (kg/día)", widthRatio: 1.3 },
				{ header: "Observaciones", widthRatio: 3 },
			],
			pesajes.map((p, idx) => {
				const anterior = pesajes[idx - 1];
				const gdp = anterior ? gananciaDiaria(anterior, p) : null;
				return [
					p.fecha.toISOString().slice(0, 10),
					`${p.peso.toFixed(1)} kg`,
					gdp !== null ? `${gdp.toFixed(3)} kg/d` : "-",
					p.observaciones ?? "-",
				];
			}),
		);

		pdf.addSectionTitle("Historial Sanitario");
		pdf.addTable(
			[
				{ header: "Fecha", widthRatio: 1.2 },
				{ header: "Sesión", widthRatio: 2.2 },
				{ header: "Insumo", widthRatio: 1.6 },
				{ header: "Dosis", widthRatio: 1 },
				{ header: "Veterinario", widthRatio: 1.6 },
			],
			aplicaciones.map((a) => [
				a.sesion.fecha.toISOString().slice(0, 10),
				a.sesion.descripcion,
				a.sesion.insumo.nombre,
				`${a.dosisAplicada.toNumber()} ${a.sesion.insumo.unidadMedida}`,
				a.sesion.veterinario.nombre,
			]),
		);

		pdf.addSectionTitle("Tratamientos Médicos");
		pdf.addTable(
			[
				{ header: "Diagnóstico", widthRatio: 2.2 },
				{ header: "Periodo", widthRatio: 1.8 },
				{ header: "Insumo / Dosis", widthRatio: 1.8 },
				{ header: "Estado", widthRatio: 1 },
			],
			tratamientos.map((t) => [
				t.diagnostico,
				`${t.fechaInicio.toISOString().slice(0, 10)} a ${t.fechaFin.toISOString().slice(0, 10)}`,
				`${t.insumo.nombre} (${t.dosisDiaria.toNumber()} ${t.insumo.unidadMedida}/d)`,
				t.activo ? "ACTIVO" : "CONCLUIDO",
			]),
		);

		return pdf.build();
	}
}

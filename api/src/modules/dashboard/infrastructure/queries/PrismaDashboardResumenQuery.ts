import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { Prisma } from "@/generated/prisma/client";
import type { DashboardResumenDto } from "../../application/dtos/DashboardResumenDto";
import type { DashboardResumenQuery } from "../../application/queries/DashboardResumenQuery";

@injectable()
export class PrismaDashboardResumenQuery implements DashboardResumenQuery {
	public async obtenerResumen(actor: Actor): Promise<DashboardResumenDto> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const ahora = new Date();
		const en30Dias = new Date(ahora);
		en30Dias.setDate(en30Dias.getDate() + 30);
		const en7Dias = new Date(ahora);
		en7Dias.setDate(en7Dias.getDate() + 7);
		const hace6Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);

		const filtroTerrenoSql =
			usuarioId !== undefined
				? Prisma.sql`AND t."terr_fkusuario" = ${usuarioId}`
				: Prisma.empty;
		const filtroInsumoSql =
			usuarioId !== undefined
				? Prisma.sql`AND i."ins_fkusuario" = ${usuarioId}`
				: Prisma.empty;

		const [
			totalesRows,
			terrenoRows,
			razaRows,
			sexoRows,
			edadRows,
			altasRows,
			bajasRows,
			motivosBajaRows,
			gdpRows,
			retiroRows,
			insumosCriticos,
			insumosPorCaducar,
			tratamientosActivosCount,
			tratamientosPorVencer,
			sesionesProgramadasCount,
			sesionesProgramadas,
		] = await Promise.all([
			prisma.$queryRaw<
				Array<{
					activas: bigint;
					totales: bigint;
					peso_promedio: number | null;
				}>
			>`
				SELECT
					COUNT(*) FILTER (WHERE g."gan_fecha_baja" IS NULL) AS activas,
					COUNT(*) AS totales,
					ROUND(AVG(g."gan_peso") FILTER (WHERE g."gan_fecha_baja" IS NULL)::numeric, 2)::float8 AS peso_promedio
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL ${filtroTerrenoSql}
			`,
			prisma.$queryRaw<
				Array<{
					terreno_id: number;
					nombre: string;
					capacidad_maxima: number;
					cabezas: bigint;
				}>
			>`
				SELECT
					t."terr_id" AS terreno_id,
					t."terr_nombre" AS nombre,
					t."terr_capacidad_max" AS capacidad_maxima,
					COUNT(g."gan_id") AS cabezas
				FROM "terreno" t
				LEFT JOIN "ganado" g
					ON g."gan_fkterreno" = t."terr_id"
					AND g."deleted_at" IS NULL
					AND g."gan_fecha_baja" IS NULL
				WHERE t."deleted_at" IS NULL ${filtroTerrenoSql}
				GROUP BY t."terr_id", t."terr_nombre", t."terr_capacidad_max"
				ORDER BY cabezas DESC, t."terr_nombre" ASC
			`,
			prisma.$queryRaw<
				Array<{ raza_id: number; nombre: string; cantidad: bigint }>
			>`
				SELECT
					r."raz_id" AS raza_id,
					r."raz_nombre" AS nombre,
					COUNT(g."gan_id") AS cantidad
				FROM "ganado" g
				JOIN "raza" r ON r."raz_id" = g."gan_fkraza" AND r."deleted_at" IS NULL
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NULL ${filtroTerrenoSql}
				GROUP BY r."raz_id", r."raz_nombre"
				ORDER BY cantidad DESC
			`,
			prisma.$queryRaw<Array<{ sexo: "MACHO" | "HEMBRA"; cantidad: bigint }>>`
				SELECT g."gan_sexo" AS sexo, COUNT(*) AS cantidad
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NULL ${filtroTerrenoSql}
				GROUP BY g."gan_sexo"
			`,
			prisma.$queryRaw<Array<{ rango: string; cantidad: bigint }>>`
				SELECT
					CASE
						WHEN g."gan_fecha_nacimiento" > (CURRENT_DATE - INTERVAL '6 months') THEN '< 6 meses'
						WHEN g."gan_fecha_nacimiento" > (CURRENT_DATE - INTERVAL '12 months') THEN '6-12 meses'
						WHEN g."gan_fecha_nacimiento" > (CURRENT_DATE - INTERVAL '24 months') THEN '1-2 años'
						ELSE '> 2 años'
					END AS rango,
					COUNT(*) AS cantidad
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NULL ${filtroTerrenoSql}
				GROUP BY rango
			`,
			prisma.$queryRaw<Array<{ mes: string; cantidad: bigint }>>`
				SELECT TO_CHAR(DATE_TRUNC('month', g."created_at"), 'YYYY-MM') AS mes, COUNT(*) AS cantidad
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."created_at" >= ${hace6Meses} ${filtroTerrenoSql}
				GROUP BY mes
				ORDER BY mes ASC
			`,
			prisma.$queryRaw<Array<{ mes: string; cantidad: bigint }>>`
				SELECT TO_CHAR(DATE_TRUNC('month', g."gan_fecha_baja"), 'YYYY-MM') AS mes, COUNT(*) AS cantidad
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NOT NULL AND g."gan_fecha_baja" >= ${hace6Meses} ${filtroTerrenoSql}
				GROUP BY mes
				ORDER BY mes ASC
			`,
			prisma.$queryRaw<Array<{ motivo: string; cantidad: bigint }>>`
				SELECT mb."mtb_nombre" AS motivo, COUNT(*) AS cantidad
				FROM "ganado" g
				JOIN "motivo_baja" mb ON mb."mtb_id" = g."gan_fkmotivo_baja"
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NOT NULL ${filtroTerrenoSql}
				GROUP BY mb."mtb_nombre"
				ORDER BY cantidad DESC
			`,
			prisma.$queryRaw<Array<{ gdp_promedio: number | null }>>`
				WITH extremos AS (
					SELECT
						p."pes_fkganado" AS ganado_id,
						FIRST_VALUE(p."pes_peso") OVER (PARTITION BY p."pes_fkganado" ORDER BY p."pes_fecha" ASC, p."pes_id" ASC) AS peso_ini,
						FIRST_VALUE(p."pes_fecha") OVER (PARTITION BY p."pes_fkganado" ORDER BY p."pes_fecha" ASC, p."pes_id" ASC) AS fecha_ini,
						FIRST_VALUE(p."pes_peso") OVER (PARTITION BY p."pes_fkganado" ORDER BY p."pes_fecha" DESC, p."pes_id" DESC) AS peso_fin,
						FIRST_VALUE(p."pes_fecha") OVER (PARTITION BY p."pes_fkganado" ORDER BY p."pes_fecha" DESC, p."pes_id" DESC) AS fecha_fin,
						ROW_NUMBER() OVER (PARTITION BY p."pes_fkganado" ORDER BY p."pes_fecha" ASC, p."pes_id" ASC) AS rn
					FROM "pesaje" p
					JOIN "ganado" g ON g."gan_id" = p."pes_fkganado" AND g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NULL
					JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
					WHERE 1=1 ${filtroTerrenoSql}
				)
				SELECT ROUND(AVG((peso_fin - peso_ini) / NULLIF(EXTRACT(EPOCH FROM (fecha_fin - fecha_ini)) / 86400.0, 0))::numeric, 3)::float8 AS gdp_promedio
				FROM extremos
				WHERE rn = 1 AND fecha_fin > fecha_ini
			`,
			prisma.$queryRaw<Array<{ en_retiro: bigint }>>`
				SELECT COUNT(DISTINCT g."gan_id") AS en_retiro
				FROM "ganado" g
				JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno" AND t."deleted_at" IS NULL
				WHERE g."deleted_at" IS NULL AND g."gan_fecha_baja" IS NULL ${filtroTerrenoSql}
					AND (
						EXISTS (
							SELECT 1 FROM "aplicacion_sanitaria" a
							JOIN "sesion_sanitaria" s ON s."ses_id" = a."aps_fksesion" AND s."deleted_at" IS NULL AND s."ses_estado" = 'REALIZADA'
							JOIN "insumo" i ON i."ins_id" = s."ses_fkinsumo" AND i."deleted_at" IS NULL
							WHERE a."aps_fkganado" = g."gan_id" AND a."deleted_at" IS NULL
								AND i."ins_periodo_retiro_dias" > 0
								AND (s."ses_fecha" + (i."ins_periodo_retiro_dias" * INTERVAL '1 day')) > NOW()
						)
						OR EXISTS (
							SELECT 1 FROM "tratamiento_medico" tr
							JOIN "insumo" i ON i."ins_id" = tr."trt_fkinsumo" AND i."deleted_at" IS NULL
							WHERE tr."trt_fkganado" = g."gan_id" AND tr."deleted_at" IS NULL
								AND i."ins_periodo_retiro_dias" > 0
								AND (GREATEST(tr."trt_fecha_fin", CASE WHEN tr."trt_activo" THEN NOW() ELSE tr."trt_fecha_fin" END) + (i."ins_periodo_retiro_dias" * INTERVAL '1 day')) > NOW()
						)
					)
			`,
			prisma.$queryRaw<
				Array<{
					id: number;
					nombre: string;
					tipo: string;
					stock: number;
					stock_minimo: number;
					unidad_medida: string;
					fecha_caducidad: Date;
				}>
			>`
				SELECT
					i."ins_id" AS id,
					i."ins_nombre" AS nombre,
					i."ins_tipo"::text AS tipo,
					i."ins_stock"::float8 AS stock,
					i."ins_stock_minimo"::float8 AS stock_minimo,
					i."ins_unidad" AS unidad_medida,
					i."ins_fecha_caducidad" AS fecha_caducidad
				FROM "insumo" i
				WHERE i."deleted_at" IS NULL
					AND i."ins_stock" <= i."ins_stock_minimo"
					${filtroInsumoSql}
				ORDER BY (i."ins_stock" - i."ins_stock_minimo") ASC
				LIMIT 10
			`,
			prisma.insumo.findMany({
				where: {
					fechaCaducidad: { lte: en30Dias },
					...(usuarioId !== undefined && { usuarioId }),
				},
				orderBy: { fechaCaducidad: "asc" },
				take: 10,
			}),
			prisma.tratamientoMedico.count({
				where: {
					activo: true,
					ganado: {
						deletedAt: null,
						...(usuarioId !== undefined && { terreno: { usuarioId } }),
					},
				},
			}),
			prisma.tratamientoMedico.findMany({
				where: {
					activo: true,
					ganado: {
						deletedAt: null,
						...(usuarioId !== undefined && { terreno: { usuarioId } }),
					},
				},
				include: {
					ganado: { select: { id: true, identificador: true } },
				},
				orderBy: { fechaFin: "asc" },
				take: 8,
			}),
			prisma.sesionSanitaria.count({
				where: {
					estado: "PROGRAMADA",
					...(usuarioId !== undefined && { veterinario: { usuarioId } }),
				},
			}),
			prisma.sesionSanitaria.findMany({
				where: {
					estado: "PROGRAMADA",
					fecha: { lte: en7Dias },
					...(usuarioId !== undefined && { veterinario: { usuarioId } }),
				},
				include: {
					insumo: { select: { nombre: true } },
					veterinario: { select: { nombre: true } },
				},
				orderBy: { fecha: "asc" },
				take: 8,
			}),
		]);

		const tot = totalesRows[0];
		const cabezasActivas = Number(tot?.activas ?? 0);
		const cabezasTotales = Number(tot?.totales ?? 0);
		const pesoPromedioKg = tot?.peso_promedio ?? 0;

		const porTerreno = terrenoRows.map((t) => {
			const cabezas = Number(t.cabezas);
			const capacidadMaxima = Number(t.capacidad_maxima);
			return {
				terrenoId: Number(t.terreno_id),
				nombre: t.nombre,
				cabezas,
				capacidadMaxima,
				porcentajeOcupacion:
					capacidadMaxima > 0
						? Math.round((cabezas / capacidadMaxima) * 1000) / 10
						: 0,
			};
		});

		const capacidadTotal = porTerreno.reduce(
			(acc, t) => acc + t.capacidadMaxima,
			0,
		);
		const ocupacionPorcentaje =
			capacidadTotal > 0
				? Math.round((cabezasActivas / capacidadTotal) * 1000) / 10
				: 0;

		// Serie completa de los últimos 6 meses para altas/bajas
		const altasMap = new Map(altasRows.map((r) => [r.mes, Number(r.cantidad)]));
		const bajasMap = new Map(bajasRows.map((r) => [r.mes, Number(r.cantidad)]));
		const altasYBajasPorMes: Array<{
			mes: string;
			altas: number;
			bajas: number;
		}> = [];
		for (let i = 5; i >= 0; i--) {
			const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
			const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			altasYBajasPorMes.push({
				mes,
				altas: altasMap.get(mes) ?? 0,
				bajas: bajasMap.get(mes) ?? 0,
			});
		}

		// Orden fijo de rangos de edad
		const edadMap = new Map(edadRows.map((r) => [r.rango, Number(r.cantidad)]));
		const rangosOrden = ["< 6 meses", "6-12 meses", "1-2 años", "> 2 años"];
		const porRangoEdad = rangosOrden.map((rango) => ({
			rango,
			cantidad: edadMap.get(rango) ?? 0,
		}));

		return {
			totales: {
				cabezasActivas,
				cabezasTotales,
				capacidadTotal,
				ocupacionPorcentaje,
				terrenosCount: porTerreno.length,
				insumosCriticosCount: insumosCriticos.length,
				insumosPorCaducarCount: insumosPorCaducar.length,
				tratamientosActivosCount,
				sesionesProgramadasCount,
				animalesEnRetiroCount: Number(retiroRows[0]?.en_retiro ?? 0),
				pesoPromedioKg,
				gdpPromedioKgDia: gdpRows[0]?.gdp_promedio ?? null,
			},
			porTerreno,
			porRaza: razaRows.map((r) => ({
				razaId: Number(r.raza_id),
				nombre: r.nombre,
				cantidad: Number(r.cantidad),
			})),
			porSexo: (["MACHO", "HEMBRA"] as const).map((sexo) => ({
				sexo,
				cantidad: Number(sexoRows.find((s) => s.sexo === sexo)?.cantidad ?? 0),
			})),
			porRangoEdad,
			altasYBajasPorMes,
			motivosBaja: motivosBajaRows.map((m) => ({
				motivo: m.motivo,
				cantidad: Number(m.cantidad),
			})),
			insumosAlerta: {
				criticos: insumosCriticos.map((i) => ({
					id: i.id,
					nombre: i.nombre,
					tipo: i.tipo,
					stock: i.stock,
					stockMinimo: i.stock_minimo,
					unidadMedida: i.unidad_medida,
					fechaCaducidad: i.fecha_caducidad.toISOString(),
				})),
				porCaducar: insumosPorCaducar.map((i) => ({
					id: i.id,
					nombre: i.nombre,
					tipo: i.tipo,
					stock: i.stock.toNumber(),
					stockMinimo: i.stockMinimo.toNumber(),
					unidadMedida: i.unidadMedida,
					fechaCaducidad: i.fechaCaducidad.toISOString(),
				})),
			},
			sanidadProxima: {
				tratamientosPorVencer: tratamientosPorVencer.map((t) => ({
					id: t.id,
					ganadoId: t.ganadoId,
					identificador: t.ganado.identificador,
					diagnostico: t.diagnostico,
					fechaFin: t.fechaFin.toISOString(),
				})),
				sesionesProgramadas: sesionesProgramadas.map((s) => ({
					id: s.id,
					fecha: s.fecha.toISOString(),
					descripcion: s.descripcion,
					insumoNombre: s.insumo.nombre,
					veterinarioNombre: s.veterinario.nombre,
				})),
			},
		};
	}
}

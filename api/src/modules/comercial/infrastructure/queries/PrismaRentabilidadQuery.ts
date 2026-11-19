import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type {
	RentabilidadAnimalDto,
	RentabilidadResumenDto,
} from "../../application/dtos/ComercialDto";
import type {
	RentabilidadFilters,
	RentabilidadQuery,
} from "../../application/queries/RentabilidadQuery";

const round2 = (n: number) => Number(n.toFixed(2));
const margenDe = (ingresos: number, ganancia: number) =>
	ingresos > 0 ? round2((ganancia / ingresos) * 100) : null;

@injectable()
export class PrismaRentabilidadQuery implements RentabilidadQuery {
	public async obtenerRentabilidadPorGanado(
		ganadoId: number,
		actor: Actor,
	): Promise<RentabilidadAnimalDto> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const ganado = await prisma.ganado.findFirstOrThrow({
			where: {
				id: ganadoId,
				...(usuarioId !== undefined && { terreno: { usuarioId } }),
			},
			select: { id: true, identificador: true },
		});

		const [transacciones, gastos, movimientos] = await Promise.all([
			prisma.transaccionGanado.findMany({
				where: {
					ganadoId,
					transaccion: { deletedAt: null },
				},
				include: { transaccion: { select: { tipo: true } } },
			}),
			prisma.gasto.findMany({
				where: { ganadoId },
				select: { monto: true },
			}),
			prisma.movimientoInsumo.findMany({
				where: { ganadoId, tipo: "SALIDA" },
				select: { cantidad: true, costoUnitario: true },
			}),
		]);

		let costoCompra = 0;
		let ingresosVenta = 0;
		for (const t of transacciones) {
			const p = t.precio.toNumber();
			if (t.transaccion.tipo === "COMPRA") costoCompra += p;
			else ingresosVenta += p;
		}
		const gastosDirectos = gastos.reduce(
			(acc, g) => acc + g.monto.toNumber(),
			0,
		);
		const costoInsumosAplicados = movimientos.reduce(
			(acc, m) =>
				acc + m.cantidad.toNumber() * (m.costoUnitario?.toNumber() ?? 0),
			0,
		);

		const cCompra = round2(costoCompra);
		const cGastos = round2(gastosDirectos);
		const cInsumos = round2(costoInsumosAplicados);
		const costoTotal = round2(cCompra + cGastos + cInsumos);
		const ing = round2(ingresosVenta);
		const gananciaNeta = round2(ing - costoTotal);

		return {
			ganadoId: ganado.id,
			identificador: ganado.identificador,
			costoCompra: cCompra,
			gastosDirectos: cGastos,
			costoInsumosAplicados: cInsumos,
			costoTotal,
			ingresosVenta: ing,
			gananciaNeta,
			margenPorcentaje: margenDe(ing, gananciaNeta),
		};
	}

	public async obtenerRentabilidad(
		filters: RentabilidadFilters,
		actor: Actor,
	): Promise<RentabilidadResumenDto> {
		const usuarioId = usuarioIdDeFiltro(actor);
		const fechaWhere =
			filters.desde || filters.hasta
				? {
						...(filters.desde && { gte: filters.desde }),
						...(filters.hasta && { lte: filters.hasta }),
					}
				: undefined;

		const [transacciones, gastos, movimientos, terrenos] = await Promise.all([
			prisma.transaccion.findMany({
				where: {
					...(usuarioId !== undefined && { usuarioId }),
					...(fechaWhere && { fecha: fechaWhere }),
				},
				include: {
					detalles: {
						include: {
							ganado: {
								select: {
									id: true,
									identificador: true,
									terrenoId: true,
								},
							},
						},
					},
				},
			}),
			prisma.gasto.findMany({
				where: {
					...(usuarioId !== undefined && { usuarioId }),
					...(fechaWhere && { fecha: fechaWhere }),
				},
				include: {
					ganado: {
						select: { id: true, identificador: true, terrenoId: true },
					},
					lote: { select: { id: true, terrenoId: true } },
				},
			}),
			prisma.movimientoInsumo.findMany({
				where: {
					tipo: "SALIDA",
					insumo: {
						deletedAt: null,
						...(usuarioId !== undefined && { usuarioId }),
					},
					...(fechaWhere && { fecha: fechaWhere }),
				},
				include: {
					ganado: {
						select: { id: true, identificador: true, terrenoId: true },
					},
					lote: { select: { id: true, terrenoId: true } },
				},
			}),
			prisma.terreno.findMany({
				where: usuarioId !== undefined ? { usuarioId } : {},
				select: { id: true, nombre: true },
			}),
		]);

		let totalIngresos = 0;
		let totalCompra = 0;
		let totalGastos = 0;
		let totalInsumos = 0;

		const animalMap = new Map<
			number,
			{
				ganadoId: number;
				identificador: string;
				costoCompra: number;
				gastosDirectos: number;
				costoInsumosAplicados: number;
				ingresosVenta: number;
			}
		>();
		const getAnimal = (id: number, identificador: string) => {
			let a = animalMap.get(id);
			if (!a) {
				a = {
					ganadoId: id,
					identificador,
					costoCompra: 0,
					gastosDirectos: 0,
					costoInsumosAplicados: 0,
					ingresosVenta: 0,
				};
				animalMap.set(id, a);
			}
			return a;
		};

		const terrenoMap = new Map<
			number,
			{
				terrenoId: number;
				terrenoNombre: string;
				ingresosVenta: number;
				costoCompra: number;
				gastos: number;
				costoInsumos: number;
			}
		>();
		for (const t of terrenos) {
			terrenoMap.set(t.id, {
				terrenoId: t.id,
				terrenoNombre: t.nombre,
				ingresosVenta: 0,
				costoCompra: 0,
				gastos: 0,
				costoInsumos: 0,
			});
		}

		const periodoMap = new Map<
			string,
			{
				periodo: string;
				ingresosVenta: number;
				costoCompra: number;
				gastos: number;
				costoInsumos: number;
			}
		>();
		const getPeriodo = (fecha: Date) => {
			const key = fecha.toISOString().slice(0, 7);
			let p = periodoMap.get(key);
			if (!p) {
				p = {
					periodo: key,
					ingresosVenta: 0,
					costoCompra: 0,
					gastos: 0,
					costoInsumos: 0,
				};
				periodoMap.set(key, p);
			}
			return p;
		};

		for (const tr of transacciones) {
			const monto = tr.total.toNumber();
			const per = getPeriodo(tr.fecha);
			if (tr.tipo === "VENTA") {
				totalIngresos += monto;
				per.ingresosVenta += monto;
			} else {
				totalCompra += monto;
				per.costoCompra += monto;
			}
			for (const det of tr.detalles) {
				const precio = det.precio.toNumber();
				const a = getAnimal(det.ganado.id, det.ganado.identificador);
				const ter = terrenoMap.get(det.ganado.terrenoId);
				if (tr.tipo === "VENTA") {
					a.ingresosVenta += precio;
					if (ter) ter.ingresosVenta += precio;
				} else {
					a.costoCompra += precio;
					if (ter) ter.costoCompra += precio;
				}
			}
		}

		for (const g of gastos) {
			const monto = g.monto.toNumber();
			totalGastos += monto;
			getPeriodo(g.fecha).gastos += monto;
			if (g.ganado) {
				getAnimal(g.ganado.id, g.ganado.identificador).gastosDirectos += monto;
			}
			const tId =
				g.terrenoId ?? g.ganado?.terrenoId ?? g.lote?.terrenoId ?? null;
			if (tId && terrenoMap.has(tId)) {
				const ter = terrenoMap.get(tId);
				if (ter) ter.gastos += monto;
			}
		}

		for (const m of movimientos) {
			const costo = m.cantidad.toNumber() * (m.costoUnitario?.toNumber() ?? 0);
			totalInsumos += costo;
			getPeriodo(m.fecha).costoInsumos += costo;
			if (m.ganado) {
				getAnimal(m.ganado.id, m.ganado.identificador).costoInsumosAplicados +=
					costo;
			}
			const tId =
				m.terrenoId ?? m.ganado?.terrenoId ?? m.lote?.terrenoId ?? null;
			if (tId && terrenoMap.has(tId)) {
				const ter = terrenoMap.get(tId);
				if (ter) ter.costoInsumos += costo;
			}
		}

		const cCompra = round2(totalCompra);
		const cGastos = round2(totalGastos);
		const cInsumos = round2(totalInsumos);
		const costoTotal = round2(cCompra + cGastos + cInsumos);
		const ing = round2(totalIngresos);
		const gananciaNeta = round2(ing - costoTotal);

		return {
			resumen: {
				ingresosVenta: ing,
				costoCompra: cCompra,
				gastosOperativos: cGastos,
				costoInsumos: cInsumos,
				costoTotal,
				gananciaNeta,
				margenPorcentaje: margenDe(ing, gananciaNeta),
			},
			porAnimal: Array.from(animalMap.values())
				.map((a) => {
					const comp = round2(a.costoCompra);
					const gast = round2(a.gastosDirectos);
					const ins = round2(a.costoInsumosAplicados);
					const tot = round2(comp + gast + ins);
					const ingA = round2(a.ingresosVenta);
					const net = round2(ingA - tot);
					return {
						ganadoId: a.ganadoId,
						identificador: a.identificador,
						costoCompra: comp,
						gastosDirectos: gast,
						costoInsumosAplicados: ins,
						costoTotal: tot,
						ingresosVenta: ingA,
						gananciaNeta: net,
						margenPorcentaje: margenDe(ingA, net),
					};
				})
				.sort((x, y) => y.gananciaNeta - x.gananciaNeta),
			porTerreno: Array.from(terrenoMap.values()).map((t) => {
				const comp = round2(t.costoCompra);
				const gast = round2(t.gastos);
				const ins = round2(t.costoInsumos);
				const tot = round2(comp + gast + ins);
				const ingT = round2(t.ingresosVenta);
				return {
					terrenoId: t.terrenoId,
					terrenoNombre: t.terrenoNombre,
					ingresosVenta: ingT,
					costoCompra: comp,
					gastos: gast,
					costoInsumos: ins,
					costoTotal: tot,
					gananciaNeta: round2(ingT - tot),
				};
			}),
			porPeriodo: Array.from(periodoMap.values())
				.sort((a, b) => a.periodo.localeCompare(b.periodo))
				.map((p) => {
					const comp = round2(p.costoCompra);
					const gast = round2(p.gastos);
					const ins = round2(p.costoInsumos);
					const tot = round2(comp + gast + ins);
					const ingP = round2(p.ingresosVenta);
					return {
						periodo: p.periodo,
						ingresosVenta: ingP,
						costoCompra: comp,
						gastos: gast,
						costoInsumos: ins,
						costoTotal: tot,
						gananciaNeta: round2(ingP - tot),
					};
				}),
		};
	}
}

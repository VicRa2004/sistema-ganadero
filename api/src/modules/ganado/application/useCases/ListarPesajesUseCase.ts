import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { gananciaDiaria } from "../../domain/Pesaje";
import { calcularEdadMeses } from "../../domain/ReproduccionReglas";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { HistorialPesajesOutputDto } from "../dtos/GanadoDto";
import type { GanadoAccessService } from "../services/GanadoAccessService";

@injectable()
export class ListarPesajesUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
	) {}

	public async run(
		id: number,
		actor: Actor,
	): Promise<HistorialPesajesOutputDto> {
		const ganado = await this.accessService.obtenerGanado(id, actor);
		const [pesajes, comparacion] = await Promise.all([
			this.ganadoRepository.findPesajes(id),
			this.ganadoRepository.obtenerPromedioPesoRazaEdad({
				razaId: ganado.getRazaId(),
				fechaNacimiento: ganado.getFechaNacimiento(),
				excluirGanadoId: id,
				actor,
			}),
		]);

		const items = pesajes.map((pesaje, i) => {
			const anterior = pesajes[i - 1];
			return {
				id: pesaje.id,
				peso: pesaje.peso,
				fecha: pesaje.fecha.toISOString(),
				observaciones: pesaje.observaciones,
				gananciaDiaria: anterior ? gananciaDiaria(anterior, pesaje) : null,
			};
		});

		const primero = pesajes[0];
		const ultimo = pesajes[pesajes.length - 1];
		const gdpAcumulada =
			primero && ultimo && primero !== ultimo
				? gananciaDiaria(primero, ultimo)
				: null;

		const pesoActual = ganado.getPeso();
		const edadMeses = Math.max(
			0,
			calcularEdadMeses(ganado.getFechaNacimiento(), new Date()),
		);
		const promedio = comparacion.promedio;
		const diferenciaKg =
			promedio !== null ? Number((pesoActual - promedio).toFixed(2)) : null;
		const porcentajeDiferencia =
			promedio !== null && promedio > 0
				? Number((((pesoActual - promedio) / promedio) * 100).toFixed(1))
				: null;

		return {
			pesajes: items,
			gananciaDiariaAcumulada: gdpAcumulada,
			// Alerta: el último pesaje es menor que el anterior
			perdidaDePeso: (items[items.length - 1]?.gananciaDiaria ?? 0) < 0,
			comparacionRazaEdad: {
				pesoActual,
				razaNombre: comparacion.razaNombre,
				edadMeses,
				promedioRazaEdad: promedio,
				cantidadMuestra: comparacion.cantidadMuestra,
				diferenciaKg,
				porcentajeDiferencia,
			},
		};
	}
}

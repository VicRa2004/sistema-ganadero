import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { Ganado } from "@/modules/ganado/domain/Ganado";
import {
	EDAD_MINIMA_REPRODUCTIVA_MESES,
	calcularEdadMeses,
	calcularFechaProbableParto,
} from "@/modules/ganado/domain/ReproduccionReglas";
import { GanadoDuplicateIdentificadorError } from "@/modules/ganado/domain/error/GanadoDuplicateIdentificadorError";
import type { GanadoRepository } from "@/modules/ganado/domain/repository/GanadoRepository";
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";
import type { RazaRepository } from "@/modules/raza/domain/repository/RazaRepository";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import { EventoReproductivo } from "../../domain/EventoReproductivo";
import type { EventoReproductivoRepository } from "../../domain/repository/EventoReproductivoRepository";
import type {
	EventoReproductivoOutputDto,
	RegistrarEventoReproductivoInputDto,
} from "../dtos/ReproduccionDto";
import type { EventoReproductivoMapper } from "../mappers/EventoReproductivoMapper";

@injectable()
export class RegistrarEventoReproductivoUseCase {
	constructor(
		@inject("EventoReproductivoRepository")
		private readonly eventoRepo: EventoReproductivoRepository,
		@inject("GanadoRepository")
		private readonly ganadoRepo: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("RazaRepository")
		private readonly razaRepo: RazaRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepo: TerrenoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner: TransactionRunner,
		@inject("EventoReproductivoMapper")
		private readonly mapper: EventoReproductivoMapper,
	) {}

	public async run(
		dto: RegistrarEventoReproductivoInputDto,
		actor: Actor,
	): Promise<EventoReproductivoOutputDto> {
		const fecha = new Date(dto.fecha);
		if (Number.isNaN(fecha.getTime())) {
			throw new ValidationError("La fecha del evento no es válida");
		}

		// 1. Validar hembra
		const hembra = await this.ganadoAccess.obtenerGanado(dto.hembraId, actor);
		if (hembra.getSexo() !== "HEMBRA") {
			throw new ValidationError(
				`El animal ${hembra.getIdentificador()} debe ser HEMBRA`,
			);
		}
		if (!hembra.estaActivo()) {
			throw new ValidationError(
				`El animal ${hembra.getIdentificador()} está dado de baja`,
			);
		}
		if (fecha < hembra.getFechaNacimiento()) {
			throw new ValidationError(
				"La fecha del evento no puede ser anterior al nacimiento de la hembra",
			);
		}

		// 2. Validar macho si se especificó
		let macho: Ganado | null = null;
		if (dto.machoId !== undefined && dto.machoId !== null) {
			macho = await this.ganadoAccess.obtenerGanado(dto.machoId, actor);
			if (macho.getSexo() !== "MACHO") {
				throw new ValidationError(
					`El reproductor ${macho.getIdentificador()} debe ser MACHO`,
				);
			}
			if (!macho.estaActivo()) {
				throw new ValidationError(
					`El reproductor ${macho.getIdentificador()} está dado de baja`,
				);
			}
			if (fecha < macho.getFechaNacimiento()) {
				throw new ValidationError(
					"La fecha del evento no puede ser anterior al nacimiento del macho",
				);
			}
		}

		// 3. Edad mínima reproductiva para montas/inseminaciones y partos
		if (
			dto.tipo === "MONTA" ||
			dto.tipo === "INSEMINACION" ||
			dto.tipo === "PARTO"
		) {
			const edadHembra = calcularEdadMeses(hembra.getFechaNacimiento(), fecha);
			if (edadHembra < EDAD_MINIMA_REPRODUCTIVA_MESES) {
				throw new ValidationError(
					`La hembra (${hembra.getIdentificador()}) debe tener al menos ${EDAD_MINIMA_REPRODUCTIVA_MESES} meses para este evento`,
				);
			}
			if (macho && (dto.tipo === "MONTA" || dto.tipo === "INSEMINACION")) {
				const edadMacho = calcularEdadMeses(macho.getFechaNacimiento(), fecha);
				if (edadMacho < EDAD_MINIMA_REPRODUCTIVA_MESES) {
					throw new ValidationError(
						`El macho (${macho.getIdentificador()}) debe tener al menos ${EDAD_MINIMA_REPRODUCTIVA_MESES} meses para monta o inseminación`,
					);
				}
			}
		}

		// 4. Calcular fecha probable de parto (≈283 días)
		let fechaProbableParto: Date | null = null;
		if (dto.tipo === "MONTA" || dto.tipo === "INSEMINACION") {
			fechaProbableParto = dto.fechaProbableParto
				? new Date(dto.fechaProbableParto)
				: calcularFechaProbableParto(fecha);
		} else if (
			dto.tipo === "DIAGNOSTICO_GESTACION" &&
			dto.resultado === "POSITIVO"
		) {
			if (dto.fechaProbableParto) {
				fechaProbableParto = new Date(dto.fechaProbableParto);
			} else {
				const servicio = await this.eventoRepo.findUltimoServicioAbierto(
					hembra.getId(),
					fecha,
				);
				if (servicio) {
					fechaProbableParto =
						servicio.getFechaProbableParto() ??
						calcularFechaProbableParto(servicio.getFecha());
				}
			}
		}

		const evento = EventoReproductivo.create({
			hembraId: dto.hembraId,
			machoId: dto.machoId ?? null,
			tipo: dto.tipo,
			fecha,
			resultado: dto.resultado ?? null,
			fechaProbableParto,
			observaciones: dto.observaciones ?? null,
		});

		const criasDto = dto.tipo === "PARTO" ? (dto.crias ?? []) : [];
		if (dto.tipo !== "PARTO" && dto.crias && dto.crias.length > 0) {
			throw new ValidationError(
				"Solo se pueden registrar crías en eventos de tipo PARTO",
			);
		}

		// 5. Si hay crías en PARTO, validar todas antes de abrir la transacción
		if (criasDto.length > 0) {
			let padreIdFinal = dto.machoId ?? null;
			if (padreIdFinal === null) {
				const servicio = await this.eventoRepo.findUltimoServicioAbierto(
					hembra.getId(),
					fecha,
				);
				if (servicio?.getMachoId()) {
					padreIdFinal = servicio.getMachoId();
				}
			}

			const aretesLote = new Set<string>();
			const incrementoPorTerreno = new Map<number, number>();
			const entidadesCria: Ganado[] = [];

			for (const cria of criasDto) {
				const areteNorm = cria.identificador.trim();
				if (aretesLote.has(areteNorm.toLowerCase())) {
					throw new ValidationError(
						`El arete "${areteNorm}" está repetido en el registro del parto`,
					);
				}
				aretesLote.add(areteNorm.toLowerCase());

				const existente = await this.ganadoRepo.findByIdentificador(areteNorm);
				if (existente) {
					throw new GanadoDuplicateIdentificadorError(areteNorm);
				}

				const razaId = cria.razaId ?? hembra.getRazaId();
				const terrenoId = cria.terrenoId ?? hembra.getTerrenoId();
				const propietarioId = cria.propietarioId ?? hembra.getPropietarioId();

				const raza = await this.razaRepo.findById(razaId);
				if (!raza) {
					throw new RazaNotFoundError(razaId);
				}
				const terreno = await this.ganadoAccess.obtenerTerreno(
					terrenoId,
					actor,
				);
				await this.ganadoAccess.obtenerPropietario(propietarioId, actor);

				const sumaTerreno = (incrementoPorTerreno.get(terrenoId) ?? 0) + 1;
				incrementoPorTerreno.set(terrenoId, sumaTerreno);
				const ocupados =
					await this.terrenoRepo.countGanadoByRanchoId(terrenoId);
				if (ocupados + sumaTerreno > terreno.getCapacidadMaxima()) {
					throw new ValidationError(
						`El terreno "${terreno.getNombre()}" no tiene capacidad suficiente para las nuevas crías`,
					);
				}

				entidadesCria.push(
					Ganado.create(
						areteNorm,
						cria.peso,
						fecha,
						cria.sexo,
						null,
						razaId,
						terrenoId,
						propietarioId,
						padreIdFinal,
						hembra.getId(),
					),
				);
			}

			const guardado = await this.transactionRunner.run(async () => {
				const eventoGuardado = await this.eventoRepo.save(evento);
				const criaIds: number[] = [];
				for (const entidad of entidadesCria) {
					const criaGuardada = await this.ganadoRepo.save(entidad);
					criaIds.push(criaGuardada.getId());
				}
				await this.eventoRepo.vincularCrias(eventoGuardado.getId(), criaIds);
				return this.eventoRepo.findById(eventoGuardado.getId());
			});

			return this.mapper.toDto(guardado ?? evento);
		}

		const guardado = await this.eventoRepo.save(evento);
		return this.mapper.toDto(guardado);
	}
}

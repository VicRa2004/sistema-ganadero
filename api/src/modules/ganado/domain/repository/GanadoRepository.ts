import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Ganado } from "../Ganado";
import type { NuevoPesaje, Pesaje } from "../Pesaje";
import type { GanadoFilters } from "./GanadoFilters";

export interface PromedioPesoRazaEdadResult {
	promedio: number | null;
	cantidadMuestra: number;
	razaNombre: string;
}

export interface TrasladoRegistro {
	id: number;
	fecha: Date;
	terrenoOrigen: { id: number; nombre: string };
	terrenoDestino: { id: number; nombre: string };
}

export interface GanadoRepository {
	findById(id: number): Promise<Ganado | null>;
	findByIdentificador(identificador: string): Promise<Ganado | null>;
	findAll(filters: GanadoFilters): Promise<Pagination<Ganado>>;
	save(ganado: Ganado): Promise<Ganado>;
	/**
	 * Inserta el pesaje y deja `Ganado.peso` igual al pesaje más reciente,
	 * todo en una transacción.
	 */
	registrarPesaje(ganadoId: number, pesaje: NuevoPesaje): Promise<Ganado>;
	/** Pesajes del animal ordenados del más antiguo al más reciente. */
	findPesajes(ganadoId: number): Promise<Pesaje[]>;
	/** Historial de traslados del animal, del más reciente al más antiguo. */
	findTraslados(ganadoId: number): Promise<TrasladoRegistro[]>;
	/** Promedio de peso de animales activos de la misma raza y franja de edad. */
	obtenerPromedioPesoRazaEdad(params: {
		razaId: number;
		fechaNacimiento: Date;
		excluirGanadoId: number;
		actor: Actor;
	}): Promise<PromedioPesoRazaEdadResult>;
	delete(id: number): Promise<void>;
}

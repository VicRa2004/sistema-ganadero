import type { Raza } from "../Raza";

export interface RazaRepository {
	findById(id: number): Promise<Raza | null>;
	findByName(nombre: string): Promise<Raza | null>;
	findAll(): Promise<Raza[]>;
	save(raza: Raza): Promise<Raza>;
	delete(id: number): Promise<void>;
}

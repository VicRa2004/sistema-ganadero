export interface RazaDto {
	id: number;
	nombre: string;
	descripcion: string | null;
}

export interface RazaInput {
	nombre: string;
	descripcion?: string | null;
}

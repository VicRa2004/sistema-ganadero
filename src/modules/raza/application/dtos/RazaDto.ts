export interface RegisterRazaInputDto {
	nombre: string;
	descripcion?: string | null;
}

export interface UpdateRazaInputDto {
	nombre?: string;
	descripcion?: string | null;
}

export interface RazaOutputDto {
	id: number;
	nombre: string;
	descripcion: string | null;
}

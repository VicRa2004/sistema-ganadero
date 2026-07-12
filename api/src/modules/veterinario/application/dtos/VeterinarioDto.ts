export interface RegistrarVeterinarioInputDto {
	nombre: string;
	telefono: string;
	cedulaProfesional: string;
	especialidad?: string | null;
}

export interface ActualizarVeterinarioInputDto {
	nombre?: string;
	telefono?: string;
	cedulaProfesional?: string;
	especialidad?: string | null;
}

export interface VeterinarioOutputDto {
	id: number;
	nombre: string;
	telefono: string;
	cedulaProfesional: string;
	especialidad: string | null;
}

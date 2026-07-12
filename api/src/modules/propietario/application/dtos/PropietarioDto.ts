export interface RegistrarPropietarioInputDto {
	nombre: string;
	telefono?: string | null;
	correo?: string | null;
	imagenMarca?: File | null;
}

export interface ActualizarPropietarioInputDto {
	nombre?: string;
	telefono?: string | null;
	correo?: string | null;
	imagenMarca?: File | string | null;
}

export interface PropietarioOutputDto {
	id: number;
	nombre: string;
	telefono: string | null;
	correo: string | null;
	imagenMarca: string | null;
}

export interface PropietarioDetalleOutputDto {
	id: number;
	nombre: string;
	telefono: string | null;
	correo: string | null;
	imagenMarca: string | null;
	cantidadGanado: number;
	cantidadRanchos: number;
	ganados: {
		id: number;
		identificador: string;
		peso: number;
		sexo: string;
	}[];
	ranchos: {
		id: number;
		nombre: string;
		ubicacion: string;
	}[];
}

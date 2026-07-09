export interface InsumoOutputDto {
	id: number;
	nombre: string;
	tipo: string;
	stock: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
	esBajoStock: boolean;
}

export interface RegistrarInsumoInputDto {
	nombre: string;
	tipo: string;
	stockInicial: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
}

export interface AbastecerInsumoInputDto {
	cantidad: number;
}

export interface ConsumirInsumoInputDto {
	cantidad: number;
}

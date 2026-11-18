export interface CrearPlanSanitarioInputDto {
	nombre: string;
	descripcion: string;
	frecuenciaDias: number;
	dosisPorAnimal: number;
	veterinarioId: number;
	insumoId: number;
	terrenoId?: number | null;
	razaId?: number | null;
	edadMinimaMeses?: number | null;
	proximaEjecucion: string;
	activo?: boolean;
}

export type ActualizarPlanSanitarioInputDto =
	Partial<CrearPlanSanitarioInputDto>;

export interface PlanSanitarioOutputDto {
	id: number;
	nombre: string;
	descripcion: string;
	frecuenciaDias: number;
	dosisPorAnimal: number;
	veterinarioId: number;
	nombreVeterinario?: string;
	insumoId: number;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	terrenoId: number | null;
	nombreTerreno?: string | null;
	razaId: number | null;
	nombreRaza?: string | null;
	edadMinimaMeses: number | null;
	proximaEjecucion: string;
	activo: boolean;
	usuarioId: number;
}

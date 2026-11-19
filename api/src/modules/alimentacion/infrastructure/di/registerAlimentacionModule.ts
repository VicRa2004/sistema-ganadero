import type { DependencyContainer } from "tsyringe";
import { AlimentacionMapper } from "../../application/mappers/AlimentacionMapper";
import { AlimentacionAccessService } from "../../application/services/AlimentacionAccessService";
import { ActualizarRacionUseCase } from "../../application/useCases/ActualizarRacionUseCase";
import { CrearRacionUseCase } from "../../application/useCases/CrearRacionUseCase";
import { EliminarRacionUseCase } from "../../application/useCases/EliminarRacionUseCase";
import { ListarRacionesUseCase } from "../../application/useCases/ListarRacionesUseCase";
import { ListarSuministrosUseCase } from "../../application/useCases/ListarSuministrosUseCase";
import { ObtenerAutonomiaAlimentoUseCase } from "../../application/useCases/ObtenerAutonomiaAlimentoUseCase";
import { RegistrarSuministroUseCase } from "../../application/useCases/RegistrarSuministroUseCase";
import { ActualizarRacionController } from "../http/controllers/ActualizarRacionController";
import { CrearRacionController } from "../http/controllers/CrearRacionController";
import { EliminarRacionController } from "../http/controllers/EliminarRacionController";
import { ListarRacionesController } from "../http/controllers/ListarRacionesController";
import { ListarSuministrosController } from "../http/controllers/ListarSuministrosController";
import { ObtenerAutonomiaAlimentoController } from "../http/controllers/ObtenerAutonomiaAlimentoController";
import { RegistrarSuministroController } from "../http/controllers/RegistrarSuministroController";
import { AlimentacionRouter } from "../http/routes/AlimentacionRouter";
import { PrismaAutonomiaAlimentoQuery } from "../queries/PrismaAutonomiaAlimentoQuery";
import { PrismaAlimentacionRepository } from "../repository/PrismaAlimentacionRepository";

export function registerAlimentacionModule(
	container: DependencyContainer,
): void {
	container.register("AlimentacionRepository", {
		useClass: PrismaAlimentacionRepository,
	});
	container.register("AutonomiaAlimentoQuery", {
		useClass: PrismaAutonomiaAlimentoQuery,
	});
	container.register("AlimentacionMapper", {
		useClass: AlimentacionMapper,
	});
	container.register("AlimentacionAccessService", {
		useClass: AlimentacionAccessService,
	});

	container.register("CrearRacionUseCase", { useClass: CrearRacionUseCase });
	container.register("ListarRacionesUseCase", {
		useClass: ListarRacionesUseCase,
	});
	container.register("ActualizarRacionUseCase", {
		useClass: ActualizarRacionUseCase,
	});
	container.register("EliminarRacionUseCase", {
		useClass: EliminarRacionUseCase,
	});
	container.register("RegistrarSuministroUseCase", {
		useClass: RegistrarSuministroUseCase,
	});
	container.register("ListarSuministrosUseCase", {
		useClass: ListarSuministrosUseCase,
	});
	container.register("ObtenerAutonomiaAlimentoUseCase", {
		useClass: ObtenerAutonomiaAlimentoUseCase,
	});

	container.register("CrearRacionController", {
		useClass: CrearRacionController,
	});
	container.register("ListarRacionesController", {
		useClass: ListarRacionesController,
	});
	container.register("ActualizarRacionController", {
		useClass: ActualizarRacionController,
	});
	container.register("EliminarRacionController", {
		useClass: EliminarRacionController,
	});
	container.register("RegistrarSuministroController", {
		useClass: RegistrarSuministroController,
	});
	container.register("ListarSuministrosController", {
		useClass: ListarSuministrosController,
	});
	container.register("ObtenerAutonomiaAlimentoController", {
		useClass: ObtenerAutonomiaAlimentoController,
	});
	container.register("AlimentacionRouter", { useClass: AlimentacionRouter });
}

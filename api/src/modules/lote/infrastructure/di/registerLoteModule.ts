import type { DependencyContainer } from "tsyringe";
import { LoteMapper } from "../../application/mappers/LoteMapper";
import { LoteAccessService } from "../../application/services/LoteAccessService";
import { ActualizarLoteUseCase } from "../../application/useCases/ActualizarLoteUseCase";
import { AgregarMiembrosLoteUseCase } from "../../application/useCases/AgregarMiembrosLoteUseCase";
import { CrearLoteUseCase } from "../../application/useCases/CrearLoteUseCase";
import { EliminarLoteUseCase } from "../../application/useCases/EliminarLoteUseCase";
import { ListarLotesUseCase } from "../../application/useCases/ListarLotesUseCase";
import { ObtenerDetalleLoteUseCase } from "../../application/useCases/ObtenerDetalleLoteUseCase";
import { PesajeMasivoLoteUseCase } from "../../application/useCases/PesajeMasivoLoteUseCase";
import { QuitarMiembroLoteUseCase } from "../../application/useCases/QuitarMiembroLoteUseCase";
import { TrasladoMasivoLoteUseCase } from "../../application/useCases/TrasladoMasivoLoteUseCase";
import { VacunacionMasivaLoteUseCase } from "../../application/useCases/VacunacionMasivaLoteUseCase";
import { ActualizarLoteController } from "../http/controllers/ActualizarLoteController";
import { AgregarMiembrosLoteController } from "../http/controllers/AgregarMiembrosLoteController";
import { CrearLoteController } from "../http/controllers/CrearLoteController";
import { EliminarLoteController } from "../http/controllers/EliminarLoteController";
import { ListarLotesController } from "../http/controllers/ListarLotesController";
import { ObtenerDetalleLoteController } from "../http/controllers/ObtenerDetalleLoteController";
import { PesajeMasivoLoteController } from "../http/controllers/PesajeMasivoLoteController";
import { QuitarMiembroLoteController } from "../http/controllers/QuitarMiembroLoteController";
import { TrasladoMasivoLoteController } from "../http/controllers/TrasladoMasivoLoteController";
import { VacunacionMasivaLoteController } from "../http/controllers/VacunacionMasivaLoteController";
import { LoteRouter } from "../http/routes/LoteRouter";
import { PrismaLoteRepository } from "../repository/PrismaLoteRepository";

export function registerLoteModule(container: DependencyContainer): void {
	container.register("LoteRepository", { useClass: PrismaLoteRepository });
	container.register("LoteMapper", { useClass: LoteMapper });
	container.register("LoteAccessService", { useClass: LoteAccessService });

	container.register("CrearLoteUseCase", { useClass: CrearLoteUseCase });
	container.register("ListarLotesUseCase", { useClass: ListarLotesUseCase });
	container.register("ObtenerDetalleLoteUseCase", {
		useClass: ObtenerDetalleLoteUseCase,
	});
	container.register("ActualizarLoteUseCase", {
		useClass: ActualizarLoteUseCase,
	});
	container.register("EliminarLoteUseCase", { useClass: EliminarLoteUseCase });
	container.register("AgregarMiembrosLoteUseCase", {
		useClass: AgregarMiembrosLoteUseCase,
	});
	container.register("QuitarMiembroLoteUseCase", {
		useClass: QuitarMiembroLoteUseCase,
	});
	container.register("PesajeMasivoLoteUseCase", {
		useClass: PesajeMasivoLoteUseCase,
	});
	container.register("TrasladoMasivoLoteUseCase", {
		useClass: TrasladoMasivoLoteUseCase,
	});
	container.register("VacunacionMasivaLoteUseCase", {
		useClass: VacunacionMasivaLoteUseCase,
	});

	container.register("CrearLoteController", { useClass: CrearLoteController });
	container.register("ListarLotesController", {
		useClass: ListarLotesController,
	});
	container.register("ObtenerDetalleLoteController", {
		useClass: ObtenerDetalleLoteController,
	});
	container.register("ActualizarLoteController", {
		useClass: ActualizarLoteController,
	});
	container.register("EliminarLoteController", {
		useClass: EliminarLoteController,
	});
	container.register("AgregarMiembrosLoteController", {
		useClass: AgregarMiembrosLoteController,
	});
	container.register("QuitarMiembroLoteController", {
		useClass: QuitarMiembroLoteController,
	});
	container.register("PesajeMasivoLoteController", {
		useClass: PesajeMasivoLoteController,
	});
	container.register("TrasladoMasivoLoteController", {
		useClass: TrasladoMasivoLoteController,
	});
	container.register("VacunacionMasivaLoteController", {
		useClass: VacunacionMasivaLoteController,
	});
	container.register("LoteRouter", { useClass: LoteRouter });
}

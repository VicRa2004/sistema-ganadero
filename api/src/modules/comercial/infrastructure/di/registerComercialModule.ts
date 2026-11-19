import type { DependencyContainer } from "tsyringe";
import { ComercialMapper } from "../../application/mappers/ComercialMapper";
import { ComercialAccessService } from "../../application/services/ComercialAccessService";
import { ActualizarGastoUseCase } from "../../application/useCases/ActualizarGastoUseCase";
import { EliminarGastoUseCase } from "../../application/useCases/EliminarGastoUseCase";
import { EliminarTransaccionUseCase } from "../../application/useCases/EliminarTransaccionUseCase";
import { ExportarTransaccionPdfUseCase } from "../../application/useCases/ExportarTransaccionPdfUseCase";
import { ListarGastosUseCase } from "../../application/useCases/ListarGastosUseCase";
import { ListarTransaccionesUseCase } from "../../application/useCases/ListarTransaccionesUseCase";
import { ObtenerRentabilidadGanadoUseCase } from "../../application/useCases/ObtenerRentabilidadGanadoUseCase";
import { ObtenerRentabilidadUseCase } from "../../application/useCases/ObtenerRentabilidadUseCase";
import { ObtenerTransaccionUseCase } from "../../application/useCases/ObtenerTransaccionUseCase";
import { RegistrarCompraGanadoUseCase } from "../../application/useCases/RegistrarCompraGanadoUseCase";
import { RegistrarGastoUseCase } from "../../application/useCases/RegistrarGastoUseCase";
import { RegistrarVentaGanadoUseCase } from "../../application/useCases/RegistrarVentaGanadoUseCase";
import { ActualizarGastoController } from "../http/controllers/ActualizarGastoController";
import { EliminarGastoController } from "../http/controllers/EliminarGastoController";
import { EliminarTransaccionController } from "../http/controllers/EliminarTransaccionController";
import { ExportarTransaccionPdfController } from "../http/controllers/ExportarTransaccionPdfController";
import { ListarGastosController } from "../http/controllers/ListarGastosController";
import { ListarTransaccionesController } from "../http/controllers/ListarTransaccionesController";
import { ObtenerRentabilidadController } from "../http/controllers/ObtenerRentabilidadController";
import { ObtenerRentabilidadGanadoController } from "../http/controllers/ObtenerRentabilidadGanadoController";
import { ObtenerTransaccionController } from "../http/controllers/ObtenerTransaccionController";
import { RegistrarCompraController } from "../http/controllers/RegistrarCompraController";
import { RegistrarGastoController } from "../http/controllers/RegistrarGastoController";
import { RegistrarVentaController } from "../http/controllers/RegistrarVentaController";
import { ComercialRouter } from "../http/routes/ComercialRouter";
import { PrismaRentabilidadQuery } from "../queries/PrismaRentabilidadQuery";
import { PrismaGastoRepository } from "../repository/PrismaGastoRepository";
import { PrismaTransaccionRepository } from "../repository/PrismaTransaccionRepository";

export function registerComercialModule(container: DependencyContainer): void {
	container.register("TransaccionRepository", {
		useClass: PrismaTransaccionRepository,
	});
	container.register("GastoRepository", { useClass: PrismaGastoRepository });
	container.register("RentabilidadQuery", {
		useClass: PrismaRentabilidadQuery,
	});
	container.register("ComercialMapper", { useClass: ComercialMapper });
	container.register("ComercialAccessService", {
		useClass: ComercialAccessService,
	});

	container.register("RegistrarVentaGanadoUseCase", {
		useClass: RegistrarVentaGanadoUseCase,
	});
	container.register("RegistrarCompraGanadoUseCase", {
		useClass: RegistrarCompraGanadoUseCase,
	});
	container.register("ListarTransaccionesUseCase", {
		useClass: ListarTransaccionesUseCase,
	});
	container.register("ObtenerTransaccionUseCase", {
		useClass: ObtenerTransaccionUseCase,
	});
	container.register("ExportarTransaccionPdfUseCase", {
		useClass: ExportarTransaccionPdfUseCase,
	});
	container.register("EliminarTransaccionUseCase", {
		useClass: EliminarTransaccionUseCase,
	});
	container.register("RegistrarGastoUseCase", {
		useClass: RegistrarGastoUseCase,
	});
	container.register("ListarGastosUseCase", { useClass: ListarGastosUseCase });
	container.register("ActualizarGastoUseCase", {
		useClass: ActualizarGastoUseCase,
	});
	container.register("EliminarGastoUseCase", {
		useClass: EliminarGastoUseCase,
	});
	container.register("ObtenerRentabilidadUseCase", {
		useClass: ObtenerRentabilidadUseCase,
	});
	container.register("ObtenerRentabilidadGanadoUseCase", {
		useClass: ObtenerRentabilidadGanadoUseCase,
	});

	container.register("RegistrarVentaController", {
		useClass: RegistrarVentaController,
	});
	container.register("RegistrarCompraController", {
		useClass: RegistrarCompraController,
	});
	container.register("ListarTransaccionesController", {
		useClass: ListarTransaccionesController,
	});
	container.register("ObtenerTransaccionController", {
		useClass: ObtenerTransaccionController,
	});
	container.register("ExportarTransaccionPdfController", {
		useClass: ExportarTransaccionPdfController,
	});
	container.register("EliminarTransaccionController", {
		useClass: EliminarTransaccionController,
	});
	container.register("RegistrarGastoController", {
		useClass: RegistrarGastoController,
	});
	container.register("ListarGastosController", {
		useClass: ListarGastosController,
	});
	container.register("ActualizarGastoController", {
		useClass: ActualizarGastoController,
	});
	container.register("EliminarGastoController", {
		useClass: EliminarGastoController,
	});
	container.register("ObtenerRentabilidadController", {
		useClass: ObtenerRentabilidadController,
	});
	container.register("ObtenerRentabilidadGanadoController", {
		useClass: ObtenerRentabilidadGanadoController,
	});
	container.register("ComercialRouter", { useClass: ComercialRouter });
}

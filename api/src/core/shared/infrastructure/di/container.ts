import { Lifecycle, container } from "tsyringe";

// Import implementations
import { LocalImageStorageService } from "@/core/shared/infrastructure/libs/LocalImageStorageService";
import { PrismaUserRepository } from "@/core/user/infrastructure/repository/PrismaUserRepository";
import { CreateUserUseCase } from "@/core/user/application/useCases/CreateUserUseCase";
import { GetAllUsersUseCase } from "@/core/user/application/useCases/GetAllUsersUseCase";
import { GetOneUserUseCase } from "@/core/user/application/useCases/GetOneUserUseCase";
import { UpdateUserUseCase } from "@/core/user/application/useCases/UpdateUserUseCase";
import { DeleteUserUseCase } from "@/core/user/application/useCases/DeleteUserUseCase";
import { CreateUserController } from "@/core/user/infrastructure/http/controllers/CreateUserController";
import { GetAllUsersController } from "@/core/user/infrastructure/http/controllers/GetAllUsersController";
import { GetOneUserController } from "@/core/user/infrastructure/http/controllers/GetOneUserController";
import { UpdateUserController } from "@/core/user/infrastructure/http/controllers/UpdateUserController";
import { DeleteUserController } from "@/core/user/infrastructure/http/controllers/DeleteUserController";
import { PrismaRazaRepository } from "@/modules/raza/infrastructure/repository/PrismaRazaRepository";
import { RazaMapper } from "@/modules/raza/application/mappers/RazaMapper";
import { RegisterRazaUseCase } from "@/modules/raza/application/useCases/RegisterRazaUseCase";
import { ObtenerCatalogoRazasUseCase } from "@/modules/raza/application/useCases/ObtenerCatalogoRazasUseCase";
import { UpdateRazaUseCase } from "@/modules/raza/application/useCases/UpdateRazaUseCase";
import { DeleteRazaUseCase } from "@/modules/raza/application/useCases/DeleteRazaUseCase";
import { RegisterRazaController } from "@/modules/raza/infrastructure/http/controllers/RegisterRazaController";
import { ObtenerCatalogoRazasController } from "@/modules/raza/infrastructure/http/controllers/ObtenerCatalogoRazasController";
import { UpdateRazaController } from "@/modules/raza/infrastructure/http/controllers/UpdateRazaController";
import { DeleteRazaController } from "@/modules/raza/infrastructure/http/controllers/DeleteRazaController";
import { BcryptPasswordHasherService } from "@/core/user/infrastructure/service/BcryptPasswordHasherService";
import { NodeEventBus } from "../events/NodeEventBus";
import { SendWelcomeEmail } from "@/core/user/application/subscribers/SendWelcomeEmail";
import { JwtService } from "@/modules/auth/infrastructure/service/JwtService";
import { PrismaAuthorizationRepository } from "@/modules/authorization/infrastructure/repository/PrismaAuthorizationRepository";
import { CreatePermissionUseCase } from "@/modules/authorization/application/useCases/CreatePermissionUseCase";
import { DeletePermissionUseCase } from "@/modules/authorization/application/useCases/DeletePermissionUseCase";
import { GetAllPermissionsUseCase } from "@/modules/authorization/application/useCases/GetAllPermissionsUseCase";
import { GetPermissionUseCase } from "@/modules/authorization/application/useCases/GetPermissionUseCase";
import { GetUserPermissionsUseCase } from "@/modules/authorization/application/useCases/GetUserPermissionsUseCase";
import { UpdatePermissionUseCase } from "@/modules/authorization/application/useCases/UpdatePermissionUseCase";
import { CreatePermissionController } from "@/modules/authorization/infrastructure/http/controllers/CreatePermissionController";
import { DeletePermissionController } from "@/modules/authorization/infrastructure/http/controllers/DeletePermissionController";
import { GetAllPermissionsController } from "@/modules/authorization/infrastructure/http/controllers/GetAllPermissionsController";
import { GetPermissionController } from "@/modules/authorization/infrastructure/http/controllers/GetPermissionController";
import { GetUserPermissionsController } from "@/modules/authorization/infrastructure/http/controllers/GetUserPermissionsController";
import { UpdatePermissionController } from "@/modules/authorization/infrastructure/http/controllers/UpdatePermissionController";
import { LoginUseCase } from "@/modules/auth/application/useCases/LoginUseCase";
import { LogoutUseCase } from "@/modules/auth/application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/useCases/RefreshTokenUseCase";
import { RegisterUseCase } from "@/modules/auth/application/useCases/RegisterUseCase";
import { LoginController } from "@/modules/auth/infrastructure/http/controllers/LoginController";
import { LogoutController } from "@/modules/auth/infrastructure/http/controllers/LogoutController";
import { RefreshTokenController } from "@/modules/auth/infrastructure/http/controllers/RefreshTokenController";
import { RegisterController } from "@/modules/auth/infrastructure/http/controllers/RegisterController";
import { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import { CheckUserPermissionUseCase } from "@/modules/authorization/application/useCases/CheckUserPermissionUseCase";
import { PrismaRefreshTokenRepository } from "@/modules/auth/infrastructure/repository/PrismaRefreshTokenRepository";

// Propietario
import { PrismaPropietarioRepository } from "@/modules/propietario/infrastructure/repository/PrismaPropietarioRepository";
import { PrismaPropietarioDetalleQuery } from "@/modules/propietario/infrastructure/queries/PrismaPropietarioDetalleQuery";
import { PropietarioMapper } from "@/modules/propietario/application/mappers/PropietarioMapper";
import { RegistrarPropietarioUseCase } from "@/modules/propietario/application/useCases/RegistrarPropietarioUseCase";
import { ActualizarDatosPropietarioUseCase } from "@/modules/propietario/application/useCases/ActualizarDatosPropietarioUseCase";
import { ObtenerDetallePropietarioUseCase } from "@/modules/propietario/application/useCases/ObtenerDetallePropietarioUseCase";
import { ListarPropietariosUseCase } from "@/modules/propietario/application/useCases/ListarPropietariosUseCase";
import { EliminarPropietarioUseCase } from "@/modules/propietario/application/useCases/EliminarPropietarioUseCase";
import { RegistrarPropietarioController } from "@/modules/propietario/infrastructure/http/controllers/RegistrarPropietarioController";
import { ActualizarPropietarioController } from "@/modules/propietario/infrastructure/http/controllers/ActualizarPropietarioController";
import { ObtenerDetallePropietarioController } from "@/modules/propietario/infrastructure/http/controllers/ObtenerDetallePropietarioController";
import { ListarPropietariosController } from "@/modules/propietario/infrastructure/http/controllers/ListarPropietariosController";
import { EliminarPropietarioController } from "@/modules/propietario/infrastructure/http/controllers/EliminarPropietarioController";

// Insumos
import { PrismaInsumoRepository } from "@/modules/inventario-insumos/infrastructure/repository/PrismaInsumoRepository";
import { InsumoMapper } from "@/modules/inventario-insumos/application/mappers/InsumoMapper";
import { RegistrarInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/RegistrarInsumoUseCase";
import { AbastecerInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/AbastecerInsumoUseCase";
import { ConsumirInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ConsumirInsumoUseCase";
import { ObtenerInsumosCriticosUseCase } from "@/modules/inventario-insumos/application/useCases/ObtenerInsumosCriticosUseCase";
import { ListarInsumosUseCase } from "@/modules/inventario-insumos/application/useCases/ListarInsumosUseCase";
import { ObtenerDetalleInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ObtenerDetalleInsumoUseCase";
import { EliminarInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/EliminarInsumoUseCase";
import { RegistrarInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/RegistrarInsumoController";
import { AbastecerInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/AbastecerInsumoController";
import { ConsumirInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ConsumirInsumoController";
import { ObtenerInsumosCriticosController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ObtenerInsumosCriticosController";
import { ListarInsumosController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ListarInsumosController";
import { ObtenerDetalleInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ObtenerDetalleInsumoController";
import { EliminarInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/EliminarInsumoController";

// Rancho
import { PrismaRanchoRepository } from "@/modules/rancho/infrastructure/repository/PrismaRanchoRepository";
import { RanchoMapper } from "@/modules/rancho/application/mappers/RanchoMapper";
import { RegistrarRanchoUseCase } from "@/modules/rancho/application/useCases/RegistrarRanchoUseCase";
import { ActualizarRanchoUseCase } from "@/modules/rancho/application/useCases/ActualizarRanchoUseCase";
import { ObtenerCapacidadRanchoUseCase } from "@/modules/rancho/application/useCases/ObtenerCapacidadRanchoUseCase";
import { ListarRanchosUseCase } from "@/modules/rancho/application/useCases/ListarRanchosUseCase";
import { ObtenerDetalleRanchoUseCase } from "@/modules/rancho/application/useCases/ObtenerDetalleRanchoUseCase";
import { EliminarRanchoUseCase } from "@/modules/rancho/application/useCases/EliminarRanchoUseCase";
import { RegistrarRanchoController } from "@/modules/rancho/infrastructure/http/controllers/RegistrarRanchoController";
import { ActualizarRanchoController } from "@/modules/rancho/infrastructure/http/controllers/ActualizarRanchoController";
import { ObtenerCapacidadRanchoController } from "@/modules/rancho/infrastructure/http/controllers/ObtenerCapacidadRanchoController";
import { ListarRanchosController } from "@/modules/rancho/infrastructure/http/controllers/ListarRanchosController";
import { ObtenerDetalleRanchoController } from "@/modules/rancho/infrastructure/http/controllers/ObtenerDetalleRanchoController";
import { EliminarRanchoController } from "@/modules/rancho/infrastructure/http/controllers/EliminarRanchoController";

// Ganado
import { PrismaGanadoRepository } from "@/modules/ganado/infrastructure/repository/PrismaGanadoRepository";
import { PrismaGanadoDetalleQuery } from "@/modules/ganado/infrastructure/queries/PrismaGanadoDetalleQuery";
import { GanadoMapper } from "@/modules/ganado/application/mappers/GanadoMapper";
import { RegistrarGanadoUseCase } from "@/modules/ganado/application/useCases/RegistrarGanadoUseCase";
import { RegistrarPesajeUseCase } from "@/modules/ganado/application/useCases/RegistrarPesajeUseCase";
import { TrasladarGanadoUseCase } from "@/modules/ganado/application/useCases/TrasladarGanadoUseCase";
import { ObtenerFichaGanadoUseCase } from "@/modules/ganado/application/useCases/ObtenerFichaGanadoUseCase";
import { ListarGanadosUseCase } from "@/modules/ganado/application/useCases/ListarGanadosUseCase";
import { EliminarGanadoUseCase } from "@/modules/ganado/application/useCases/EliminarGanadoUseCase";
import { ActualizarGanadoUseCase } from "@/modules/ganado/application/useCases/ActualizarGanadoUseCase";
import { RegistrarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/RegistrarGanadoController";
import { RegistrarPesajeController } from "@/modules/ganado/infrastructure/http/controllers/RegistrarPesajeController";
import { TrasladarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/TrasladarGanadoController";
import { ObtenerFichaGanadoController } from "@/modules/ganado/infrastructure/http/controllers/ObtenerFichaGanadoController";
import { ListarGanadosController } from "@/modules/ganado/infrastructure/http/controllers/ListarGanadosController";
import { EliminarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/EliminarGanadoController";
import { ActualizarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/ActualizarGanadoController";

// Veterinario
import { PrismaVeterinarioRepository } from "@/modules/veterinario/infrastructure/repository/PrismaVeterinarioRepository";
import { VeterinarioMapper } from "@/modules/veterinario/application/mappers/VeterinarioMapper";
import { RegistrarVeterinarioUseCase } from "@/modules/veterinario/application/useCases/RegistrarVeterinarioUseCase";
import { ObtenerDetalleVeterinarioUseCase } from "@/modules/veterinario/application/useCases/ObtenerDetalleVeterinarioUseCase";
import { ListarVeterinariosUseCase } from "@/modules/veterinario/application/useCases/ListarVeterinariosUseCase";
import { ActualizarVeterinarioUseCase } from "@/modules/veterinario/application/useCases/ActualizarVeterinarioUseCase";
import { EliminarVeterinarioUseCase } from "@/modules/veterinario/application/useCases/EliminarVeterinarioUseCase";
import { RegistrarVeterinarioController } from "@/modules/veterinario/infrastructure/http/controllers/RegistrarVeterinarioController";
import { ObtenerDetalleVeterinarioController } from "@/modules/veterinario/infrastructure/http/controllers/ObtenerDetalleVeterinarioController";
import { ListarVeterinariosController } from "@/modules/veterinario/infrastructure/http/controllers/ListarVeterinariosController";
import { ActualizarVeterinarioController } from "@/modules/veterinario/infrastructure/http/controllers/ActualizarVeterinarioController";
import { EliminarVeterinarioController } from "@/modules/veterinario/infrastructure/http/controllers/EliminarVeterinarioController";
import { VeterinarioRouter } from "@/modules/veterinario/infrastructure/http/routes/VeterinarioRouter";

// Register Tokens
container.register("UserRepository", {
	useClass: PrismaUserRepository,
});

container.register("PasswordHasher", {
	useClass: BcryptPasswordHasherService,
});

container.register("JwtService", {
	useClass: JwtService,
});

container.register("AuthorizationRepository", {
	useClass: PrismaAuthorizationRepository,
});

container.register("AuthMiddleware", {
	useClass: AuthMiddleware,
});

container.register("RequirePermissionMiddleware", {
	useClass: RequirePermissionMiddleware,
});

container.register("CheckUserPermissionUseCase", {
	useClass: CheckUserPermissionUseCase,
});

container.register("RefreshTokenRepository", {
	useClass: PrismaRefreshTokenRepository,
});

container.register("RazaRepository", {
	useClass: PrismaRazaRepository,
});

// Módulo User - Use Cases
container.register("CreateUserUseCase", { useClass: CreateUserUseCase });
container.register("GetAllUsersUseCase", { useClass: GetAllUsersUseCase });
container.register("GetOneUserUseCase", { useClass: GetOneUserUseCase });
container.register("UpdateUserUseCase", { useClass: UpdateUserUseCase });
container.register("DeleteUserUseCase", { useClass: DeleteUserUseCase });

// Módulo User - Controladores
container.register("CreateUserController", { useClass: CreateUserController });
container.register("GetAllUsersController", {
	useClass: GetAllUsersController,
});
container.register("GetOneUserController", { useClass: GetOneUserController });
container.register("UpdateUserController", { useClass: UpdateUserController });
container.register("DeleteUserController", { useClass: DeleteUserController });

// Módulo Authorization - Use Cases
container.register("CreatePermissionUseCase", {
	useClass: CreatePermissionUseCase,
});
container.register("DeletePermissionUseCase", {
	useClass: DeletePermissionUseCase,
});
container.register("GetAllPermissionsUseCase", {
	useClass: GetAllPermissionsUseCase,
});
container.register("GetPermissionUseCase", { useClass: GetPermissionUseCase });
container.register("GetUserPermissionsUseCase", {
	useClass: GetUserPermissionsUseCase,
});
container.register("UpdatePermissionUseCase", {
	useClass: UpdatePermissionUseCase,
});

// Módulo Authorization - Controladores
container.register("CreatePermissionController", {
	useClass: CreatePermissionController,
});
container.register("DeletePermissionController", {
	useClass: DeletePermissionController,
});
container.register("GetAllPermissionsController", {
	useClass: GetAllPermissionsController,
});
container.register("GetPermissionController", {
	useClass: GetPermissionController,
});
container.register("GetUserPermissionsController", {
	useClass: GetUserPermissionsController,
});
container.register("UpdatePermissionController", {
	useClass: UpdatePermissionController,
});

// Módulo Auth - Use Cases
container.register("LoginUseCase", { useClass: LoginUseCase });
container.register("LogoutUseCase", { useClass: LogoutUseCase });
container.register("RefreshTokenUseCase", { useClass: RefreshTokenUseCase });
container.register("RegisterUseCase", { useClass: RegisterUseCase });

// Módulo Auth - Controladores
container.register("LoginController", { useClass: LoginController });
container.register("LogoutController", { useClass: LogoutController });
container.register("RefreshTokenController", {
	useClass: RefreshTokenController,
});
container.register("RegisterController", { useClass: RegisterController });

// Módulo Raza - Use Cases
container.register("RegisterRazaUseCase", { useClass: RegisterRazaUseCase });
container.register("ObtenerCatalogoRazasUseCase", {
	useClass: ObtenerCatalogoRazasUseCase,
});
container.register("UpdateRazaUseCase", { useClass: UpdateRazaUseCase });
container.register("DeleteRazaUseCase", { useClass: DeleteRazaUseCase });

// Módulo Raza - Controladores
container.register("RegisterRazaController", {
	useClass: RegisterRazaController,
});
container.register("ObtenerCatalogoRazasController", {
	useClass: ObtenerCatalogoRazasController,
});
container.register("UpdateRazaController", { useClass: UpdateRazaController });
container.register("DeleteRazaController", { useClass: DeleteRazaController });

container.register("RazaMapper", { useClass: RazaMapper });

// Módulo Propietario - Repositorios & Queries
container.register("PropietarioRepository", {
	useClass: PrismaPropietarioRepository,
});
container.register("PropietarioDetalleQuery", {
	useClass: PrismaPropietarioDetalleQuery,
});
container.register("PropietarioMapper", { useClass: PropietarioMapper });

// Módulo Propietario - Use Cases
container.register("RegistrarPropietarioUseCase", {
	useClass: RegistrarPropietarioUseCase,
});
container.register("ActualizarDatosPropietarioUseCase", {
	useClass: ActualizarDatosPropietarioUseCase,
});
container.register("ObtenerDetallePropietarioUseCase", {
	useClass: ObtenerDetallePropietarioUseCase,
});
container.register("ListarPropietariosUseCase", {
	useClass: ListarPropietariosUseCase,
});
container.register("EliminarPropietarioUseCase", {
	useClass: EliminarPropietarioUseCase,
});

// Módulo Propietario - Controladores
container.register("RegistrarPropietarioController", {
	useClass: RegistrarPropietarioController,
});
container.register("ActualizarPropietarioController", {
	useClass: ActualizarPropietarioController,
});
container.register("ObtenerDetallePropietarioController", {
	useClass: ObtenerDetallePropietarioController,
});
container.register("ListarPropietariosController", {
	useClass: ListarPropietariosController,
});
container.register("EliminarPropietarioController", {
	useClass: EliminarPropietarioController,
});

// Módulo Insumos - Repositorio & Mappers
container.register("InsumoRepository", { useClass: PrismaInsumoRepository });
container.register("InsumoMapper", { useClass: InsumoMapper });

// Módulo Insumos - Use Cases
container.register("RegistrarInsumoUseCase", {
	useClass: RegistrarInsumoUseCase,
});
container.register("AbastecerInsumoUseCase", {
	useClass: AbastecerInsumoUseCase,
});
container.register("ConsumirInsumoUseCase", {
	useClass: ConsumirInsumoUseCase,
});
container.register("ObtenerInsumosCriticosUseCase", {
	useClass: ObtenerInsumosCriticosUseCase,
});
container.register("ListarInsumosUseCase", { useClass: ListarInsumosUseCase });
container.register("ObtenerDetalleInsumoUseCase", {
	useClass: ObtenerDetalleInsumoUseCase,
});
container.register("EliminarInsumoUseCase", {
	useClass: EliminarInsumoUseCase,
});

// Módulo Insumos - Controladores
container.register("RegistrarInsumoController", {
	useClass: RegistrarInsumoController,
});
container.register("AbastecerInsumoController", {
	useClass: AbastecerInsumoController,
});
container.register("ConsumirInsumoController", {
	useClass: ConsumirInsumoController,
});
container.register("ObtenerInsumosCriticosController", {
	useClass: ObtenerInsumosCriticosController,
});
container.register("ListarInsumosController", {
	useClass: ListarInsumosController,
});
container.register("ObtenerDetalleInsumoController", {
	useClass: ObtenerDetalleInsumoController,
});
container.register("EliminarInsumoController", {
	useClass: EliminarInsumoController,
});

// Módulo Rancho - Repositorio & Mapper
container.register("RanchoRepository", { useClass: PrismaRanchoRepository });
container.register("RanchoMapper", { useClass: RanchoMapper });

// Módulo Rancho - Casos de Uso
container.register("RegistrarRanchoUseCase", {
	useClass: RegistrarRanchoUseCase,
});
container.register("ActualizarRanchoUseCase", {
	useClass: ActualizarRanchoUseCase,
});
container.register("ObtenerCapacidadRanchoUseCase", {
	useClass: ObtenerCapacidadRanchoUseCase,
});
container.register("ListarRanchosUseCase", { useClass: ListarRanchosUseCase });
container.register("ObtenerDetalleRanchoUseCase", {
	useClass: ObtenerDetalleRanchoUseCase,
});
container.register("EliminarRanchoUseCase", {
	useClass: EliminarRanchoUseCase,
});

// Módulo Rancho - Controladores
container.register("RegistrarRanchoController", {
	useClass: RegistrarRanchoController,
});
container.register("ActualizarRanchoController", {
	useClass: ActualizarRanchoController,
});
container.register("ObtenerCapacidadRanchoController", {
	useClass: ObtenerCapacidadRanchoController,
});
container.register("ListarRanchosController", {
	useClass: ListarRanchosController,
});
container.register("ObtenerDetalleRanchoController", {
	useClass: ObtenerDetalleRanchoController,
});
container.register("EliminarRanchoController", {
	useClass: EliminarRanchoController,
});

// Módulo Ganado - Repositorio, Query & Mapper
container.register("GanadoRepository", { useClass: PrismaGanadoRepository });
container.register("GanadoDetalleQuery", {
	useClass: PrismaGanadoDetalleQuery,
});
container.register("GanadoMapper", { useClass: GanadoMapper });

// Módulo Ganado - Casos de Uso
container.register("RegistrarGanadoUseCase", {
	useClass: RegistrarGanadoUseCase,
});
container.register("RegistrarPesajeUseCase", {
	useClass: RegistrarPesajeUseCase,
});
container.register("TrasladarGanadoUseCase", {
	useClass: TrasladarGanadoUseCase,
});
container.register("ObtenerFichaGanadoUseCase", {
	useClass: ObtenerFichaGanadoUseCase,
});
container.register("ListarGanadosUseCase", { useClass: ListarGanadosUseCase });
container.register("EliminarGanadoUseCase", {
	useClass: EliminarGanadoUseCase,
});
container.register("ActualizarGanadoUseCase", {
	useClass: ActualizarGanadoUseCase,
});

// Módulo Ganado - Controladores
container.register("RegistrarGanadoController", {
	useClass: RegistrarGanadoController,
});
container.register("RegistrarPesajeController", {
	useClass: RegistrarPesajeController,
});
container.register("TrasladarGanadoController", {
	useClass: TrasladarGanadoController,
});
container.register("ObtenerFichaGanadoController", {
	useClass: ObtenerFichaGanadoController,
});
container.register("ListarGanadosController", {
	useClass: ListarGanadosController,
});
container.register("EliminarGanadoController", {
	useClass: EliminarGanadoController,
});
container.register("ActualizarGanadoController", {
	useClass: ActualizarGanadoController,
});

// Módulo Veterinario - Repositorio & Mapper
container.register("VeterinarioRepository", {
	useClass: PrismaVeterinarioRepository,
});
container.register("VeterinarioMapper", { useClass: VeterinarioMapper });

// Módulo Veterinario - Use Cases
container.register("RegistrarVeterinarioUseCase", {
	useClass: RegistrarVeterinarioUseCase,
});
container.register("ObtenerDetalleVeterinarioUseCase", {
	useClass: ObtenerDetalleVeterinarioUseCase,
});
container.register("ListarVeterinariosUseCase", {
	useClass: ListarVeterinariosUseCase,
});
container.register("ActualizarVeterinarioUseCase", {
	useClass: ActualizarVeterinarioUseCase,
});
container.register("EliminarVeterinarioUseCase", {
	useClass: EliminarVeterinarioUseCase,
});

// Módulo Veterinario - Controladores
container.register("RegistrarVeterinarioController", {
	useClass: RegistrarVeterinarioController,
});
container.register("ObtenerDetalleVeterinarioController", {
	useClass: ObtenerDetalleVeterinarioController,
});
container.register("ListarVeterinariosController", {
	useClass: ListarVeterinariosController,
});
container.register("ActualizarVeterinarioController", {
	useClass: ActualizarVeterinarioController,
});
container.register("EliminarVeterinarioController", {
	useClass: EliminarVeterinarioController,
});

// Módulo Veterinario - Router
container.register("VeterinarioRouter", { useClass: VeterinarioRouter });

container.register(
	"EventBus",
	{
		useClass: NodeEventBus,
	},
	{ lifecycle: Lifecycle.Singleton },
);

container.register("ImageStorageService", {
	useClass: LocalImageStorageService,
});

function bootstrapSubscribers() {
	const welcomeEmailSubscriber = container.resolve(SendWelcomeEmail);
	welcomeEmailSubscriber.setupSubscription();

	console.log("✅ Suscriptores de eventos inicializados");
}

bootstrapSubscribers();

export { container };

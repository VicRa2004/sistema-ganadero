import { Lifecycle, container } from "tsyringe";

// Import implementations
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

container.register(
	"EventBus",
	{
		useClass: NodeEventBus,
	},
	{ lifecycle: Lifecycle.Singleton },
);

function bootstrapSubscribers() {
	const welcomeEmailSubscriber = container.resolve(SendWelcomeEmail);
	welcomeEmailSubscriber.setupSubscription();

	console.log("✅ Suscriptores de eventos inicializados");
}

bootstrapSubscribers();

export { container };

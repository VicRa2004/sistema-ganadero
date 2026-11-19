import { Lifecycle, container } from "tsyringe";

// Import implementations
import { PrismaTransactionRunner } from "@/core/shared/infrastructure/libs/PrismaTransactionRunner";
import { S3ImageStorageService } from "@/core/shared/infrastructure/libs/S3ImageStorageService";
import { env } from "@/core/config/env";
import { LocalImageStorageService } from "@/core/shared/infrastructure/libs/LocalImageStorageService";
import { LocalDocumentStorageService } from "@/core/shared/infrastructure/libs/LocalDocumentStorageService";
import { S3DocumentStorageService } from "@/core/shared/infrastructure/libs/S3DocumentStorageService";
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
import { JwtService } from "@/modules/auth/infrastructure/service/JwtService";
import { PrismaAuthorizationRepository } from "@/modules/authorization/infrastructure/repository/PrismaAuthorizationRepository";
import { CreatePermissionUseCase } from "@/modules/authorization/application/useCases/CreatePermissionUseCase";
import { DeletePermissionUseCase } from "@/modules/authorization/application/useCases/DeletePermissionUseCase";
import { GetAllPermissionsUseCase } from "@/modules/authorization/application/useCases/GetAllPermissionsUseCase";
import { GetPermissionUseCase } from "@/modules/authorization/application/useCases/GetPermissionUseCase";
import { GetUserPermissionsUseCase } from "@/modules/authorization/application/useCases/GetUserPermissionsUseCase";
import { UpdatePermissionUseCase } from "@/modules/authorization/application/useCases/UpdatePermissionUseCase";
import { GetAllRolesUseCase } from "@/modules/authorization/application/useCases/GetAllRolesUseCase";
import { GetUserAccessUseCase } from "@/modules/authorization/application/useCases/GetUserAccessUseCase";
import { AssignUserRolesUseCase } from "@/modules/authorization/application/useCases/AssignUserRolesUseCase";
import { AssignUserDirectPermissionsUseCase } from "@/modules/authorization/application/useCases/AssignUserDirectPermissionsUseCase";
import { CreatePermissionController } from "@/modules/authorization/infrastructure/http/controllers/CreatePermissionController";
import { DeletePermissionController } from "@/modules/authorization/infrastructure/http/controllers/DeletePermissionController";
import { GetAllPermissionsController } from "@/modules/authorization/infrastructure/http/controllers/GetAllPermissionsController";
import { GetPermissionController } from "@/modules/authorization/infrastructure/http/controllers/GetPermissionController";
import { GetUserPermissionsController } from "@/modules/authorization/infrastructure/http/controllers/GetUserPermissionsController";
import { UpdatePermissionController } from "@/modules/authorization/infrastructure/http/controllers/UpdatePermissionController";
import { GetAllRolesController } from "@/modules/authorization/infrastructure/http/controllers/GetAllRolesController";
import { GetUserAccessController } from "@/modules/authorization/infrastructure/http/controllers/GetUserAccessController";
import { AssignUserRolesController } from "@/modules/authorization/infrastructure/http/controllers/AssignUserRolesController";
import { AssignUserDirectPermissionsController } from "@/modules/authorization/infrastructure/http/controllers/AssignUserDirectPermissionsController";
import { IssueSessionService } from "@/modules/auth/application/services/IssueSessionService";
import { LoginUseCase } from "@/modules/auth/application/useCases/LoginUseCase";
import { ChangePasswordUseCase } from "@/modules/auth/application/useCases/ChangePasswordUseCase";
import { LogoutUseCase } from "@/modules/auth/application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/useCases/RefreshTokenUseCase";
import { RegisterUseCase } from "@/modules/auth/application/useCases/RegisterUseCase";
import { LoginController } from "@/modules/auth/infrastructure/http/controllers/LoginController";
import { ChangePasswordController } from "@/modules/auth/infrastructure/http/controllers/ChangePasswordController";
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
import { PrismaMovimientoInsumoRepository } from "@/modules/inventario-insumos/infrastructure/repository/PrismaMovimientoInsumoRepository";
import { InsumoMapper } from "@/modules/inventario-insumos/application/mappers/InsumoMapper";
import { MovimientoInsumoMapper } from "@/modules/inventario-insumos/application/mappers/MovimientoInsumoMapper";
import { RegistrarInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/RegistrarInsumoUseCase";
import { ActualizarInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ActualizarInsumoUseCase";
import { AbastecerInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/AbastecerInsumoUseCase";
import { ConsumirInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ConsumirInsumoUseCase";
import { AjustarStockInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/AjustarStockInsumoUseCase";
import { ListarKardexInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ListarKardexInsumoUseCase";
import { ObtenerInsumosCriticosUseCase } from "@/modules/inventario-insumos/application/useCases/ObtenerInsumosCriticosUseCase";
import { ListarInsumosUseCase } from "@/modules/inventario-insumos/application/useCases/ListarInsumosUseCase";
import { ObtenerDetalleInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/ObtenerDetalleInsumoUseCase";
import { EliminarInsumoUseCase } from "@/modules/inventario-insumos/application/useCases/EliminarInsumoUseCase";
import { RegistrarInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/RegistrarInsumoController";
import { ActualizarInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ActualizarInsumoController";
import { AbastecerInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/AbastecerInsumoController";
import { ConsumirInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ConsumirInsumoController";
import { AjustarStockInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/AjustarStockInsumoController";
import { ListarKardexInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ListarKardexInsumoController";
import { ObtenerInsumosCriticosController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ObtenerInsumosCriticosController";
import { ListarInsumosController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ListarInsumosController";
import { ObtenerDetalleInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ObtenerDetalleInsumoController";
import { EliminarInsumoController } from "@/modules/inventario-insumos/infrastructure/http/controllers/EliminarInsumoController";
import { InsumoRouter } from "@/modules/inventario-insumos/infrastructure/http/routes/InsumoRouter";

// Terreno
import { PrismaTerrenoRepository } from "@/modules/terreno/infrastructure/repository/PrismaTerrenoRepository";
import { TerrenoMapper } from "@/modules/terreno/application/mappers/TerrenoMapper";
import { RegistrarTerrenoUseCase } from "@/modules/terreno/application/useCases/RegistrarTerrenoUseCase";
import { ActualizarTerrenoUseCase } from "@/modules/terreno/application/useCases/ActualizarTerrenoUseCase";
import { ObtenerCapacidadTerrenoUseCase } from "@/modules/terreno/application/useCases/ObtenerCapacidadTerrenoUseCase";
import { ListarTerrenosUseCase } from "@/modules/terreno/application/useCases/ListarTerrenosUseCase";
import { ObtenerDetalleTerrenoUseCase } from "@/modules/terreno/application/useCases/ObtenerDetalleTerrenoUseCase";
import { EliminarTerrenoUseCase } from "@/modules/terreno/application/useCases/EliminarTerrenoUseCase";
import { RegistrarTerrenoController } from "@/modules/terreno/infrastructure/http/controllers/RegistrarTerrenoController";
import { ActualizarTerrenoController } from "@/modules/terreno/infrastructure/http/controllers/ActualizarTerrenoController";
import { ObtenerCapacidadTerrenoController } from "@/modules/terreno/infrastructure/http/controllers/ObtenerCapacidadTerrenoController";
import { ListarTerrenosController } from "@/modules/terreno/infrastructure/http/controllers/ListarTerrenosController";
import { ObtenerDetalleTerrenoController } from "@/modules/terreno/infrastructure/http/controllers/ObtenerDetalleTerrenoController";
import { EliminarTerrenoController } from "@/modules/terreno/infrastructure/http/controllers/EliminarTerrenoController";

// Ganado
import { PrismaGanadoRepository } from "@/modules/ganado/infrastructure/repository/PrismaGanadoRepository";
import { PrismaGanadoDetalleQuery } from "@/modules/ganado/infrastructure/queries/PrismaGanadoDetalleQuery";
import { PrismaMotivoBajaRepository } from "@/modules/ganado/infrastructure/repository/PrismaMotivoBajaRepository";
import { GanadoMapper } from "@/modules/ganado/application/mappers/GanadoMapper";
import { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { GanadoLinajeService } from "@/modules/ganado/application/services/GanadoLinajeService";
import { ObtenerGenealogiaUseCase } from "@/modules/ganado/application/useCases/ObtenerGenealogiaUseCase";
import { ObtenerGenealogiaController } from "@/modules/ganado/infrastructure/http/controllers/ObtenerGenealogiaController";
import { RegistrarGanadoUseCase } from "@/modules/ganado/application/useCases/RegistrarGanadoUseCase";
import { RegistrarPesajeUseCase } from "@/modules/ganado/application/useCases/RegistrarPesajeUseCase";
import { ListarPesajesUseCase } from "@/modules/ganado/application/useCases/ListarPesajesUseCase";
import { TrasladarGanadoUseCase } from "@/modules/ganado/application/useCases/TrasladarGanadoUseCase";
import { ObtenerFichaGanadoUseCase } from "@/modules/ganado/application/useCases/ObtenerFichaGanadoUseCase";
import { ListarGanadosUseCase } from "@/modules/ganado/application/useCases/ListarGanadosUseCase";
import { EliminarGanadoUseCase } from "@/modules/ganado/application/useCases/EliminarGanadoUseCase";
import { ActualizarGanadoUseCase } from "@/modules/ganado/application/useCases/ActualizarGanadoUseCase";
import { DarDeBajaGanadoUseCase } from "@/modules/ganado/application/useCases/DarDeBajaGanadoUseCase";
import { ListarMotivosBajaUseCase } from "@/modules/ganado/application/useCases/ListarMotivosBajaUseCase";
import { RegistrarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/RegistrarGanadoController";
import { RegistrarPesajeController } from "@/modules/ganado/infrastructure/http/controllers/RegistrarPesajeController";
import { ListarPesajesController } from "@/modules/ganado/infrastructure/http/controllers/ListarPesajesController";
import { TrasladarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/TrasladarGanadoController";
import { ObtenerFichaGanadoController } from "@/modules/ganado/infrastructure/http/controllers/ObtenerFichaGanadoController";
import { ListarGanadosController } from "@/modules/ganado/infrastructure/http/controllers/ListarGanadosController";
import { EliminarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/EliminarGanadoController";
import { ActualizarGanadoController } from "@/modules/ganado/infrastructure/http/controllers/ActualizarGanadoController";
import { DarDeBajaGanadoController } from "@/modules/ganado/infrastructure/http/controllers/DarDeBajaGanadoController";
import { ListarMotivosBajaController } from "@/modules/ganado/infrastructure/http/controllers/ListarMotivosBajaController";

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

// Sesión Sanitaria
import { PrismaSesionSanitariaRepository } from "@/modules/sesion-sanitaria/infrastructure/repository/PrismaSesionSanitariaRepository";
import { SesionSanitariaMapper } from "@/modules/sesion-sanitaria/application/mappers/SesionSanitariaMapper";
import { SesionAccessService } from "@/modules/sesion-sanitaria/application/services/SesionAccessService";
import { RegistrarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/RegistrarSesionSanitariaUseCase";
import { ListarSesionesSanitariasUseCase } from "@/modules/sesion-sanitaria/application/useCases/ListarSesionesSanitariasUseCase";
import { ObtenerDetalleSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/ObtenerDetalleSesionSanitariaUseCase";
import { RegistrarResultadoAnimalUseCase } from "@/modules/sesion-sanitaria/application/useCases/RegistrarResultadoAnimalUseCase";
import { ObtenerHistorialSanitarioGanadoUseCase } from "@/modules/sesion-sanitaria/application/useCases/ObtenerHistorialSanitarioGanadoUseCase";
import { EliminarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/EliminarSesionSanitariaUseCase";
import { RegistrarSesionSanitariaController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/RegistrarSesionSanitariaController";
import { ListarSesionesSanitariasController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ListarSesionesSanitariasController";
import { ObtenerDetalleSesionSanitariaController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ObtenerDetalleSesionSanitariaController";
import { RegistrarResultadoAnimalController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/RegistrarResultadoAnimalController";
import { ObtenerHistorialSanitarioGanadoController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ObtenerHistorialSanitarioGanadoController";
import { EliminarSesionSanitariaController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/EliminarSesionSanitariaController";
import { SesionSanitariaRouter } from "@/modules/sesion-sanitaria/infrastructure/http/routes/SesionSanitariaRouter";

// Tratamiento Médico
import { PrismaTratamientoMedicoRepository } from "@/modules/tratamiento-medico/infrastructure/repository/PrismaTratamientoMedicoRepository";
import { TratamientoMedicoMapper } from "@/modules/tratamiento-medico/application/mappers/TratamientoMedicoMapper";
import { TratamientoAccessService } from "@/modules/tratamiento-medico/application/services/TratamientoAccessService";
import { RecetarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/RecetarTratamientoUseCase";
import { RegistrarAplicacionDiariaUseCase } from "@/modules/tratamiento-medico/application/useCases/RegistrarAplicacionDiariaUseCase";
import { FinalizarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/FinalizarTratamientoUseCase";
import { ActualizarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/ActualizarTratamientoUseCase";
import { ObtenerTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/ObtenerTratamientoUseCase";
import { ListarTratamientosUseCase } from "@/modules/tratamiento-medico/application/useCases/ListarTratamientosUseCase";
import { ListarTratamientosPorGanadoUseCase } from "@/modules/tratamiento-medico/application/useCases/ListarTratamientosPorGanadoUseCase";
import { EliminarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/EliminarTratamientoUseCase";
import { RecetarTratamientoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/RecetarTratamientoController";
import { RegistrarAplicacionDiariaController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/RegistrarAplicacionDiariaController";
import { FinalizarTratamientoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/FinalizarTratamientoController";
import { ActualizarTratamientoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/ActualizarTratamientoController";
import { ObtenerTratamientoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/ObtenerTratamientoController";
import { ListarTratamientosController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/ListarTratamientosController";
import { ListarTratamientosPorGanadoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/ListarTratamientosPorGanadoController";
import { EliminarTratamientoController } from "@/modules/tratamiento-medico/infrastructure/http/controllers/EliminarTratamientoController";
import { TratamientoMedicoRouter } from "@/modules/tratamiento-medico/infrastructure/http/routes/TratamientoMedicoRouter";

// Notificaciones & Outbox
import { PrismaNotificacionRepository } from "@/core/notificacion/infrastructure/repository/PrismaNotificacionRepository";
import { NotificacionMapper } from "@/core/notificacion/application/mappers/NotificacionMapper";
import { NotificacionEventSubscriber } from "@/core/notificacion/application/subscribers/NotificacionEventSubscriber";
import { PrismaOutboxEventPublisher } from "@/core/notificacion/infrastructure/events/PrismaOutboxEventPublisher";
import { ListarNotificacionesUseCase } from "@/core/notificacion/application/useCases/ListarNotificacionesUseCase";
import { MarcarNotificacionLeidaUseCase } from "@/core/notificacion/application/useCases/MarcarNotificacionLeidaUseCase";
import { MarcarTodasLeidasUseCase } from "@/core/notificacion/application/useCases/MarcarTodasLeidasUseCase";
import { ObtenerPreferenciasNotificacionUseCase } from "@/core/notificacion/application/useCases/ObtenerPreferenciasNotificacionUseCase";
import { ActualizarPreferenciasNotificacionUseCase } from "@/core/notificacion/application/useCases/ActualizarPreferenciasNotificacionUseCase";
import { ListarNotificacionesController } from "@/core/notificacion/infrastructure/http/controllers/ListarNotificacionesController";
import { MarcarNotificacionLeidaController } from "@/core/notificacion/infrastructure/http/controllers/MarcarNotificacionLeidaController";
import { MarcarTodasLeidasController } from "@/core/notificacion/infrastructure/http/controllers/MarcarTodasLeidasController";
import { ObtenerPreferenciasNotificacionController } from "@/core/notificacion/infrastructure/http/controllers/ObtenerPreferenciasNotificacionController";
import { ActualizarPreferenciasNotificacionController } from "@/core/notificacion/infrastructure/http/controllers/ActualizarPreferenciasNotificacionController";
import { NotificacionRouter } from "@/core/notificacion/infrastructure/http/routes/NotificacionRouter";

// Insumos Export
import { ExportarInsumosUseCase } from "@/modules/inventario-insumos/application/useCases/ExportarInsumosUseCase";
import { ExportarInsumosCsvController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ExportarInsumosCsvController";
import { ExportarInsumosPdfController } from "@/modules/inventario-insumos/infrastructure/http/controllers/ExportarInsumosPdfController";

// Ganado Import / Export
import { ImportarGanadoCsvUseCase } from "@/modules/ganado/application/useCases/ImportarGanadoCsvUseCase";
import { ExportarGanadoUseCase } from "@/modules/ganado/application/useCases/ExportarGanadoUseCase";
import { DescargarPlantillaGanadoController } from "@/modules/ganado/infrastructure/http/controllers/DescargarPlantillaGanadoController";
import { PrevisualizarImportacionGanadoController } from "@/modules/ganado/infrastructure/http/controllers/PrevisualizarImportacionGanadoController";
import { ConfirmarImportacionGanadoController } from "@/modules/ganado/infrastructure/http/controllers/ConfirmarImportacionGanadoController";
import { ExportarGanadoCsvController } from "@/modules/ganado/infrastructure/http/controllers/ExportarGanadoCsvController";
import { ExportarFichaGanadoPdfController } from "@/modules/ganado/infrastructure/http/controllers/ExportarFichaGanadoPdfController";

// Sesión Sanitaria: Calendario, Planes y Export
import { PrismaPlanSanitarioRepository } from "@/modules/sesion-sanitaria/infrastructure/repository/PrismaPlanSanitarioRepository";
import { PrismaCalendarioSanitarioQuery } from "@/modules/sesion-sanitaria/infrastructure/queries/PrismaCalendarioSanitarioQuery";
import { PlanSanitarioMapper } from "@/modules/sesion-sanitaria/application/mappers/PlanSanitarioMapper";
import { RealizarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/RealizarSesionSanitariaUseCase";
import { CancelarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/CancelarSesionSanitariaUseCase";
import { ObtenerCalendarioSanitarioUseCase } from "@/modules/sesion-sanitaria/application/useCases/ObtenerCalendarioSanitarioUseCase";
import { CrearPlanSanitarioUseCase } from "@/modules/sesion-sanitaria/application/useCases/CrearPlanSanitarioUseCase";
import { ListarPlanesSanitariosUseCase } from "@/modules/sesion-sanitaria/application/useCases/ListarPlanesSanitariosUseCase";
import { ActualizarPlanSanitarioUseCase } from "@/modules/sesion-sanitaria/application/useCases/ActualizarPlanSanitarioUseCase";
import { EliminarPlanSanitarioUseCase } from "@/modules/sesion-sanitaria/application/useCases/EliminarPlanSanitarioUseCase";
import { GenerarSesionesPlanesUseCase } from "@/modules/sesion-sanitaria/application/useCases/GenerarSesionesPlanesUseCase";
import { ExportarSesionesSanitariasUseCase } from "@/modules/sesion-sanitaria/application/useCases/ExportarSesionesSanitariasUseCase";
import { RealizarSesionSanitariaController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/RealizarSesionSanitariaController";
import { CancelarSesionSanitariaController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/CancelarSesionSanitariaController";
import { ObtenerCalendarioSanitarioController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ObtenerCalendarioSanitarioController";
import { CrearPlanSanitarioController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/CrearPlanSanitarioController";
import { ListarPlanesSanitariosController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ListarPlanesSanitariosController";
import { ActualizarPlanSanitarioController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ActualizarPlanSanitarioController";
import { EliminarPlanSanitarioController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/EliminarPlanSanitarioController";
import { GenerarSesionesPlanesController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/GenerarSesionesPlanesController";
import { ExportarSesionesCsvController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ExportarSesionesCsvController";
import { ExportarSesionesPdfController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ExportarSesionesPdfController";
import { ExportarHistorialGanadoPdfController } from "@/modules/sesion-sanitaria/infrastructure/http/controllers/ExportarHistorialGanadoPdfController";

// Salud
import { EvaluarAlertasSanitariasUseCase } from "@/modules/salud/application/useCases/EvaluarAlertasSanitariasUseCase";
import { EvaluarAlertasSanitariasController } from "@/modules/salud/infrastructure/http/controllers/EvaluarAlertasSanitariasController";
import { SaludRouter } from "@/modules/salud/infrastructure/http/routes/SaludRouter";

// Dashboard
import { PrismaDashboardResumenQuery } from "@/modules/dashboard/infrastructure/queries/PrismaDashboardResumenQuery";
import { ObtenerDashboardResumenUseCase } from "@/modules/dashboard/application/useCases/ObtenerDashboardResumenUseCase";
import { ObtenerDashboardResumenController } from "@/modules/dashboard/infrastructure/http/controllers/ObtenerDashboardResumenController";
import { DashboardRouter } from "@/modules/dashboard/infrastructure/http/routes/DashboardRouter";

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
container.register("GetAllRolesUseCase", { useClass: GetAllRolesUseCase });
container.register("GetUserAccessUseCase", { useClass: GetUserAccessUseCase });
container.register("AssignUserRolesUseCase", {
	useClass: AssignUserRolesUseCase,
});
container.register("AssignUserDirectPermissionsUseCase", {
	useClass: AssignUserDirectPermissionsUseCase,
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
container.register("GetAllRolesController", {
	useClass: GetAllRolesController,
});
container.register("GetUserAccessController", {
	useClass: GetUserAccessController,
});
container.register("AssignUserRolesController", {
	useClass: AssignUserRolesController,
});
container.register("AssignUserDirectPermissionsController", {
	useClass: AssignUserDirectPermissionsController,
});

// Módulo Auth - Use Cases
container.register("IssueSessionService", { useClass: IssueSessionService });
container.register("LoginUseCase", { useClass: LoginUseCase });
container.register("LogoutUseCase", { useClass: LogoutUseCase });
container.register("ChangePasswordUseCase", {
	useClass: ChangePasswordUseCase,
});
container.register("RefreshTokenUseCase", { useClass: RefreshTokenUseCase });
container.register("RegisterUseCase", { useClass: RegisterUseCase });

// Módulo Auth - Controladores
container.register("LoginController", { useClass: LoginController });
container.register("LogoutController", { useClass: LogoutController });
container.register("ChangePasswordController", {
	useClass: ChangePasswordController,
});
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
container.register("MovimientoInsumoRepository", {
	useClass: PrismaMovimientoInsumoRepository,
});
container.register("InsumoMapper", { useClass: InsumoMapper });
container.register("MovimientoInsumoMapper", {
	useClass: MovimientoInsumoMapper,
});

// Módulo Insumos - Use Cases
container.register("RegistrarInsumoUseCase", {
	useClass: RegistrarInsumoUseCase,
});
container.register("ActualizarInsumoUseCase", {
	useClass: ActualizarInsumoUseCase,
});
container.register("AbastecerInsumoUseCase", {
	useClass: AbastecerInsumoUseCase,
});
container.register("ConsumirInsumoUseCase", {
	useClass: ConsumirInsumoUseCase,
});
container.register("AjustarStockInsumoUseCase", {
	useClass: AjustarStockInsumoUseCase,
});
container.register("ListarKardexInsumoUseCase", {
	useClass: ListarKardexInsumoUseCase,
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
container.register("ActualizarInsumoController", {
	useClass: ActualizarInsumoController,
});
container.register("AbastecerInsumoController", {
	useClass: AbastecerInsumoController,
});
container.register("ConsumirInsumoController", {
	useClass: ConsumirInsumoController,
});
container.register("AjustarStockInsumoController", {
	useClass: AjustarStockInsumoController,
});
container.register("ListarKardexInsumoController", {
	useClass: ListarKardexInsumoController,
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
container.register("InsumoRouter", { useClass: InsumoRouter });

// Módulo Terreno - Repositorio & Mapper
container.register("TerrenoRepository", { useClass: PrismaTerrenoRepository });
container.register("TerrenoMapper", { useClass: TerrenoMapper });

// Módulo Terreno - Casos de Uso
container.register("RegistrarTerrenoUseCase", {
	useClass: RegistrarTerrenoUseCase,
});
container.register("ActualizarTerrenoUseCase", {
	useClass: ActualizarTerrenoUseCase,
});
container.register("ObtenerCapacidadTerrenoUseCase", {
	useClass: ObtenerCapacidadTerrenoUseCase,
});
container.register("ListarTerrenosUseCase", {
	useClass: ListarTerrenosUseCase,
});
container.register("ObtenerDetalleTerrenoUseCase", {
	useClass: ObtenerDetalleTerrenoUseCase,
});
container.register("EliminarTerrenoUseCase", {
	useClass: EliminarTerrenoUseCase,
});

// Módulo Terreno - Controladores
container.register("RegistrarTerrenoController", {
	useClass: RegistrarTerrenoController,
});
container.register("ActualizarTerrenoController", {
	useClass: ActualizarTerrenoController,
});
container.register("ObtenerCapacidadTerrenoController", {
	useClass: ObtenerCapacidadTerrenoController,
});
container.register("ListarTerrenosController", {
	useClass: ListarTerrenosController,
});
container.register("ObtenerDetalleTerrenoController", {
	useClass: ObtenerDetalleTerrenoController,
});
container.register("EliminarTerrenoController", {
	useClass: EliminarTerrenoController,
});

// Módulo Ganado - Repositorio, Query & Mapper
container.register("GanadoRepository", { useClass: PrismaGanadoRepository });
container.register("GanadoDetalleQuery", {
	useClass: PrismaGanadoDetalleQuery,
});
container.register("MotivoBajaRepository", {
	useClass: PrismaMotivoBajaRepository,
});
container.register("GanadoMapper", { useClass: GanadoMapper });
container.register("GanadoAccessService", {
	useClass: GanadoAccessService,
});
container.register("GanadoLinajeService", {
	useClass: GanadoLinajeService,
});

// Módulo Ganado - Casos de Uso
container.register("RegistrarGanadoUseCase", {
	useClass: RegistrarGanadoUseCase,
});
container.register("RegistrarPesajeUseCase", {
	useClass: RegistrarPesajeUseCase,
});
container.register("ListarPesajesUseCase", {
	useClass: ListarPesajesUseCase,
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
container.register("DarDeBajaGanadoUseCase", {
	useClass: DarDeBajaGanadoUseCase,
});
container.register("ListarMotivosBajaUseCase", {
	useClass: ListarMotivosBajaUseCase,
});
container.register("ObtenerGenealogiaUseCase", {
	useClass: ObtenerGenealogiaUseCase,
});

// Módulo Ganado - Controladores
container.register("RegistrarGanadoController", {
	useClass: RegistrarGanadoController,
});
container.register("RegistrarPesajeController", {
	useClass: RegistrarPesajeController,
});
container.register("ListarPesajesController", {
	useClass: ListarPesajesController,
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
container.register("DarDeBajaGanadoController", {
	useClass: DarDeBajaGanadoController,
});
container.register("ListarMotivosBajaController", {
	useClass: ListarMotivosBajaController,
});
container.register("ObtenerGenealogiaController", {
	useClass: ObtenerGenealogiaController,
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

// Módulo Sesión Sanitaria - Repositorio & Mapper
container.register("SesionSanitariaRepository", {
	useClass: PrismaSesionSanitariaRepository,
});
container.register("SesionAccessService", {
	useClass: SesionAccessService,
});
container.register("SesionSanitariaMapper", {
	useClass: SesionSanitariaMapper,
});

// Módulo Sesión Sanitaria - Casos de Uso
container.register("RegistrarSesionSanitariaUseCase", {
	useClass: RegistrarSesionSanitariaUseCase,
});
container.register("ListarSesionesSanitariasUseCase", {
	useClass: ListarSesionesSanitariasUseCase,
});
container.register("ObtenerDetalleSesionSanitariaUseCase", {
	useClass: ObtenerDetalleSesionSanitariaUseCase,
});
container.register("RegistrarResultadoAnimalUseCase", {
	useClass: RegistrarResultadoAnimalUseCase,
});
container.register("ObtenerHistorialSanitarioGanadoUseCase", {
	useClass: ObtenerHistorialSanitarioGanadoUseCase,
});
container.register("EliminarSesionSanitariaUseCase", {
	useClass: EliminarSesionSanitariaUseCase,
});

// Módulo Sesión Sanitaria - Controladores
container.register("RegistrarSesionSanitariaController", {
	useClass: RegistrarSesionSanitariaController,
});
container.register("ListarSesionesSanitariasController", {
	useClass: ListarSesionesSanitariasController,
});
container.register("ObtenerDetalleSesionSanitariaController", {
	useClass: ObtenerDetalleSesionSanitariaController,
});
container.register("RegistrarResultadoAnimalController", {
	useClass: RegistrarResultadoAnimalController,
});
container.register("ObtenerHistorialSanitarioGanadoController", {
	useClass: ObtenerHistorialSanitarioGanadoController,
});
container.register("EliminarSesionSanitariaController", {
	useClass: EliminarSesionSanitariaController,
});

// Módulo Sesión Sanitaria - Router
container.register("SesionSanitariaRouter", {
	useClass: SesionSanitariaRouter,
});

// Módulo Tratamiento Médico - Repositorio, Servicio de Acceso & Mapper
container.register("TratamientoMedicoRepository", {
	useClass: PrismaTratamientoMedicoRepository,
});
container.register("TratamientoAccessService", {
	useClass: TratamientoAccessService,
});
container.register("TratamientoMedicoMapper", {
	useClass: TratamientoMedicoMapper,
});

// Módulo Tratamiento Médico - Casos de Uso
container.register("RecetarTratamientoUseCase", {
	useClass: RecetarTratamientoUseCase,
});
container.register("RegistrarAplicacionDiariaUseCase", {
	useClass: RegistrarAplicacionDiariaUseCase,
});
container.register("FinalizarTratamientoUseCase", {
	useClass: FinalizarTratamientoUseCase,
});
container.register("ActualizarTratamientoUseCase", {
	useClass: ActualizarTratamientoUseCase,
});
container.register("ObtenerTratamientoUseCase", {
	useClass: ObtenerTratamientoUseCase,
});
container.register("ListarTratamientosUseCase", {
	useClass: ListarTratamientosUseCase,
});
container.register("ListarTratamientosPorGanadoUseCase", {
	useClass: ListarTratamientosPorGanadoUseCase,
});
container.register("EliminarTratamientoUseCase", {
	useClass: EliminarTratamientoUseCase,
});

// Módulo Tratamiento Médico - Controladores
container.register("RecetarTratamientoController", {
	useClass: RecetarTratamientoController,
});
container.register("RegistrarAplicacionDiariaController", {
	useClass: RegistrarAplicacionDiariaController,
});
container.register("FinalizarTratamientoController", {
	useClass: FinalizarTratamientoController,
});
container.register("ActualizarTratamientoController", {
	useClass: ActualizarTratamientoController,
});
container.register("ObtenerTratamientoController", {
	useClass: ObtenerTratamientoController,
});
container.register("ListarTratamientosController", {
	useClass: ListarTratamientosController,
});
container.register("ListarTratamientosPorGanadoController", {
	useClass: ListarTratamientosPorGanadoController,
});
container.register("EliminarTratamientoController", {
	useClass: EliminarTratamientoController,
});

// Módulo Tratamiento Médico - Router
container.register("TratamientoMedicoRouter", {
	useClass: TratamientoMedicoRouter,
});

container.register(
	"EventBus",
	{
		useClass: NodeEventBus,
	},
	{ lifecycle: Lifecycle.Singleton },
);

if (env.STORAGE_DRIVER === "s3") {
	container.register("ImageStorageService", {
		useClass: S3ImageStorageService,
	});
	container.register("DocumentStorageService", {
		useClass: S3DocumentStorageService,
	});
} else {
	container.register("ImageStorageService", {
		useClass: LocalImageStorageService,
	});
	container.register("DocumentStorageService", {
		useClass: LocalDocumentStorageService,
	});
}
container.register("TransactionRunner", {
	useClass: PrismaTransactionRunner,
});

// Notificaciones & Outbox
container.register("NotificacionRepository", {
	useClass: PrismaNotificacionRepository,
});
container.register("NotificacionMapper", { useClass: NotificacionMapper });
container.register(
	"NotificacionEventSubscriber",
	{ useClass: NotificacionEventSubscriber },
	{ lifecycle: Lifecycle.Singleton },
);
container.register(
	"OutboxEventPublisher",
	{ useClass: PrismaOutboxEventPublisher },
	{ lifecycle: Lifecycle.Singleton },
);
container.register("ListarNotificacionesUseCase", {
	useClass: ListarNotificacionesUseCase,
});
container.register("MarcarNotificacionLeidaUseCase", {
	useClass: MarcarNotificacionLeidaUseCase,
});
container.register("MarcarTodasLeidasUseCase", {
	useClass: MarcarTodasLeidasUseCase,
});
container.register("ObtenerPreferenciasNotificacionUseCase", {
	useClass: ObtenerPreferenciasNotificacionUseCase,
});
container.register("ActualizarPreferenciasNotificacionUseCase", {
	useClass: ActualizarPreferenciasNotificacionUseCase,
});
container.register("ListarNotificacionesController", {
	useClass: ListarNotificacionesController,
});
container.register("MarcarNotificacionLeidaController", {
	useClass: MarcarNotificacionLeidaController,
});
container.register("MarcarTodasLeidasController", {
	useClass: MarcarTodasLeidasController,
});
container.register("ObtenerPreferenciasNotificacionController", {
	useClass: ObtenerPreferenciasNotificacionController,
});
container.register("ActualizarPreferenciasNotificacionController", {
	useClass: ActualizarPreferenciasNotificacionController,
});
container.register("NotificacionRouter", { useClass: NotificacionRouter });

// Insumos Export
container.register("ExportarInsumosUseCase", {
	useClass: ExportarInsumosUseCase,
});
container.register("ExportarInsumosCsvController", {
	useClass: ExportarInsumosCsvController,
});
container.register("ExportarInsumosPdfController", {
	useClass: ExportarInsumosPdfController,
});

// Ganado Import / Export
container.register("ImportarGanadoCsvUseCase", {
	useClass: ImportarGanadoCsvUseCase,
});
container.register("ExportarGanadoUseCase", {
	useClass: ExportarGanadoUseCase,
});
container.register("DescargarPlantillaGanadoController", {
	useClass: DescargarPlantillaGanadoController,
});
container.register("PrevisualizarImportacionGanadoController", {
	useClass: PrevisualizarImportacionGanadoController,
});
container.register("ConfirmarImportacionGanadoController", {
	useClass: ConfirmarImportacionGanadoController,
});
container.register("ExportarGanadoCsvController", {
	useClass: ExportarGanadoCsvController,
});
container.register("ExportarFichaGanadoPdfController", {
	useClass: ExportarFichaGanadoPdfController,
});

// Sesión Sanitaria: Calendario, Planes y Export
container.register("PlanSanitarioRepository", {
	useClass: PrismaPlanSanitarioRepository,
});
container.register("CalendarioSanitarioQuery", {
	useClass: PrismaCalendarioSanitarioQuery,
});
container.register("PlanSanitarioMapper", { useClass: PlanSanitarioMapper });
container.register("RealizarSesionSanitariaUseCase", {
	useClass: RealizarSesionSanitariaUseCase,
});
container.register("CancelarSesionSanitariaUseCase", {
	useClass: CancelarSesionSanitariaUseCase,
});
container.register("ObtenerCalendarioSanitarioUseCase", {
	useClass: ObtenerCalendarioSanitarioUseCase,
});
container.register("CrearPlanSanitarioUseCase", {
	useClass: CrearPlanSanitarioUseCase,
});
container.register("ListarPlanesSanitariosUseCase", {
	useClass: ListarPlanesSanitariosUseCase,
});
container.register("ActualizarPlanSanitarioUseCase", {
	useClass: ActualizarPlanSanitarioUseCase,
});
container.register("EliminarPlanSanitarioUseCase", {
	useClass: EliminarPlanSanitarioUseCase,
});
container.register("GenerarSesionesPlanesUseCase", {
	useClass: GenerarSesionesPlanesUseCase,
});
container.register("ExportarSesionesSanitariasUseCase", {
	useClass: ExportarSesionesSanitariasUseCase,
});
container.register("RealizarSesionSanitariaController", {
	useClass: RealizarSesionSanitariaController,
});
container.register("CancelarSesionSanitariaController", {
	useClass: CancelarSesionSanitariaController,
});
container.register("ObtenerCalendarioSanitarioController", {
	useClass: ObtenerCalendarioSanitarioController,
});
container.register("CrearPlanSanitarioController", {
	useClass: CrearPlanSanitarioController,
});
container.register("ListarPlanesSanitariosController", {
	useClass: ListarPlanesSanitariosController,
});
container.register("ActualizarPlanSanitarioController", {
	useClass: ActualizarPlanSanitarioController,
});
container.register("EliminarPlanSanitarioController", {
	useClass: EliminarPlanSanitarioController,
});
container.register("GenerarSesionesPlanesController", {
	useClass: GenerarSesionesPlanesController,
});
container.register("ExportarSesionesCsvController", {
	useClass: ExportarSesionesCsvController,
});
container.register("ExportarSesionesPdfController", {
	useClass: ExportarSesionesPdfController,
});
container.register("ExportarHistorialGanadoPdfController", {
	useClass: ExportarHistorialGanadoPdfController,
});

// Salud
container.register("EvaluarAlertasSanitariasUseCase", {
	useClass: EvaluarAlertasSanitariasUseCase,
});
container.register("EvaluarAlertasSanitariasController", {
	useClass: EvaluarAlertasSanitariasController,
});
container.register("SaludRouter", { useClass: SaludRouter });

// Dashboard
container.register("DashboardResumenQuery", {
	useClass: PrismaDashboardResumenQuery,
});
container.register(
	"ObtenerDashboardResumenUseCase",
	{ useClass: ObtenerDashboardResumenUseCase },
	{ lifecycle: Lifecycle.Singleton },
);
container.register("ObtenerDashboardResumenController", {
	useClass: ObtenerDashboardResumenController,
});
import { PrismaEventoReproductivoRepository } from "@/modules/reproduccion/infrastructure/repository/PrismaEventoReproductivoRepository";
import { PrismaIndicadoresReproductivosQuery } from "@/modules/reproduccion/infrastructure/queries/PrismaIndicadoresReproductivosQuery";
import { EventoReproductivoMapper } from "@/modules/reproduccion/application/mappers/EventoReproductivoMapper";
import { RegistrarEventoReproductivoUseCase } from "@/modules/reproduccion/application/useCases/RegistrarEventoReproductivoUseCase";
import { ListarEventosReproductivosUseCase } from "@/modules/reproduccion/application/useCases/ListarEventosReproductivosUseCase";
import { EliminarEventoReproductivoUseCase } from "@/modules/reproduccion/application/useCases/EliminarEventoReproductivoUseCase";
import { ObtenerIndicadoresReproductivosUseCase } from "@/modules/reproduccion/application/useCases/ObtenerIndicadoresReproductivosUseCase";
import { RegistrarEventoReproductivoController } from "@/modules/reproduccion/infrastructure/http/controllers/RegistrarEventoReproductivoController";
import { ListarEventosReproductivosController } from "@/modules/reproduccion/infrastructure/http/controllers/ListarEventosReproductivosController";
import { EliminarEventoReproductivoController } from "@/modules/reproduccion/infrastructure/http/controllers/EliminarEventoReproductivoController";
import { ObtenerIndicadoresReproductivosController } from "@/modules/reproduccion/infrastructure/http/controllers/ObtenerIndicadoresReproductivosController";
import { ReproduccionRouter } from "@/modules/reproduccion/infrastructure/http/routes/ReproduccionRouter";

container.register("DashboardRouter", { useClass: DashboardRouter });

// Reproducción
container.register("EventoReproductivoRepository", {
	useClass: PrismaEventoReproductivoRepository,
});
container.register("IndicadoresReproductivosQuery", {
	useClass: PrismaIndicadoresReproductivosQuery,
});
container.register("EventoReproductivoMapper", {
	useClass: EventoReproductivoMapper,
});
container.register("RegistrarEventoReproductivoUseCase", {
	useClass: RegistrarEventoReproductivoUseCase,
});
container.register("ListarEventosReproductivosUseCase", {
	useClass: ListarEventosReproductivosUseCase,
});
container.register("EliminarEventoReproductivoUseCase", {
	useClass: EliminarEventoReproductivoUseCase,
});
container.register("ObtenerIndicadoresReproductivosUseCase", {
	useClass: ObtenerIndicadoresReproductivosUseCase,
});
container.register("RegistrarEventoReproductivoController", {
	useClass: RegistrarEventoReproductivoController,
});
container.register("ListarEventosReproductivosController", {
	useClass: ListarEventosReproductivosController,
});
container.register("EliminarEventoReproductivoController", {
	useClass: EliminarEventoReproductivoController,
});
container.register("ObtenerIndicadoresReproductivosController", {
	useClass: ObtenerIndicadoresReproductivosController,
});
container.register("ReproduccionRouter", { useClass: ReproduccionRouter });

import { registerAlimentacionModule } from "@/modules/alimentacion/infrastructure/di/registerAlimentacionModule";
import { registerComercialModule } from "@/modules/comercial/infrastructure/di/registerComercialModule";
import { registerLoteModule } from "@/modules/lote/infrastructure/di/registerLoteModule";

registerLoteModule(container);
registerAlimentacionModule(container);
registerComercialModule(container);

export { container };

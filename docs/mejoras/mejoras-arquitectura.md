# Mejora técnica · Arquitectura

## 1. Política de propiedad compartida

El patrón `rol !== "ADMIN" && recurso.getUsuarioId() !== usuarioId` está copiado en muchos casos de uso (terreno, insumo, veterinario…).

- Crear un servicio de dominio `OwnershipPolicy` (o `assertCanAccess(recurso, actor)`) en `core/shared/domain/`.
- Los repositorios deben aceptar un `actor`/`scope` para filtrar en consulta y no solo en el caso de uso.
- Prerrequisito de U-4.

## 2. Servicio de sesión de autenticación

`LoginUseCase`, `RegisterUseCase` y `RefreshTokenUseCase` repiten generación de access token, refresh token y cálculo de expiración (7 días).

- Extraer `IssueSessionService` con una única constante de duración y un único punto donde se fija el payload del JWT.

## 3. Catálogo tipado de permisos

Los permisos son strings sueltos (`"ganado"`, `"read"`) en routers, seed y use cases.

- Crear `core/shared/domain/permissions.ts` con `RESOURCES` y `ACTIONS` como `as const` y un tipo `PermissionKey`.
- Usarlo en `RequirePermissionMiddleware.handle(...)` y en el seed para que un typo falle en compilación.

## 4. Observabilidad

- Logger estructurado (pino o similar, versión exacta) con `LOG_LEVEL`, reemplazando `console.*`.
- Middleware de `requestId` propagado a logs y a respuestas de error.
- Endpoints `/health` (liveness) y `/ready` (verifica BD).
- Métricas básicas (latencia, errores por ruta) opcional.

## 5. Abstracción de almacenamiento de imágenes

Ya existe `ImageStorageService`. Añadir una implementación S3/R2 y elegirla por env (`STORAGE_DRIVER=local|s3`). El volumen local impide escalar a varias instancias y no tiene backup.

- Procesar imágenes (resize/thumbnails, re-encode a WebP) al subir.
- Servir desde CDN/URL firmada si el bucket es privado.

## 6. Eventos de dominio

`NodeEventBus` y `SendWelcomeEmail` existen pero casi no se usan.

- Decidir: usarlos para alertas (stock bajo, vacuna próxima) o simplificar.
- Si se usan, añadir cola persistente (outbox) para no perder eventos.

## 7. Errores consistentes

- Un único formato de error: `{ error: { code, message, details?, requestId } }`.
- Mapeo central de errores de Prisma a `BaseError`.
- Eliminar los `{ success: false, error }` de middlewares para unificar con el resto.

## 8. Rutas

- Mover el `authMiddleware` a `router.use` y reducir repetición en cada router.
- Versionar la API (`/api/v1`) antes de abrirla a terceros.

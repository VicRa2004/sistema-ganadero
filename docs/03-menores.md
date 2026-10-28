# 🟡 Menores

Correcciones poco urgentes. Buenas para sesiones cortas o para limpiar antes de un release.

---

## m-1 · Dependencias residuales de Express

> ✅ **Implementado.** Eliminados `cookie-parser`, `express-rate-limit`, `supertest`, `@types/supertest` y `@types/swagger-ui-express` (ninguno se importaba). Se conserva `@types/node` junto a `@types/bun`: `@types/bun` lo necesita para los módulos `node:*` que usa la API.

- **Dónde:** `api/package.json`.
- **Eliminar:** `cookie-parser`, `express-rate-limit` (tras implementar U-3), `supertest` y `@types/supertest` (si no se usan en e2e), `@types/swagger-ui-express`, y revisar `@types/node` frente a `@types/bun`.
- Usar `pnpm --filter api remove <pkg>`.

## m-2 · Linter propio en `web`

> ✅ **Implementado.** Quitados el script `lint`, la dependencia `oxlint`, `web/.oxlintrc.json`, su entrada en `.dockerignore` y la sección de Oxlint del README de `web`. Solo queda Biome en la raíz.

- **Dónde:** `web/package.json` (`"lint": "oxlint"` y devDependency `oxlint`).
- **Problema:** AGENTS.md prohíbe linters locales; solo debe existir Biome en la raíz.
- **Acción:** quitar el script y la dependencia; confirmar que no hay `.oxlintrc*`.

## m-3 · `any` y casteos en la API

> ✅ **Implementado.** `toStatusCode()` (en `http/context.ts`) convierte `BaseError.code` a `ContentfulStatusCode` sin `any`; `JwtService` tipa `expiresIn` con `SignOptions["expiresIn"]`; `c.get("user")` está tipado (`AuthUser`) mediante `ContextVariableMap`, y `DomainEvent.data` pasó a `unknown` con `EventBus.subscribe` genérico. Los `any` que quedan están en specs y en `src/generated`.

- **Dónde:** `server.ts` (`(err as any).status`, `status as any`), `base.controller.ts` (`error.code as any`), `JwtService.ts` (`expiresIn as any`), `RequirePermissionMiddleware.ts`.
- **Acción:** tipar con `ContentfulStatusCode` de Hono y `StringValue` de `ms`/`jsonwebtoken`; tipar `c.get("user")` con `Hono<{ Variables: { user: JwtPayload } }>`.

## m-4 · README desactualizado y licencia

> ✅ **Implementado.** README reescrito (descripción real, requisitos, puesta en marcha, comandos, variables de entorno, Docker/Dokploy). `LICENCE.md` renombrado a `LICENSE` con el titular real.

- **Dónde:** `README.md` (describe "Hexacore", el boilerplate original), `LICENCE.md` vs enlace a `LICENSE`.
- **Acción:** reescribir con descripción real del proyecto, requisitos, variables de entorno, comandos (`pnpm dev`, migraciones, `create:admin`, seed), despliegue Docker/Dokploy; corregir el nombre/enlace de la licencia.

## m-5 · Docker: imagen final pesada, root y sin healthcheck

> ✅ **Implementado.** El builder usa `pnpm --filter api deploy --legacy --prod` y el runner copia solo la API desplegada, el cliente Prisma generado y `web/dist` (imagen de 756 MB a 591 MB). `prisma` pasó a `dependencies` porque `migrate deploy` corre dentro de la imagen. Corre como `USER bun` con `/app/api/uploads` escribible, `HEALTHCHECK` contra el nuevo `GET /health` (liveness, sin consultar la BD) y `.dockerignore` ya excluía `.env`, `node_modules` y `.git`. Verificado construyendo la imagen: contenedor `healthy`.

- **Dónde:** `Dockerfile`, `docker-compose.yml`.
- **Acción:**
  - El runner copia todo el workspace (incluye devDependencies y fuentes de `web`). Usar `pnpm deploy`/`prune --prod` y copiar solo `api/`, `web/dist` y lo necesario.
  - Añadir `USER bun` y asegurar permisos de escritura en `/app/api/uploads`.
  - Añadir `HEALTHCHECK` contra `/health` (crearlo, ver `mejoras-arquitectura.md`).
  - `.dockerignore`: confirmar que excluye `.env`, `node_modules`, `.git`.

## m-6 · Nombres de config y `NODE_ENV`

> ✅ **Implementado.** `prod`/`production` ya se normalizaban en `env.ts` (alias documentado). `api/.env.example` ahora define `NODE_ENV`, `PORT` y `HOST` (`CORS_ORIGINS` ya estaba).

- Unificar `prod`/`production` (ver M-11). El `.env.example` de la raíz usa `prod`; `api/.env.example` no define `NODE_ENV`, `PORT` ni `CORS_ORIGINS`.

## m-7 · Binding y proxy

> ✅ **Implementado.** Nueva variable `HOST` (por defecto `0.0.0.0`) usada en `index.ts`; el uso detrás de Traefik/Dokploy (`HOST`, `TRUST_PROXY`) está en el README y en `.env.example`.

- **Dónde:** `api/src/index.ts` (`hostname: "0.0.0.0"`).
- **Acción:** hacerlo configurable (`HOST`) y documentar el uso detrás de Traefik/Dokploy (IP real vía `X-Forwarded-For`).

## m-8 · Logs con emojis y `console.*` dispersos

> ✅ **Implementado.** Nuevo `core/config/logger.ts` (niveles, marca de tiempo, sin emojis; `debug` se omite en producción) que reemplaza los `console.*` de `src/`. Los scripts CLI (`seed`, `create-admin`, `migrate`) conservan `console` porque su salida es interactiva.

- **Dónde:** `index.ts`, `ConsumirInsumoUseCase`, `LocalImageStorageService`, `SendWelcomeEmail`.
- **Acción:** introducir un logger (ver `mejoras-arquitectura.md`) y reemplazar `console.*`.

## m-9 · `SendWelcomeEmail` solo hace `console.log`

> ✅ **Implementado.** Eliminado el suscriptor `SendWelcomeEmail` y `bootstrapSubscribers()`. Se conservan `CreateUserEvent` y el `EventBus` para cuando se implemente el envío real.

- Implementar de verdad (ver `feature-plataforma.md`, verificación de email) o eliminar el suscriptor para no aparentar funcionalidad inexistente.

## m-10 · Rutas con middleware repetido

> ✅ **Implementado.** Los routers protegidos usan `this.router.use(this.authMiddleware.handle)`. `RazaRouter` queda como está porque su `GET` es público.

- **Dónde:** `GanadoRouter` y otros routers repiten `authMiddleware.handle` en cada ruta.
- **Acción:** usar `this.router.use(this.authMiddleware.handle)` como ya hace `UserRouter`.

## m-11 · Redirección con recarga completa

> ✅ **Implementado.** Se quitó `window.location.href` de `web/src/config/axios.ts`; `main.tsx` suscribe el store y navega a `/login` con el router cuando el access token pasa a `null`.

- **Dónde:** `web/src/config/api.ts` (`window.location.href = "/login"` al fallar el refresh).
- **Acción:** usar el router de TanStack (`router.navigate`) o un evento del store para evitar el reload.

## m-12 · Mensaje de seed y permisos revisables

> ✅ **Implementado.** Los recursos del seed coincidían con los routers (`"turnos"` solo estaba en comentarios, ya corregidos). Nuevo catálogo `modules/authorization/domain/Recursos.ts` (`RECURSOS`, tipo `Recurso`): el seed lo usa y `RequirePermissionMiddleware.handle` exige `Recurso`, así que un recurso mal escrito falla al compilar.

- **Dónde:** `api/prisma/seed.ts`.
- Revisar que los recursos del seed (`terreno`, `inventario-insumos`, `sesiones-sanitarias`, `razas`, `propietario`…) coinciden exactamente con los strings que piden los routers; un error tipográfico daría 403 silencioso. Idealmente, centralizarlos en un catálogo (ver `mejoras-arquitectura.md`).

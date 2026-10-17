# 🟡 Menores

Correcciones poco urgentes. Buenas para sesiones cortas o para limpiar antes de un release.

---

## m-1 · Dependencias residuales de Express

- **Dónde:** `api/package.json`.
- **Eliminar:** `cookie-parser`, `express-rate-limit` (tras implementar U-3), `supertest` y `@types/supertest` (si no se usan en e2e), `@types/swagger-ui-express`, y revisar `@types/node` frente a `@types/bun`.
- Usar `pnpm --filter api remove <pkg>`.

## m-2 · Linter propio en `web`

- **Dónde:** `web/package.json` (`"lint": "oxlint"` y devDependency `oxlint`).
- **Problema:** AGENTS.md prohíbe linters locales; solo debe existir Biome en la raíz.
- **Acción:** quitar el script y la dependencia; confirmar que no hay `.oxlintrc*`.

## m-3 · `any` y casteos en la API

- **Dónde:** `server.ts` (`(err as any).status`, `status as any`), `base.controller.ts` (`error.code as any`), `JwtService.ts` (`expiresIn as any`), `RequirePermissionMiddleware.ts`.
- **Acción:** tipar con `ContentfulStatusCode` de Hono y `StringValue` de `ms`/`jsonwebtoken`; tipar `c.get("user")` con `Hono<{ Variables: { user: JwtPayload } }>`.

## m-4 · README desactualizado y licencia

- **Dónde:** `README.md` (describe "Hexacore", el boilerplate original), `LICENCE.md` vs enlace a `LICENSE`.
- **Acción:** reescribir con descripción real del proyecto, requisitos, variables de entorno, comandos (`pnpm dev`, migraciones, `create:admin`, seed), despliegue Docker/Dokploy; corregir el nombre/enlace de la licencia.

## m-5 · Docker: imagen final pesada, root y sin healthcheck

- **Dónde:** `Dockerfile`, `docker-compose.yml`.
- **Acción:**
  - El runner copia todo el workspace (incluye devDependencies y fuentes de `web`). Usar `pnpm deploy`/`prune --prod` y copiar solo `api/`, `web/dist` y lo necesario.
  - Añadir `USER bun` y asegurar permisos de escritura en `/app/api/uploads`.
  - Añadir `HEALTHCHECK` contra `/health` (crearlo, ver `mejoras-arquitectura.md`).
  - `.dockerignore`: confirmar que excluye `.env`, `node_modules`, `.git`.

## m-6 · Nombres de config y `NODE_ENV`

- Unificar `prod`/`production` (ver M-11). El `.env.example` de la raíz usa `prod`; `api/.env.example` no define `NODE_ENV`, `PORT` ni `CORS_ORIGINS`.

## m-7 · Binding y proxy

- **Dónde:** `api/src/index.ts` (`hostname: "0.0.0.0"`).
- **Acción:** hacerlo configurable (`HOST`) y documentar el uso detrás de Traefik/Dokploy (IP real vía `X-Forwarded-For`).

## m-8 · Logs con emojis y `console.*` dispersos

- **Dónde:** `index.ts`, `ConsumirInsumoUseCase`, `LocalImageStorageService`, `SendWelcomeEmail`.
- **Acción:** introducir un logger (ver `mejoras-arquitectura.md`) y reemplazar `console.*`.

## m-9 · `SendWelcomeEmail` solo hace `console.log`

- Implementar de verdad (ver `feature-plataforma.md`, verificación de email) o eliminar el suscriptor para no aparentar funcionalidad inexistente.

## m-10 · Rutas con middleware repetido

- **Dónde:** `GanadoRouter` y otros routers repiten `authMiddleware.handle` en cada ruta.
- **Acción:** usar `this.router.use(this.authMiddleware.handle)` como ya hace `UserRouter`.

## m-11 · Redirección con recarga completa

- **Dónde:** `web/src/config/api.ts` (`window.location.href = "/login"` al fallar el refresh).
- **Acción:** usar el router de TanStack (`router.navigate`) o un evento del store para evitar el reload.

## m-12 · Mensaje de seed y permisos revisables

- **Dónde:** `api/prisma/seed.ts`.
- Revisar que los recursos del seed (`terreno`, `inventario-insumos`, `sesiones-sanitarias`, `razas`, `propietario`…) coinciden exactamente con los strings que piden los routers; un error tipográfico daría 403 silencioso. Idealmente, centralizarlos en un catálogo (ver `mejoras-arquitectura.md`).

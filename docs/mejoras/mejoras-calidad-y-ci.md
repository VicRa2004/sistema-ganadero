# Mejora técnica · Calidad, pruebas y CI

## Estado actual

- ~20 archivos de test para 10 módulos. Cubren sobre todo `user`, `inventario-insumos` y un caso de `authorization`.
- Sin tests de `propietario`, `veterinario` y `raza` (histórico: ya se cubrieron `auth`, `ganado`, `terreno` y `sesion-sanitaria`; ver estado de implementación).
- Existe el script `test:e2e` (`**/*.e2e.spec.ts`) pero no hay ningún archivo e2e.
- No hay CI (`.github/` inexistente).
- No hay `typecheck` del web en el monorepo.
- `env.ts` solo valida 4 variables.

## Propuestas

1. **Tests prioritarios** (en este orden): `auth` (login, register, refresh con rotación y reuso, logout, usuario inactivo), `authorization` (permisos efectivos, deny directo), `ganado` (registrar, traslado respetando capacidad, baja, ownership), `terreno`, `sesion-sanitaria` (descuento de stock), `tratamiento-medico`.
2. **E2E con BD real** usando Postgres efímero (docker o servicio de CI) y `app.request()` de Hono, sin necesidad de `supertest`.
3. **Workflow de GitHub Actions** (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile` → `biome lint` → `typecheck:api` y `typecheck:web` → `bun test` → build de Docker.
4. **Scripts de raíz:** añadir `typecheck:web`, `typecheck` (ambos), `test:api`.
5. **Cobertura mínima** (p. ej. 70 % en `application/` y `domain/`) con `bun test --coverage`.
6. **Validación de `env` ampliada:** `CORS_ORIGINS`, `UPLOAD_MAX_SIZE`, `HOST`, `ALLOW_PUBLIC_REGISTER`, `LOG_LEVEL`; fallar al arranque con mensaje claro.
7. **Pre-commit** (lefthook/husky) con `biome` sobre archivos staged.
8. **Dependabot/Renovate** respetando versiones exactas (`-E`).

## Estado de implementación

- ✅ Implementado — **Tests unitarios ejecutables:** `bunfig.toml` (con `preload = ["reflect-metadata"]`) vive en `api/`, donde `bun test` lo lee.
- ✅ Implementado — **`pnpm lint` en verde:** Biome ignora `**/.agents` (skills de terceros).
- ✅ Implementado — **Tests prioritarios** (propuesta 1): `auth` (Login, Register, Refresh, Logout), `ganado` (registrar, trasladar, baja), `terreno` (capacidad, eliminar, registrar) y `sesion-sanitaria` (descuento de stock atómico y carrera). `tratamiento-medico` no existe como módulo en el código, así que no aplica.
- ✅ Implementado — **Traslado respetando capacidad:** `TrasladarGanadoUseCase` rechaza (400) el traslado a un terreno lleno.
- ✅ Implementado — **E2E con BD real** (propuesta 2): el job `e2e` del CI levanta Postgres 16, aplica migraciones y seed, y corre los `*.e2e.spec.ts` con `E2E_DATABASE_URL` (verificado en local con Postgres en docker: 175 tests pasan).
- ✅ Implementado — **Workflow de GitHub Actions** (propuesta 3): `.github/workflows/ci.yml` con jobs `checks` (format, lint, typecheck api y web, tests con cobertura), `e2e` y `docker` (build de la imagen).
- ✅ Implementado — **Scripts de raíz** (propuesta 4): `typecheck:web`, `typecheck`, `test:api`, `test:coverage`, `format:check`.
- ✅ Implementado — **Cobertura mínima** (propuesta 5): `bun test --coverage` con umbral en `api/bunfig.toml` (líneas 60 %, funciones 55 %; la cobertura actual es ~65 % / ~59 %). Bun no admite umbrales por carpeta, así que el 70 % en `application/` y `domain/` queda como meta: subir el umbral al crecer la cobertura.
- ✅ Implementado — **Validación de `env`** (propuesta 6): `CORS_ORIGINS`, `UPLOAD_MAX_SIZE`, `HOST` y `ALLOW_PUBLIC_REGISTER` ya estaban; se añadió `LOG_LEVEL` (usado por el logger).
- ✅ Implementado — **Pre-commit** (propuesta 7): lefthook (`lefthook.yml`) ejecuta `biome check` sobre los archivos staged; se instala con `prepare`.
- ✅ Implementado — **Dependabot** (propuesta 8): `.github/dependabot.yml` para npm y GitHub Actions, agrupando minor/patch.

## Criterio de aceptación

CI verde obligatorio en PRs; cobertura reportada; ningún merge sin typecheck de ambos paquetes.

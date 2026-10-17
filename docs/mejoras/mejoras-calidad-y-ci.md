# Mejora técnica · Calidad, pruebas y CI

## Estado actual

- ~20 archivos de test para 10 módulos. Cubren sobre todo `user`, `inventario-insumos` y un caso de `authorization`.
- Sin tests de `auth`, `ganado`, `terreno`, `sesion-sanitaria`, `tratamiento-medico`, `propietario`, `veterinario`, `raza`.
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

## Criterio de aceptación

CI verde obligatorio en PRs; cobertura reportada; ningún merge sin typecheck de ambos paquetes.

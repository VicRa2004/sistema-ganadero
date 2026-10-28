# Sistema Ganadero

Aplicación web para gestionar un rancho: ganado (con historial de pesajes, traslados y bajas), propietarios, terrenos, razas, veterinarios, sesiones sanitarias e inventario de insumos, con usuarios, roles y permisos granulares.

Monorepo con **pnpm workspaces**:

| Paquete | Descripción |
| --- | --- |
| [`api/`](api/) | Backend: Bun · Hono · Prisma (PostgreSQL) · TSyringe · Zod. Arquitectura hexagonal (`domain` / `application` / `infrastructure`). |
| [`web/`](web/) | Frontend: React · TypeScript · Vite · TanStack (Router, Query, Form) · Zustand · Tailwind v4 · shadcn/ui. |

Las reglas de desarrollo de cada paquete están en su `AGENTS.md`; el análisis de deuda técnica y mejoras, en [`docs/`](docs/).

## Requisitos

- [Bun](https://bun.sh/) 1.3+
- Node.js 22+ y [pnpm](https://pnpm.io/) 11+
- PostgreSQL

## Puesta en marcha

```bash
pnpm install
cp api/.env.example api/.env        # ajusta DATABASE_URL y JWT_SECRET
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec bun run prisma/seed.ts    # roles, permisos y datos de ejemplo
pnpm dev                                          # API y web en paralelo
```

El seed crea `admin@dev.com` (ADMIN) y `user@dev.com` (USER); las contraseñas están en `api/prisma/seed.ts` y son solo para desarrollo. Para un administrador real: `pnpm --filter api create:admin`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` / `dev:api` / `dev:web` | Desarrollo (ambos, solo API o solo web) |
| `pnpm format` | Formatea con Biome |
| `pnpm lint` | Linter (Biome) |
| `pnpm typecheck:api` | Valida tipos de la API |
| `pnpm --filter api test` | Tests de la API (`bun test`) |
| `pnpm --filter web build` | Compila el frontend |

## Variables de entorno

Plantillas: [`.env.example`](.env.example) (despliegue con Docker) y [`api/.env.example`](api/.env.example) (desarrollo). Principales:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (obligatoria) |
| `JWT_SECRET` | Secreto de los JWT, mínimo 32 caracteres (`openssl rand -base64 48`). En producción se rechazan los valores de ejemplo |
| `NODE_ENV` | `dev` \| `prod` \| `test` (`production` se acepta como alias de `prod`). En `prod` la API sirve también el frontend |
| `PORT` / `HOST` | Puerto e interfaz de escucha (por defecto `3000` / `0.0.0.0`) |
| `CORS_ORIGINS` | Orígenes permitidos separados por comas; vacío = solo mismo origen |
| `TRUST_PROXY` | `true` detrás de un proxy de confianza para leer la IP real de `X-Forwarded-For` |
| `ALLOW_PUBLIC_REGISTER` | Registro público (`false` por defecto: los usuarios los crea un admin) |
| `ENABLE_API_DOCS` | Expone Swagger en `/api-docs` (por defecto solo fuera de producción) |
| `UPLOAD_MAX_SIZE` / `BODY_MAX_SIZE` | Límites de imágenes y de cuerpos JSON, en bytes |

## Despliegue con Docker / Dokploy

`docker-compose.yml` define dos servicios sobre la misma imagen: `migrations` (aplica `prisma migrate deploy` y termina) y `app` (arranca cuando las migraciones terminan). La imagen final solo contiene la API con dependencias de producción y el build de `web`, corre como usuario `bun` y tiene `HEALTHCHECK` contra `GET /health`.

```bash
cp .env.example .env   # define DATABASE_URL y JWT_SECRET
docker compose up -d --build
```

- Los archivos subidos se guardan en el volumen `sistema_ganadero_uploads` (`/app/api/uploads`).
- Detrás de Traefik/Dokploy deja `HOST=0.0.0.0` (el proxy llega por la red del contenedor) y `TRUST_PROXY=true` para que el rate limit use la IP real del cliente. Sin proxy delante, mantén `TRUST_PROXY=false`: de lo contrario cualquiera podría falsear `X-Forwarded-For`.

## Licencia

MIT, ver [LICENSE](LICENSE).

# Reglas del Monorepo - Sistema Ganadero

Este archivo contiene las pautas básicas del diseño, arquitectura y flujos de trabajo del monorepo.

## Estructura General

El proyecto está organizado como un monorepo utilizando **pnpm workspaces**:

- [api/](file:///home/victor-raul/proyectos/sistema-ganadero/api/) — Aplicación backend escrita en Hono, Prisma, TSyringe y ejecutada bajo el runtime de **Bun**.
- [web/](file:///home/victor-raul/proyectos/sistema-ganadero/web/) — Aplicación frontend inicializada con **Vite**, React y TypeScript.

Cada subdirectorio (`api` y `web`) cuenta con su propio archivo `AGENTS.md` con reglas de desarrollo locales y su respectiva carpeta `.agents/` para skills específicas del subproyecto.

---

## Gestión de Dependencias

- **Instalador:** Se utiliza estrictamente **pnpm** para instalar dependencias a nivel raíz.
- **Versiones Exactas:** Al instalar cualquier paquete, hazlo de forma exacta usando el flag `-E` o `--save-exact`.
  - Para instalar dependencias en la raíz: `pnpm add -E -w <paquete>`
  - Para instalar dependencias en una sub-app: `pnpm --filter <app> add -E <paquete>`
- **Bloqueo de Scripts en pnpm:** pnpm v11 requiere aprobación explícita de dependencias compiladas (como `bcrypt` o `prisma`). Esto está preconfigurado en [.npmrc](file:///home/victor-raul/proyectos/sistema-ganadero/.npmrc).

---

## Ejecución y Scripts Comunes

Desde la raíz, puedes interactuar con el monorepo usando los siguientes scripts:

- **Iniciar Ambos (Simultáneo):** `pnpm dev` (ejecuta backend y frontend simultáneamente en paralelo)
- **Iniciar Backend:** `pnpm dev:api` (ejecuta el backend usando `bun` en modo hot reload)
- **Iniciar Frontend:** `pnpm dev:web` (ejecuta el servidor de desarrollo de Vite)
- **Formatear Código:** `pnpm format` (aplica el formateador Biome de manera recursiva en todo el monorepo)
- **Ejecutar Linter:** `pnpm lint` (ejecuta el análisis estático de Biome en todo el monorepo)

---

## Linter & Formatter (Biome)

El monorepo cuenta con una configuración única de Biome en la raíz ([biome.json](file:///home/victor-raul/proyectos/sistema-ganadero/biome.json)). 
Las aplicaciones individuales **no deben** tener linters propios para asegurar la consistencia del código a lo largo de todo el monorepo.
Cualquier archivo de configuración adicional de linter local en los workspaces está prohibido.

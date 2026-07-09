# Reglas del Proyecto - Sistema Ganadero Frontend

## Stack

- **Framework:** React + TypeScript (Vite)
- **Gestor de Paquetes:** `pnpm` (a nivel raíz del monorepo)
- **Linter & Formatter:** Biome (a nivel raíz del monorepo)

## Estructura de Directorios

- `src/` — Código fuente del frontend
  - `components/` — Componentes visuales y lógicos reutilizables
  - `hooks/` — Custom hooks de React
  - `services/` — Clientes de API e integraciones con backend
  - `assets/` — Recursos multimedia (imágenes, fuentes, etc.)

## Buenas Prácticas

- Mantener la separación de responsabilidades: desacoplar la lógica compleja y llamadas a API de los componentes visuales.
- Usar tipado estricto en todas las props, estados y respuestas de API.
- Todo desarrollo de componentes debe realizarse siguiendo prácticas de UI responsiva y moderna.

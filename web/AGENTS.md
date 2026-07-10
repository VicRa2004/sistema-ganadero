# Reglas del Proyecto - Sistema Ganadero Frontend

## Stack

- **Framework:** React + TypeScript (Vite)
- **Gestor de Paquetes:** `pnpm` (a nivel raíz del monorepo)
- **Linter & Formatter:** Biome (a nivel raíz del monorepo)
- **Routing:** TanStack Router (File-based)
- **State & Data:** TanStack Query, Zustand, Axios, Zod

## Estructura de Directorios

El código dentro de `src/` se divide estrictamente en:
- `routes/` — Rutas y vistas de la aplicación (definidas automáticamente por archivos).
- `components/` — Componentes visuales y de UI de propósito general.
- `config/` — Configuraciones del sistema (cliente Axios, QueryClient, etc.).
- `modules/` — Módulos de negocio (ej. `auth`, `ganado`, `rancho`). Cada uno debe contener:
  - `services/` — Clientes HTTP específicos con Axios.
  - `hooks/` — Custom hooks de TanStack Query para desacoplar llamadas API de la UI.
  - `store/` — Stores de Zustand correspondientes para el estado del módulo.
  - `types/` — Definición de interfaces y tipos del módulo (evitar duplicados).

## UI & Design (Shadcn/ui)

- **Shadcn/ui:** Se usará shadcn para componentes de UI. Seguir sus principios: usar `FieldGroup` + `Field` para formularios, `asChild` para componentes Radix/Base personalizados, y el componente `cn()` para clases condicionales.
- **Estilos Nativos:** Usar estrictamente los estilos nativos de shadcn/ui. Prohibido sobreescribir colores, fuentes o márgenes críticos por fuera de los tokens semánticos del tema.
- **Iconos:** Utilizar exclusivamente iconos de `lucide-react`. Está prohibido el uso de emojis o iconos de terceros improvisados.
- **Modo Claro & Oscuro:** La interfaz debe soportar de manera nativa los modos claro y oscuro utilizando las variables del tema y la clase `.dark`.
- **Estética Premium:** Crear diseños interactivos y modernos con transiciones suaves, gradientes sutiles y uso de imágenes reales/generadas en lugar de placeholders genéricos.
- **Tailwind CSS v4:** El diseño y variables semánticas se definen mediante Tailwind v4 en el CSS global.

## Buenas Prácticas y Calidad

- **Tipado estricto:** Prohibido el uso de `any`. Reutilizar tipos comunes de dominio y compartidos.
- **Separación de responsabilidades:** La interfaz de usuario debe ser puramente visual. Ningún componente debe realizar peticiones fetch/axios ni definir lógica compleja de Query/Mutation directa; debe delegar a los hooks del módulo.
- **Consistencia:** Mantener este archivo conciso. Seguir las convenciones de formato Biome configuradas a nivel raíz.


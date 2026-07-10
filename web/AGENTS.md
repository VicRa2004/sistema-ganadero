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

---

## Lecciones Aprendidas — Errores Críticos a Evitar

### 1. Rutas Anidadas: `dashboard.tsx` DEBE tener `<Outlet />`

Con TanStack Router file-based routing, los archivos con notación de punto (`dashboard.propietarios.tsx`) crean rutas **hijas** del layout padre (`dashboard.tsx`). Si el padre no renderiza `<Outlet />`, el contenido hijo nunca se mostrará.

**Estructura correcta obligatoria:**

```
src/routes/
├── dashboard.tsx            # Layout: solo guard de auth + <Outlet />
├── dashboard.index.tsx      # Contenido real de /dashboard (ruta exacta)
├── dashboard.modulo.tsx     # Contenido de /dashboard/modulo
└── dashboard.modulo.$id.tsx # Contenido de /dashboard/modulo/:id
```

`dashboard.tsx` siempre debe verse así:

```typescript
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/dashboard")({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
    },
    component: () => <Outlet />,
});
```

### 2. Imports en `src/components/`: Siempre usar alias `@/`

Los archivos dentro de `src/components/<modulo>/` NO pueden usar rutas relativas `../` para acceder a `src/modules/`. Siempre usar el alias `@/`:

```typescript
// ✅ Correcto:
import { useRegistrar } from "@/modules/propietario/hooks/useRegistrarPropietario";

// ❌ Incorrecto (Vite falla en runtime):
import { useRegistrar } from "../hooks/useRegistrarPropietario";
```

### 3. Respuestas paginadas del API: verificar el tipo real antes de tipar

El proyecto usa `Pagination<T>` en el backend. **Nunca asumir que un listado devuelve `T[]`**. Antes de tipar el servicio, leer el Use Case en `api/src/modules/<modulo>/application/useCases/`.

Si el Use Case retorna `Promise<Pagination<Dto>>`, el servicio debe tiparlo como:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalItems: number;
  totalPages: number;
}
```

Y el componente accede con `response.data` (array) y `response.totalPages` (control de paginación).

> **Síntoma:** `xxx.map is not a function` en runtime.

### 4. Nombres de recurso: Seed vs Middleware deben ser idénticos

El string del recurso en `api/prisma/seed.ts` debe coincidir **exactamente** con el usado en `requirePermissionMiddleware.handle("recurso", "action")` en el Router del API.

**Checklist antes de implementar cualquier módulo:**

1. Leer `<Entidad>Router.ts` → anotar el nombre exacto del recurso.
2. Buscarlo en `api/prisma/seed.ts` → confirmar que coincide.
3. Si difieren, corregir el seed y re-ejecutar: `pnpm --filter api exec bun run prisma/seed.ts`
4. Avisar al usuario: **cerrar sesión y volver a iniciar sesión** para refrescar permisos.

> **Síntoma:** El usuario tiene el permiso en BD pero el middleware lo rechaza con 403, o los botones/links no aparecen en la UI aunque el seed parezca correcto.

### 5. `beforeLoad` no puede leer `permissions` de `context.auth`

El `RouterAuthContext` solo expone `isAuthenticated`, `accessToken` y `user`. Para validar permisos en `beforeLoad`, usar `useAuthStore.getState()`:

```typescript
beforeLoad: ({ context }) => {
  if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  // ✅ Correcto:
  const permissions = useAuthStore.getState().permissions ?? [];
  if (!permissions.includes("modulo:read"))
    throw redirect({ to: "/dashboard" });
};
```

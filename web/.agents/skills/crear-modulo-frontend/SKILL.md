---
name: crear-modulo-frontend
description: Guía de desarrollo obligatoria para crear e implementar nuevos módulos de negocio en la aplicación frontend (React, TypeScript, Zustand, TanStack).
---

# Guía de Creación de Módulos Frontend

Esta skill define la estructura, patrones y convenciones técnicas obligatorias que se deben seguir al diseñar, desarrollar e implementar un nuevo módulo de negocio en la aplicación frontend.

---

## 1. Arquitectura y Estructura de Directorios

Cada módulo de negocio debe estar ubicado dentro de [web/src/modules/](file:///home/victor-raul/proyectos/sistema-ganadero/web/src/modules/) bajo su propio directorio. Está estrictamente prohibido mezclar lógica de negocio en componentes visuales o rutas globales.

La estructura interna obligatoria de un módulo `<nombre-modulo>` es:

```
src/modules/<nombre-modulo>/
├── services/
│   └── <nombre-modulo>Service.ts   # Cliente HTTP encapsulado con Axios
├── store/
│   └── <nombre-modulo>Store.ts     # Estado global del módulo con Zustand (opcional)
├── hooks/
│   ├── useGet<Entidad>.ts          # Hooks de Query (TanStack Query)
│   └── useCreate<Entidad>.ts       # Hooks de Mutation (TanStack Query)
└── types/
    └── index.ts                    # Tipado estricto e interfaces (evitar 'any')
```

---

## 2. Separación de Responsabilidades

Se debe mantener un desacoplamiento estricto entre la interfaz de usuario y la lógica de servidor/estado:
1.  **Componentes Visuales (UI/Rutas):** Solo se encargan del renderizado y de capturar eventos del usuario. Tienen estrictamente prohibido importar `axios`, disparar peticiones HTTP o manejar lógica compleja de mutación de datos de servidor.
2.  **Servicios (`services/`):** Contienen las llamadas crudas de red utilizando la instancia de Axios `api`. Retornan promesas con los datos tipados de respuesta.
3.  **Hooks (`hooks/`):** Consumen los servicios de Axios utilizando TanStack Query (`useQuery` o `useMutation`). Se encargan de manejar estados de carga (`isPending`), errores (`onError`) y de invalidar queries anteriores (`queryClient.invalidateQueries`) tras mutaciones exitosas.
4.  **Stores (`store/`):** Almacenan el estado local o de sesión persistente (como la sesión del usuario o configuraciones de filtros persistentes) mediante Zustand.

---

## 3. Manejo de Formularios (TanStack Form)

Todos los formularios interactivos de creación, edición o filtrado deben implementarse estrictamente utilizando `@tanstack/react-form`.

### Reglas Críticas al usar TanStack Form:
1.  **Prevención de recargas:** Es obligatorio llamar a `e.preventDefault()` y `e.stopPropagation()` en el evento `onSubmit` del tag `<form>` para evitar recargas accidentales de página.
2.  **Validación en Campo y Evento:** Las validaciones de inputs deben definirse en el validador `onChange` o `onBlur` del campo.
3.  **Paso de Children:** Para evitar conflictos con las reglas de estilo de Biome (`noChildrenProp`), la función renderizadora del campo se debe pasar estrictamente como un JSX hijo directo, **nunca** mediante la prop `children={...}`.
    *   *Correcto:* `<form.Field name="email">{(field) => <Input ... />}</form.Field>`
    *   *Incorrecto:* `<form.Field name="email" children={(field) => <Input ... />} />`
4.  **Manejo de Errores Visuales:** Mostrar los errores de validación únicamente si el campo ha sido modificado (`field.state.meta.isTouched`), presentándolos en color rojo contrastado (`text-red-600 dark:text-red-400`) y de forma alineada al input.

---

## 4. Control de Acceso (Roles y Permisos)

La visualización de elementos interactivos y la navegación entre páginas debe responder dinámicamente al sistema de seguridad del backend:

### 4.1 Validación de Permisos en la UI
Para ocultar, mostrar o deshabilitar elementos de la interfaz de usuario (como botones de creación, edición o tablas administrativas), lee los permisos efectivos del `useAuthStore` y realiza la validación:
```typescript
import { useAuthStore } from "@/modules/auth/store/authStore";

const permissions = useAuthStore((state) => state.permissions) || [];
const hasPermission = (resource: string, action: string) => {
    return permissions.includes(`${resource}:${action}`);
};

// Uso en JSX:
{hasPermission("ganado", "create") && (
    <Button onClick={openModal}>Registrar Ganado</Button>
)}
```

### 4.2 Protección de Rutas (TanStack Router)
Las rutas privadas deben protegerse en `beforeLoad`. **IMPORTANTE:** el `RouterAuthContext` no expone `permissions`, por lo que los permisos deben leerse del store de Zustand directamente con `getState()` (seguro fuera de React):
```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/modules/auth/store/authStore";

export const Route = createFileRoute("/dashboard/mi-modulo")({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw redirect({ to: "/login" });
        }
        // ✅ Correcto: usar getState() fuera de React
        const permissions = useAuthStore.getState().permissions ?? [];
        if (!permissions.includes("mi-recurso:read")) {
            throw redirect({ to: "/dashboard" });
        }
    },
});
// ❌ Incorrecto: context.auth.permissions no existe en RouterAuthContext
```

---

## 5. UI, Temas e Iconografía

1.  **Iconos:** Utilizar exclusivamente iconos importados del paquete `lucide-react` (ej. `Mail`, `Lock`, `Plus`, `Warehouse`). Está terminantemente prohibido usar emojis o librerías de iconos no oficiales del proyecto.
2.  **Mensajes de Error de la API:** Al capturar un fallo del servidor en `onError` de las mutations, es obligatorio usar la función utilitaria `formatApiError(error)` importada de `@/lib/utils`. Esta función desglosa de manera automática los detalles específicos del error (como fallos de validación Zod del backend) en lugar de mostrar textos genéricos.
3.  **Estilo de Mensajes:** Los banners de error de servidor deben ser altamente legibles y contrastados usando:
    *   *Modo Claro:* `text-red-700 bg-red-500/10 border-red-500/30`
    *   *Modo Oscuro:* `dark:text-red-400 dark:bg-red-500/15`
4.  **Temas:** Asegurar que todo elemento visual cuente con soporte nativo de modo claro y oscuro respetando los tokens semánticos definidos en Tailwind v4 y utilizando la clase `.dark` en elementos condicionales.

---

## 6. Planificación de Dependencias (Regla de Agente)

Antes de elaborar cualquier plan de desarrollo o proponer instalaciones:
*   **Inspeccionar package.json:** Es un requisito obligatorio leer el archivo [web/package.json](file:///home/victor-raul/proyectos/sistema-ganadero/web/package.json) para verificar si los paquetes necesarios ya están instalados.
*   **Evitar redundancia:** No propongas ni instales nuevas librerías a menos que sea estrictamente necesario y cuentes con aprobación explícita del usuario. Prioriza siempre capacidades nativas y dependencias existentes (`lucide-react`, `zustand`, `axios`, etc.).

---

## 7. Rutas Anidadas con TanStack Router (File-based)

Esta es una fuente crítica de bugs. Las rutas con notación de punto crean jerarquías de layout que DEBEN ser manejadas explícitamente.

### 7.1 Patrón Layout + Index (OBLIGATORIO)
Cuando un módulo vive bajo `/dashboard/<modulo>`, el archivo `dashboard.tsx` actúa como **layout padre** y DEBE renderizar `<Outlet />`. El contenido propio del dashboard debe estar en `dashboard.index.tsx`:

```
src/routes/
├── dashboard.tsx                    # Layout puro: solo beforeLoad + <Outlet />
├── dashboard.index.tsx              # Página principal /dashboard (ruta exacta)
├── dashboard.mi-modulo.tsx          # Página /dashboard/mi-modulo (hija del layout)
└── dashboard.mi-modulo.$id.tsx     # Página /dashboard/mi-modulo/:id
```

```typescript
// dashboard.tsx — SIEMPRE así, nunca con componente propio:
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/dashboard")({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
    },
    component: () => <Outlet />,  // ← obligatorio para que las rutas hijas funcionen
});

// dashboard.index.tsx — contenido de /dashboard exacto:
export const Route = createFileRoute("/dashboard/")({  // ← notar la barra al final
    component: DashboardIndexPage,
});
```

> **Síntoma del bug:** Al navegar a `/dashboard/mi-modulo` se muestra el contenido del dashboard principal en lugar del módulo. Causa: `dashboard.tsx` no tiene `<Outlet />`.

---

## 8. Rutas de Imports en Componentes

Los componentes en `src/components/<modulo>/` son físicamente distintos de `src/modules/<modulo>/`. **Nunca usar rutas relativas `../` desde un componente para acceder a hooks o tipos de un módulo**; siempre usar el alias `@/`:

```typescript
// ✅ Correcto — desde src/components/propietario/MiComponente.tsx:
import { useRegistrar } from "@/modules/propietario/hooks/useRegistrarPropietario";
import type { PropietarioDto } from "@/modules/propietario/types";

// ❌ Incorrecto — resuelve a src/components/hooks/ (no existe, Vite lo rechaza):
import { useRegistrar } from "../hooks/useRegistrarPropietario";
```

> **Regla práctica:** Si el archivo está en `src/components/`, todos sus imports de lógica de negocio usan `@/modules/`. Si el archivo está dentro de `src/modules/<modulo>/`, los imports internos del mismo módulo pueden ser relativos.

---

## 9. Forma Real de las Respuestas del API

**Antes de tipar el servicio**, verificar el tipo de retorno del Use Case correspondiente en el backend (`api/src/modules/<modulo>/application/useCases/`). El proyecto usa `Pagination<T>` para listados paginados:

```typescript
// Shape real devuelta por el API para listados paginados:
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    totalItems: number;
    totalPages: number;
}

// ✅ Correcto en el servicio:
async listar(page: number, limit: number): Promise<PaginatedResponse<MiDto>> {
    const { data } = await api.get<PaginatedResponse<MiDto>>("/mi-recurso", {
        params: { page, limit },
    });
    return data;
}

// ✅ Correcto en el componente/ruta:
const { data: paginado } = useListarMiEntidad(page, limit);
// Acceder al array con .data:
<MiTabla items={paginado.data} />
// Controlar paginación con .totalPages:
disabled={page >= paginado.totalPages}
```

> **Síntoma del bug:** `xxx.map is not a function` en runtime. Causa: el servicio tipaba `Promise<T[]>` pero el API devuelve `{ data: T[], ... }`.

---

## 10. Consistencia del Nombre de Recurso (Seed vs Router)

El nombre del recurso en `api/prisma/seed.ts` **debe ser idéntico** al string usado en `requirePermissionMiddleware.handle("recurso", "action")` en el Router del API. Una discrepancia hace que todos los permisos fallen silenciosamente en runtime (el middleware no encuentra el permiso aunque exista en BD).

**Checklist obligatorio al crear un módulo:**
1. Leer el `<Entidad>Router.ts` y anotar el string exacto del primer argumento de `requirePermissionMiddleware.handle(...)`.
2. Buscar ese recurso en `api/prisma/seed.ts` dentro del array `resources` y el objeto `USER`.
3. Si hay discrepancia (ej. `"propietarios"` vs `"propietario"`), corregir el seed.
4. Re-ejecutar: `pnpm --filter api exec bun run prisma/seed.ts`
5. Informar al usuario que debe **cerrar sesión y volver a iniciar sesión** para que el token de permisos se actualice.


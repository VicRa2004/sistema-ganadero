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
Las rutas privadas o de administración del sistema deben protegerse en su definición de archivo dentro de `web/src/routes/` evaluando el contexto de autenticación en `beforeLoad`:
```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin")({
    beforeLoad: ({ context }) => {
        // Redirigir a login si no está autenticado
        if (!context.auth.isAuthenticated) {
            throw redirect({ to: "/login" });
        }
        // Redirigir a inicio si no es administrador
        if (context.auth.user?.role !== "ADMIN") {
            throw redirect({ to: "/" });
        }
    },
});
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

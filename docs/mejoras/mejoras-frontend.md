# Mejora técnica · Frontend (`web/`)

Leyenda: ✅ implementado · ⏳ pendiente.

## Estructura y consistencia

- ✅ `store/` solo existe en `auth`: los demás módulos no tienen estado de cliente propio (los datos del servidor viven en TanStack Query). `web/AGENTS.md` lo refleja.
- ✅ UI de administración: `/dashboard/usuarios` (listar, crear, editar, activar/desactivar, eliminar), `/dashboard/permisos` (catálogo de solo lectura) y `/dashboard/razas` (CRUD).
- ✅ Perfil (`/dashboard/perfil`, enlazado desde la barra superior) y cambio de contraseña, respaldado por `POST /api/auth/change-password` (verifica la actual, revoca todas las sesiones).
- ⏳ Asignar permisos o roles a un usuario: la API solo expone CRUD del catálogo de permisos y la consulta de los de un usuario.

## Robustez

- ✅ `defaultErrorComponent` (aísla el fallo por ruta, con «Reintentar») y `defaultNotFoundComponent` (404) en el router.
- ✅ Carga (skeleton) y error compartidos en las listas con `ListaEstado`; el vacío lo resuelve cada tabla.
- ✅ Toasts uniformes con `sonner`: `MutationCache` muestra el error del backend y, si el hook define `meta.successMessage`, el éxito.
- ✅ Redirección a `/login` con el router (m-11).
- ✅ Formularios nuevos validados con Zod (`validators.onChange`); `modules/auth/schemas.ts` replica la política de contraseñas de la API.
- ⏳ Migrar los formularios antiguos a esquemas Zod y quitar el error inline duplicado del toast.
- ⏳ Guard de permisos en UI según `GET /permissions/users/:id` (hoy se usa la lista guardada en el store).

## UX para uso en campo

- ✅ Tablas en móvil: `Table` ya envuelve en `overflow-x-auto`, así que hacen scroll horizontal controlado.
- ✅ Tamaños táctiles: con puntero táctil (`pointer: coarse`) botones, selects e inputs miden al menos 44 px y los checkbox 22 px.
- ✅ Contraste: texto secundario y bordes más oscuros en modo claro, y un nivel extra con `prefers-contrast: more`.
- ✅ Búsqueda por arete en la barra superior (`/dashboard/ganado?identificador=`), visible con `ganado:read`.
- ✅ Subida de imagen: vista previa y compresión en cliente a JPEG de hasta 1600 px (`lib/comprimirImagen.ts`).
- ✅ Accesibilidad: enlace «Saltar al contenido», `lang="es"`, botones de icono con nombre accesible y cierre de diálogos en español. Los diálogos usan Base UI, que ya atrapa el foco y cierra con Esc.
- ⏳ Revisar con lector de pantalla y teclado los formularios antiguos (etiquetas de error sin `aria-describedby`).

## Rendimiento

- ✅ Code-splitting por ruta (`autoCodeSplitting` en el plugin de TanStack Router).
- ✅ `placeholderData: keepPreviousData` en las listas paginadas.
- ⏳ Invalidar solo las queries afectadas tras cada mutación (hoy se invalida el prefijo del recurso).

## Calidad

- ✅ Vitest + Testing Library (`pnpm test:web`, también en CI): `formatApiError`, `CampoTexto` y la política de contraseñas.
- ✅ `typecheck:web` (`tsc -b`) ya corre en CI; `oxlint` eliminado (m-2).
- ⏳ Tests de hooks y formularios clave.
- ⏳ Playwright para login, registrar ganado y consumir insumo: necesita descargar navegadores y una BD con seed en CI.

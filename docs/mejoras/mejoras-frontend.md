# Mejora técnica · Frontend (`web/`)

## Estructura y consistencia

- Los módulos `ganado`, `inventario-insumos`, `propietario`, `raza`, `sesion-sanitaria`, `terreno`, `tratamiento-medico`, `veterinario` tienen `services/hooks/types` pero solo `auth` tiene `store/`. Confirmar que no falta estado que debería estar ahí o actualizar AGENTS.md.
- Hay rutas para ganado, terrenos, propietarios, insumos, veterinarios, sesiones y tratamientos, pero **no hay UI** de administración de usuarios ni de permisos/roles aunque la API los expone.
- Rutas ausentes: razas (catálogo), perfil de usuario, cambio de contraseña.

## Robustez

- Manejo global de errores: `ErrorBoundary` por ruta, página 404 y página de error de ruta de TanStack Router.
- Estados de carga (skeletons), vacíos y de error consistentes en todas las listas.
- Toasts uniformes para éxito/error de mutaciones; mapear mensajes del backend.
- Reemplazar `window.location.href = "/login"` por navegación del router (m-11).
- Guard de permisos en UI: ocultar acciones según `GET /permissions/users/:id` (hoy solo hay guard de autenticación).
- Validar con Zod los formularios y reutilizar los esquemas.

## UX para uso en campo

- Revisar tablas en móvil (cards o scroll controlado), tamaños táctiles y contraste en exteriores (modo oscuro/claro ya soportados).
- Búsqueda por arete rápida y accesible desde la barra superior.
- Subida de imagen con compresión en cliente y vista previa.
- Accesibilidad: foco, etiquetas, navegación por teclado en diálogos.

## Rendimiento

- `React.lazy`/code-splitting por ruta (TanStack Router `autoCodeSplitting`).
- Paginación en servidor y `placeholderData` / `keepPreviousData` en listas.
- Invalidar solo las queries afectadas tras cada mutación.

## Calidad

- Tests con Vitest + Testing Library para hooks y formularios clave; Playwright para flujos críticos (login, registrar ganado, consumir insumo).
- Script `typecheck` (`tsc -b --noEmit`) y ejecutarlo en CI.
- Quitar `oxlint` (solo Biome, ver m-2).

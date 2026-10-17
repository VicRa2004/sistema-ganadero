# 🔴 Urgente / Crítico

Todo lo de este archivo debe quedar resuelto lo antes posible. Orden sugerido: U-1 → U-7.

---

## U-1 · CORS refleja cualquier origen con credenciales

> ✅ **Implementado** (commit `344d685`): lista blanca `CORS_ORIGINS`.

- **Dónde:** `api/src/core/shared/infrastructure/http/server.ts` — `cors({ origin: (origin) => origin, credentials: true })`.
- **Por qué importa:** cualquier sitio web puede hacer peticiones autenticadas (cookie `refreshToken`) en nombre del usuario. Con `SameSite=Lax` se mitiga parcialmente, pero no es una defensa suficiente.
- **Propuesta:**
  - Añadir `CORS_ORIGINS` (lista separada por comas) a `env.ts` y a `.env.example`.
  - Usar lista blanca: `origin: (o) => allowed.includes(o) ? o : null`.
  - En producción web y API comparten origen (SPA servida por la API), así que la lista puede estar vacía allí.
- **Aceptación:** una petición con `Origin` no listado no recibe `Access-Control-Allow-Origin`; test que lo verifique.

## U-2 · Subida de archivos sin validación

> ✅ **Implementado** (commit `344d685`): magic bytes JPEG/PNG/WebP, `UPLOAD_MAX_SIZE`, `bodyLimit`, cabeceras en `/uploads`, anti path traversal.

- **Dónde:** `api/src/core/shared/infrastructure/libs/LocalImageStorageService.ts`; usado desde los casos de uso de `ganado`, `propietario` y `terreno`.
- **Problema:**
  - La extensión sale de `file.name` (controlada por el cliente).
  - No hay validación de MIME, magic bytes ni tamaño.
  - Se sirve desde `/uploads/*` en el mismo origen → un `.html` / `.svg` con JS es XSS almacenado.
- **Propuesta:**
  - Lista blanca de tipos: `image/jpeg`, `image/png`, `image/webp`. Rechazar SVG.
  - Verificar magic bytes, no solo `file.type`.
  - Límite de tamaño (p. ej. 5 MB) vía env `UPLOAD_MAX_SIZE` + `bodyLimit` de Hono.
  - Derivar la extensión del tipo detectado, nunca del nombre.
  - Servir `/uploads` con `Content-Disposition`/`X-Content-Type-Options: nosniff` y, idealmente, `Content-Security-Policy: sandbox`.
  - Proteger `delete()` contra path traversal (normalizar y comprobar que queda dentro de `uploadDir`).
- **Aceptación:** subir `.html`, `.svg` o un binario renombrado a `.png` devuelve 400; archivo > límite devuelve 413.

## U-3 · Sin rate limiting en autenticación

> ✅ **Implementado** (commit `344d685`) con middleware propio en memoria. Pendiente: quitar `express-rate-limit`/`cookie-parser` (m-1).

- **Dónde:** `api/src/modules/auth/infrastructure/http/routes/AuthRouter.ts` (hay un `TODO`).
- **Problema:** `/login`, `/register` y `/refresh` permiten fuerza bruta ilimitada. `express-rate-limit` está instalado pero es de Express y no funciona con Hono.
- **Propuesta:**
  - Middleware propio (o `hono-rate-limiter`, versión exacta con `-E`) con store en memoria; tras Redis si se escala.
  - Login: 5 intentos / 15 min por IP + email. Registro: 4 / hora por IP.
  - Obtener IP real desde `X-Forwarded-For` (Dokploy/Traefik) con proxy de confianza configurable.
  - Quitar `express-rate-limit` y `cookie-parser` de `api/package.json`.
- **Aceptación:** el 6.º intento fallido devuelve 429 con `Retry-After`.

## U-4 · Falta aislamiento por usuario en Ganado y Propietario (IDOR)

> ✅ **Implementado.** Ganado hereda el dueño de su terreno; `Propietario` tiene `usuarioId` (migración `20261017150000_add_usuario_to_propietario` con backfill); sesiones sanitarias heredan el dueño del veterinario. Servicios `GanadoAccessService` y `SesionAccessService`; recursos ajenos devuelven 404. Pruebas en `api/src/e2e/aislamiento-usuarios.e2e.spec.ts` (requieren `E2E_DATABASE_URL`). No existe módulo `tratamiento-medico` en la API (solo la tabla), por lo que no hubo qué proteger.

- **Dónde:** `api/src/modules/ganado/**`, `api/src/modules/propietario/**` (y _verificar_ `sesion-sanitaria`, `tratamiento-medico`).
- **Problema:** `Terreno`, `Insumo` y `Veterinario` tienen `usuarioId` y validan `rol !== "ADMIN" && x.usuarioId !== usuarioId`. `Ganado` y `Propietario` no, así que cualquier `USER` puede listar/editar/borrar los de otro usuario. Una sesión sanitaria también puede referenciar insumos o veterinarios ajenos.
- **Propuesta:**
  - Decidir el modelo: (a) `usuarioId` directo en `Ganado`/`Propietario`, o (b) derivar la pertenencia desde `Terreno` (el ganado hereda el dueño de su terreno). Recomendado (b) para ganado y (a) para propietario.
  - Filtrar en repositorio por usuario salvo `ADMIN` (no solo en el caso de uso, para que `findAll` no filtre datos ajenos).
  - Validar que `terrenoId`, `razaId`, `propietarioId`, `insumoId`, `veterinarioId` referenciados pertenecen al usuario.
  - Extraer la política a un servicio compartido (ver `mejoras/mejoras-arquitectura.md`).
  - Migración Prisma + backfill para datos existentes.
- **Aceptación:** tests donde el usuario B recibe 404/403 al leer, editar y borrar recursos del usuario A; el listado solo devuelve los propios.

## U-5 · `isActive` nunca se comprueba

> ✅ **Implementado.** Login y refresh rechazan cuentas inactivas; un usuario inactivo no conserva permisos (`getEffectivePermissions` devuelve `[]`), así que su access token deja de servir de inmediato; desactivar o cambiar la contraseña revoca los refresh tokens. Además, login/registro/alta de usuario usan ahora `findByEmail` exacto (antes `contains`, que podía confundir `a@x.com` con `xa@x.com`).

- **Dónde:** `LoginUseCase.ts`, `RefreshTokenUseCase.ts`, `authMiddleware.ts`.
- **Problema:** `User.isActive` existe pero un usuario desactivado puede iniciar sesión y renovar tokens.
- **Propuesta:**
  - Rechazar en login y refresh (401/403) si `!user.getIsActive()`.
  - Al desactivar o eliminar un usuario, revocar todos sus refresh tokens.
  - Mismo mensaje genérico "Credenciales inválidas" para no revelar el estado.
- **Aceptación:** tests unitarios de login/refresh con usuario inactivo.

## U-6 · Registro público con rol `USER` de amplios permisos

- **Dónde:** `AuthRouter` (`POST /api/auth/register`), `api/prisma/seed.ts` (permisos de `USER`).
- **Problema:** cualquiera puede crear cuenta y obtener CRUD sobre casi todo el negocio. Combinado con U-4 expone datos de todos.
- **Propuesta (decidir con el dueño del producto):**
  - Opción A: desactivar registro público (`ALLOW_PUBLIC_REGISTER=false`) y crear usuarios solo desde admin.
  - Opción B: registro con aprobación (`isActive=false` hasta que un admin lo active).
  - Opción C: registro por invitación/token.
  - En cualquier caso, añadir verificación de correo (ver `feature-plataforma.md`).
- **Aceptación:** comportamiento acorde a la opción elegida y documentado en `README`.

## U-7 · `UpdateUserUseCase` no aplica los cambios

> ✅ **Implementado.** Aplica nombre, correo (único), contraseña (hasheada) e `isActive`. Queda fuera el cambio de `role` (requiere gestionar `UserRole`).

- **Dónde:** `api/src/core/user/application/useCases/UpdateUserUseCase.ts`.
- **Problema:** recibe `dto` pero nunca lo aplica a la entidad; llama a `update(user)` sin cambios y devuelve el usuario intacto. `PUT /api/user/:id` es un no-op.
- **Propuesta:**
  - Añadir métodos de dominio en `User` (`cambiarNombre`, `cambiarEmail`, `cambiarPassword`) sin getters/setters nativos (regla del proyecto).
  - Hashear la contraseña con `PasswordHasher` si viene en el DTO; validar unicidad de email.
  - Revocar refresh tokens al cambiar contraseña.
  - Restringir quién puede cambiar `role`/`isActive` (solo `ADMIN`).
  - Tests en `UpdateUserUseCase.spec.ts` (ahora no prueban el cambio real).
- **Aceptación:** `PUT` modifica y persiste nombre/email/contraseña; test unitario y de integración.

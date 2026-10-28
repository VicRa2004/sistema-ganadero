# 🟠 Medio

Cosas que pueden esperar un poco más que lo crítico, pero conviene atender pronto.

---

## M-1 · Reuso de refresh token no se detecta + rotación no atómica

> ✅ **Implementado.** `findByHash` (cualquier estado) detecta el reuso y revoca todas las sesiones; `rotate` revoca y crea en una transacción con `updateMany where revoked=false`, y perder la carrera cuenta como reuso. `deleteExpired` ya no borra los revocados (se necesitan para detectar reuso) y corre cada 6 h desde `index.ts`. Limitación: dos pestañas que refrescan a la vez con la misma cookie cierran la sesión.

- **Dónde:** `RefreshTokenUseCase.ts`, `PrismaRefreshTokenRepository.ts`.
- **Problema:** el comentario promete revocar todos los tokens del usuario si se reutiliza uno revocado, pero `findValidByHash` solo devuelve tokens válidos, así que el reuso nunca se detecta. Además, dos refresh simultáneos con el mismo token pueden pasar ambos.
- **Propuesta:** buscar por hash sin filtrar por estado; si está `revoked`, revocar toda la familia del usuario y devolver 401. Hacer revocar + crear dentro de una transacción con `updateMany where revoked=false` y comprobar `count === 1`. Limpiar tokens expirados con una tarea periódica.

## M-2 · `JWT_SECRET` débil y JWT sin algoritmo fijado

> ✅ **Implementado.** `JWT_SECRET` ≥ 32 caracteres (salvo `NODE_ENV=test`) y se rechazan en producción los valores de ejemplo; HS256 fijado al firmar y verificar; el middleware exige un `id` numérico en el payload. Los `.env.example` cambiaron. **Limitación documentada:** el `role` del token no se revalida durante sus 15 min (un ADMIN degradado conserva privilegios de propiedad hasta que expire); los permisos sí se leen de la BD en cada petición.

- **Dónde:** `core/config/env.ts`, `JwtService.ts`.
- **Propuesta:** exigir ≥ 32 caracteres y rechazar los valores de `.env.example` si `NODE_ENV` es prod; fijar `algorithms: ["HS256"]` en `verify` y `algorithm` en `sign`; el `role` del token no se revalida durante 15 min, así que o se lee de BD en el middleware de permisos o se documenta la limitación.

## M-3 · Detalles internos filtrados al cliente y logs ruidosos

> ✅ **Implementado.** Los 5xx responden «Error interno del servidor» + `requestId` (middleware `hono/request-id`, cabecera `X-Request-Id`) y el detalle va al log; Prisma `P2002`/`P2003` → 409 y `P2025` → 404; JSON malformado → 400; el log de token inválido solo aparece en `dev`. Para no perder mensajes útiles, los `throw new Error(...)` de validación del dominio pasaron a `ValidationError` (400).

- **Dónde:** `base.controller.ts` (`handleError`), `server.ts` (`onError`), `authMiddleware.ts`.
- **Problema:** los 500 devuelven `err.message` (puede exponer detalles de Prisma/BD); el middleware de auth hace `console.log(error)` completo en cada token inválido.
- **Propuesta:** en 5xx responder "Error interno" + `requestId` y loguear el detalle en servidor; mapear errores de Prisma (`P2002` → 409, `P2025` → 404); bajar a `debug` el log de token inválido.

## M-4 · Enumeración de usuarios en registro y login

> ✅ **Resuelto con U-6:** con el registro cerrado ya no se enumeran correos. Si se reabre, queda pendiente ocultarlo (requiere verificación de correo). Login: ahora siempre se ejecuta bcrypt (contra un hash ficticio si el correo no existe), así que el tiempo de respuesta ya no delata los correos registrados; probado con bcrypt real. **Pendiente:** el registro sigue respondiendo «el usuario ya existe». Ocultarlo exige verificación de correo (enviar un mail «ya tienes cuenta») y decidir la política de registro (U-6); ver `mejoras/feature-plataforma.md`.

- **Dónde:** `RegisterUseCase.ts`, `LoginUseCase.ts`.
- **Problema:** "el usuario ya existe" revela correos registrados; en login bcrypt solo se ejecuta si el usuario existe, lo que filtra por tiempo de respuesta.
- **Propuesta:** comparar siempre contra un hash dummy cuando el usuario no existe; en registro responder genérico y notificar por correo (ver verificación de email).

## M-5 · Sin límites de tamaño de body ni tope de paginación

> ✅ **Implementado.** JSON limitado a `BODY_MAX_SIZE` (100 KB) y multipart a `UPLOAD_MAX_SIZE` + 1 MB, con 413 también cuando no hay `Content-Length`; `limit` acotado a 100 en todos los listados mediante `paginationSchemas.ts` (valores inválidos usan el defecto, mayores se reducen al tope). El listado de ganado también quedó con tope 100: el form de ganado ya no carga 1000 animales, solo resuelve el padre/madre actuales por id y el selector ya paginaba.

- **Dónde:** `server.ts`, schemas de filtros (`*Schemas.ts`).
- **Propuesta:** `bodyLimit` global de Hono (JSON pequeño, multipart mayor solo en rutas con imagen); `limit` máximo (p. ej. 100) en todos los schemas de filtros.

## M-6 · `/api-docs` expuesto en producción

> ✅ **Implementado.** Swagger solo se registra fuera de producción; `ENABLE_API_DOCS=true|false` fuerza el comportamiento. En producción `/api-docs` responde 404.

- **Dónde:** `server.ts`.
- **Propuesta:** habilitar solo en `dev`, o protegerlo con autenticación/permiso admin.

## M-7 · Dos consultas por request para resolver permisos

> ✅ **Implementado.** `getEffectivePermissions` hace una sola consulta anidada (roles → permisos y permisos directos). **Sin caché por decisión:** un TTL retrasaría la revocación al desactivar un usuario (U-5). Corregido además el recurso del router de razas (`raza` → `razas`, como el seed).

- **Dónde:** `PrismaAuthorizationRepository.getEffectivePermissions`.
- **Problema:** hace dos `findUnique` sobre `user` en cada endpoint protegido.
- **Propuesta:** una sola consulta con `include` de roles y `directPermissions`, o cache en memoria con TTL corto (30–60 s) invalidado al modificar roles/permisos.

## M-8 · Insumos críticos filtrados en memoria

> ✅ **Implementado.** `findCriticos` filtra en la BD (`stock <= stockMinimo` comparando columnas, sin eliminados y por usuario). Se mantiene el contrato de array sin paginar porque el web lo consume así.

- **Dónde:** `PrismaInsumoRepository` (filtra `stock <= stockMinimo` en JS tras traer todo).
- **Propuesta:** consulta SQL (`$queryRaw`) con `WHERE stock <= ins_stock_minimo AND deleted_at IS NULL AND ins_fkusuario = $1`, paginada.

## M-9 · Condición de carrera al descontar stock

> ✅ **Implementado.** `descontarStock`/`adicionarStock` son `updateMany` atómicos (`stock >= cantidad`, `decrement`/`increment`); `save` ya no escribe el stock al actualizar (evita pisarlo desde `PUT /insumos/:id`). Las sesiones sanitarias descuentan y guardan en una misma transacción (`TransactionRunner` + `db()` con `AsyncLocalStorage`). Pruebas de concurrencia y rollback en `api/src/e2e/stock-y-permisos.e2e.spec.ts`.

- **Dónde:** `ConsumirInsumoUseCase`, `AbastecerInsumoUseCase`, `PrismaInsumoRepository.save`.
- **Problema:** leer → modificar → guardar permite pérdida de actualizaciones con consumos simultáneos (también desde sesiones sanitarias y tratamientos).
- **Propuesta:** `UPDATE ... SET stock = stock - $1 WHERE id = $2 AND stock >= $1` atómico (o `updateMany` con condición y comprobar `count`), dentro de la misma transacción que la sesión/tratamiento que lo consume.

## M-10 · El peso del ganado se sobrescribe sin historial

> ✅ **Implementado.** Tabla `pesaje` (migración `20261017190000_add_pesaje`, con backfill de un pesaje por animal activo). `POST /ganado/:id/pesajes` inserta (acepta `fecha` y `observaciones`) y deja `Ganado.peso` igual al pesaje más reciente en la misma transacción; un pesaje con fecha anterior al último no cambia el peso actual. `GET /ganado/:id/pesajes` devuelve el historial con ganancia diaria (GDP) entre pesajes, GDP acumulada y alerta de pérdida de peso. El peso inicial al registrar un animal es su primer pesaje, y cambiar `peso` por `PUT` también genera uno (`save` ya no escribe el peso al actualizar). Ficha del web con gráfica y tabla (`HistorialPesajesCard`). **Pendiente:** comparación con el promedio de raza/edad (ver `mejoras/feature-pesajes-y-reproduccion.md`).

- **Dónde:** `RegistrarPesajeUseCase`, `Ganado.peso`.
- **Propuesta:** crear tabla `Pesaje` (ver `mejoras/feature-pesajes-y-reproduccion.md`) y mantener `Ganado.peso` como último valor.

## M-11 · Cookie `Secure` depende de `NODE_ENV === "prod"`

> ✅ **Implementado.** `env.ts` normaliza `production` → `prod` y expone `env.isProd`, usado por el servidor y la cookie. Login, registro, refresh y logout comparten `refreshTokenCookie.ts` (mismos atributos al crear y al borrar la cookie).

- **Dónde:** `LoginController`, `RefreshTokenController`, `RegisterController`.
- **Problema:** `NODE_ENV` acepta `prod` y `production`; con `production` la cookie sale sin `Secure`.
- **Propuesta:** normalizar `NODE_ENV` en `env.ts` (un único valor) y exponer `env.isProd`; usarlo en todos los puntos. Verificar también que `Logout` limpia la cookie con los mismos atributos.

## M-12 · `authStore` del web: confirmar que no persiste el access token

> ✅ **Verificado y corregido.** Sí persistía `accessToken` en `localStorage`. Ahora solo se guardan `user` y `permissions` (con `version: 1` y `migrate`, que descarta el token de instalaciones anteriores). Al arrancar, `restoreSession` pide un token nuevo a `/auth/refresh` con la cookie HttpOnly antes de renderizar, así los guards no redirigen a `/login` a una sesión válida.

- **Dónde:** `web/src/modules/auth/store/authStore.ts` (usa `persist`, clave `auth-storage`).
- **Propuesta:** _verificar_ y, si guarda `accessToken`, usar `partialize` para persistir solo datos no sensibles (el access token debe vivir solo en memoria y recuperarse vía `/auth/refresh`).

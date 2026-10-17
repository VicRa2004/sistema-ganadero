# Feature · Plataforma (cuentas, seguridad y datos)

## 1. Multi-rancho / multi-tenant real

**Problema:** la pertenencia es por `usuarioId` suelto en cada tabla, lo que impide que varias personas trabajen sobre el mismo rancho y provoca fallos de aislamiento (U-4).

- Entidad `Organizacion` (rancho/empresa) y `Miembro(usuarioId, organizacionId, rol)`.
- Todas las tablas de negocio llevan `organizacionId`; el token/contexto incluye la organización activa.
- Roles por organización (propietario, administrador, veterinario, operario, solo lectura) mapeados a permisos.
- Invitaciones por correo con token de un solo uso.
- Cambiar de organización en la UI.
- Es un cambio grande: planificar migración y backfill (una organización por usuario existente).

## 2. Auditoría

- `AuditLog(id, usuarioId, organizacionId, entidad, entidadId, accion, antes JSON, despues JSON, ip, fecha)`.
- Registro automático en casos de uso de escritura (o extensión de Prisma).
- Pantalla de consulta con filtros (quién, qué, cuándo) accesible a administradores.

## 3. Verificación de correo y recuperación de contraseña

- Token de verificación en el registro; no permitir login sin verificar (o con funciones limitadas).
- "Olvidé mi contraseña": token de un solo uso con expiración corta; revoca refresh tokens al cambiarla.
- Proveedor de email (SMTP/Resend) detrás de una interfaz `EmailService`; sustituir `SendWelcomeEmail` por envío real.

## 4. Autenticación reforzada

- 2FA TOTP opcional (obligatorio para `ADMIN`) con códigos de recuperación.
- Gestión de sesiones activas: listar dispositivos (user-agent, IP, último uso) y cerrar sesión remota; ya se guarda el hash del refresh token, faltaría metadatos.
- Política de bloqueo temporal de cuenta tras N intentos fallidos (complementa U-3).

## 5. Papelera y restauración

- Muchas tablas ya usan `deletedAt` (soft delete). Exponer "Papelera" en la UI con restaurar y borrado definitivo (solo admin) y purga automática pasados X días.
- Registrar en auditoría las restauraciones.

## 6. Administración de usuarios y roles en la UI

- CRUD de usuarios, asignación de roles y permisos directos (allow/deny) usando los endpoints de `permissions` que ya existen.
- Gestión de roles personalizados.

## 7. Operación

- Backups programados de PostgreSQL + prueba de restauración.
- Documentar despliegue (Dokploy), variables, rotación de `JWT_SECRET` y recuperación ante desastres.
- Rate limiting por usuario/API key si se abre una API pública; versionado `/api/v1`.

## Criterios de aceptación

- Un miembro solo ve datos de las organizaciones a las que pertenece.
- Toda escritura queda en el audit log con usuario y diff.
- Un administrador puede activar/desactivar usuarios y asignar roles desde la UI sin tocar la BD.

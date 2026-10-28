# Mejora técnica · Base de datos (Prisma / PostgreSQL)

> ✅ **Implementado** (migración `20261028120000_indices_unicos_parciales_decimal_check`): índices de las tablas listadas (+ `refresh_token.expires_at`), únicos parciales `WHERE deleted_at IS NULL` en `ganado.identificador`, `veterinario.cedula` y `raza.nombre` (sin `@unique` en el schema; el seed ya no usa `upsert` sobre ellos), `CHECK` de fechas y dosis (`NOT VALID`: aplican a filas nuevas), `stock`, `stockMinimo` y dosis en `Decimal(12,3)` (los repositorios convierten con `toNumber()`), extensión de Prisma que añade `deletedAt: null` a lecturas y `updateMany`/`deleteMany` de los modelos con borrado lógico (los filtros anidados en `include` y relaciones siguen siendo manuales), paso de CI con `prisma migrate diff --exit-code` y [backups-postgres.md](../backups-postgres.md). **Pendiente:** índices parciales de rendimiento, validar sexo/ciclos en `padreId`/`madreId`, revisar `onDelete: Cascade`, tablas nuevas (kardex, auditoría) y `VALIDATE CONSTRAINT` de los `CHECK` tras revisar datos históricos.

## Índices faltantes

Columnas filtradas con frecuencia sin índice explícito:

- `ganado`: `gan_fkterreno`, `gan_fkraza`, `gan_fkpropietario`, `gan_fecha_baja`, `deleted_at`.
- `insumo`: `ins_fkusuario`, `ins_tipo`, `deleted_at`.
- `terreno`, `veterinario`: `*_fkusuario`.
- `sesion_sanitaria`: `ses_fecha`, `ses_fkveterinario`, `ses_fkinsumo`.
- `tratamiento_medico`: `trt_fkganado`, `trt_activo`, `trt_fecha_fin`.

Considerar **índices parciales** `WHERE deleted_at IS NULL` mediante SQL en la migración.

## Soft delete y unicidad

- `Ganado.identificador` es `@unique` global; un animal borrado (soft delete) bloquea reutilizar su arete. Opciones: índice único parcial `WHERE deleted_at IS NULL`, o reglas de negocio que impidan reutilizar aretes (decidir según normativa).
- Igual para `Veterinario.cedulaProfesional` y `Raza.nombre`.
- Centralizar el filtro `deletedAt: null` con una extensión de Prisma Client para no olvidarlo en consultas nuevas (hoy se repite a mano).

## Concurrencia en stock

- Operaciones atómicas `UPDATE ... SET stock = stock - x WHERE stock >= x`.
- Envolver sesión sanitaria + descuento + aplicaciones en una transacción (`prisma.$transaction`).

## Integridad

- `AplicacionSanitaria` y `TratamientoMedico` usan `onDelete: Cascade` hacia `Ganado`; con soft delete en la app conviene revisar que no haya borrados físicos accidentales.
- `Ganado.padreId`/`madreId`: validar sexo y que no se creen ciclos genealógicos (a nivel de dominio).
- `fechaFin >= fechaInicio` y `dosis > 0` como `CHECK` en la BD.
- `RefreshToken`: índice por `expiresAt` y job de limpieza.

## Auditoría y datos nuevos

- Tablas `Pesaje`, `MovimientoInsumo` (kardex de entradas/salidas), `HistorialTraslado`, `AuditLog` (ver features).
- `Insumo` con `stock` en `Float`: valorar `Decimal` para evitar errores de redondeo en dosis.

## Migraciones

- Revisar el historial reciente: hay tres commits seguidos de "corrige migración". Añadir en CI una verificación de `prisma migrate diff` (el schema coincide con las migraciones) y probar `migrate deploy` en una BD vacía.
- Backups automáticos de PostgreSQL y procedimiento de restauración documentado.

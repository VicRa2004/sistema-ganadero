# Feature · Salud animal, calendario y recordatorios

## Objetivo

Que el ganadero no olvide vacunas, tratamientos ni caducidades: el sistema avisa, no solo registra.

## Alcance

1. **Calendario sanitario** con:
   - Sesiones sanitarias programadas (futuras) además de las ya realizadas.
   - Tratamientos activos con fecha de fin (`TratamientoMedico.fechaFin`).
   - Caducidad de insumos (`Insumo.fechaCaducidad`).
2. **Planes de vacunación recurrentes** (p. ej. cada 6 meses por raza/edad) que generan sesiones futuras automáticamente.
3. **Alertas** de:
   - Insumos bajo `stockMinimo` (hoy solo un `console.warn`).
   - Insumos próximos a caducar (30/15/7 días).
   - Tratamientos por terminar o vencidos sin cerrar.
   - Animales sin vacuna vigente.
4. **Canales de notificación:** in-app (campana en la UI), email y opcionalmente push/WhatsApp. Preferencias por usuario.
5. **Período de retiro** de medicamentos: marcar animales que no pueden venderse/faenarse hasta cierta fecha.

## Diseño propuesto

- Nuevos modelos: `Notificacion(usuarioId, tipo, titulo, cuerpo, leidaAt, createdAt)`, `PlanSanitario`, campo `estado` (PROGRAMADA/REALIZADA/CANCELADA) en `SesionSanitaria`, `periodoRetiroDias` en `Insumo`.
- Tarea programada diaria (cron en proceso o worker) que evalúa reglas y crea notificaciones sin duplicarlas.
- Usar el `EventBus` para emitir `insumo.bajo-stock`, `insumo.por-caducar`, `tratamiento.por-vencer` y un suscriptor que persista/envíe.
- Endpoint `GET /api/notificaciones` (paginado, filtro no leídas) y `POST /:id/leer`.
- UI: campana con contador, página de calendario (vista mes/semana), filtros por terreno/animal.

## Dependencias

- Para email: servicio SMTP/Resend (ver `feature-plataforma.md`).
- Idealmente después de la tabla `Pesaje` no es obligatorio, pero sí tras resolver aislamiento por usuario (U-4) para que las alertas sean por dueño.

## Criterios de aceptación

- Un insumo que cruza el mínimo genera exactamente una notificación.
- El calendario muestra eventos futuros y pasados del usuario autenticado, nunca de otros.
- El usuario puede desactivar tipos de alerta.

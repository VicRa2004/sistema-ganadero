# Auditoría del proyecto — Sistema Ganadero

Resultado del análisis del 2026-10-17 sobre `api/` y `web/`. Cada documento es autocontenido para poder implementarse en una sesión independiente.

> Estado: **análisis estático**. No se ejecutaron tests ni se levantó la app. Lo marcado como _verificar_ no se confirmó leyendo el código.

## Índice

| Archivo | Contenido | Prioridad |
|---|---|---|
| [01-urgente-critico.md](01-urgente-critico.md) | Seguridad y errores que deben corregirse primero | 🔴 Ya |
| [02-medio.md](02-medio.md) | Riesgos y deudas que pueden esperar un poco | 🟠 Pronto |
| [03-menores.md](03-menores.md) | Correcciones poco urgentes | 🟡 Cuando haya tiempo |
| [mejoras/](mejoras/) | Mejoras técnicas y features nuevas | 🟢 Planificar |

### Carpeta `mejoras/`

**Mejoras técnicas**
- [mejoras-calidad-y-ci.md](mejoras/mejoras-calidad-y-ci.md) — tests, CI, lint, env
- [mejoras-arquitectura.md](mejoras/mejoras-arquitectura.md) — duplicación, permisos tipados, observabilidad, storage
- [mejoras-base-de-datos.md](mejoras/mejoras-base-de-datos.md) — índices, soft delete, concurrencia
- [mejoras-frontend.md](mejoras/mejoras-frontend.md) — UI de admin, errores, móvil

**Features**
- [feature-salud-y-recordatorios.md](mejoras/feature-salud-y-recordatorios.md) — calendario sanitario y notificaciones
- [feature-pesajes-y-reproduccion.md](mejoras/feature-pesajes-y-reproduccion.md) — historial de pesos, reproducción, genealogía
- [feature-dashboard-y-reportes.md](mejoras/feature-dashboard-y-reportes.md) — KPIs, import/export, PDF
- [feature-comercial-y-costos.md](mejoras/feature-comercial-y-costos.md) — ventas, compras, costos, alimentación
- [feature-campo-y-movilidad.md](mejoras/feature-campo-y-movilidad.md) — QR/RFID, PWA offline, mapas, potreros
- [feature-plataforma.md](mejoras/feature-plataforma.md) — multi-tenant, auditoría, 2FA, papelera

## Orden de ataque recomendado

1. CORS, validación de uploads y rate limit de auth (urgente 1–3).
2. Aislamiento por usuario en ganado/propietarios y comprobación de `isActive` (urgente 4–6).
3. `UpdateUserUseCase` y reuso de refresh token (urgente 7, medio 1).
4. CI + tests de `auth` y `ganado`.
5. Features: pesajes → recordatorios sanitarios → dashboard.

## Convención de cada ítem

`ID` · **Problema** · **Dónde** · **Por qué importa** · **Propuesta** · **Criterio de aceptación**

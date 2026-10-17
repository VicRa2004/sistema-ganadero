# Feature · Dashboard, importación/exportación y reportes

## Dashboard con KPIs

`dashboard.index.tsx` existe; ampliarlo con datos reales del backend.

- Cabezas totales, por terreno (ocupación vs `capacidadMaxima`), por raza, por sexo y rango de edad.
- Altas y bajas por mes; motivos de baja.
- Insumos críticos, por caducar y consumo reciente.
- Sesiones sanitarias y tratamientos activos.
- Peso promedio y GDP (requiere `feature-pesajes-y-reproduccion.md`).
- Costos del mes (requiere `feature-comercial-y-costos.md`).

**Diseño:** endpoint `GET /api/dashboard/resumen` con queries agregadas en SQL (`groupBy`/`$queryRaw`), una por KPI, filtradas por usuario/ADMIN. Seguir la regla de queries complejas del proyecto: interfaz en `application/queries/`, invocada vía caso de uso. Caché corto (30–60 s). Usar la skill `dataviz` para las gráficas.

## Importación

- Carga masiva de ganado desde CSV/Excel (identificador, raza, sexo, fecha nacimiento, peso, terreno, propietario).
- Flujo en dos pasos: **previsualizar** (validar filas y mostrar errores por fila) y **confirmar** (transacción todo-o-nada o con reporte parcial).
- Plantilla descargable.
- Aplicar a insumos y propietarios en una segunda fase.

## Exportación

- CSV/Excel de cualquier listado respetando los filtros activos.
- **PDF** de:
  - Ficha del animal (datos, genealogía, pesajes, historial sanitario).
  - Inventario de insumos.
  - Historial sanitario por animal o por sesión.
  - Constancia de movimiento/venta (ver feature comercial).
- Exportaciones grandes en segundo plano con descarga posterior.

## Criterios de aceptación

- El dashboard carga en < 1 s con 10 000 animales.
- Importar un CSV con errores muestra fila y motivo y no inserta datos inválidos.
- Los PDF incluyen únicamente datos del usuario autenticado.

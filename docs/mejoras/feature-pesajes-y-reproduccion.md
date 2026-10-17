# Feature · Pesajes, crecimiento y reproducción

## A. Historial de pesajes

**Problema actual:** `RegistrarPesajeUseCase` sobrescribe `Ganado.peso`; no hay historial ni curva de crecimiento.

**Propuesta**
- Modelo `Pesaje(id, ganadoId, peso, fecha, observaciones?, createdAt)` con índice `(ganadoId, fecha)`.
- `Ganado.peso` pasa a ser el último pesaje (actualizado en la misma transacción).
- Endpoints: `POST /ganado/:id/pesajes` (existente, ahora inserta), `GET /ganado/:id/pesajes`.
- Métricas: **ganancia diaria de peso (GDP)** entre pesajes y acumulada, comparación con el promedio de su raza/edad.
- UI: gráfica de línea en la ficha del animal (usar la skill `dataviz` al implementarla), tabla de pesajes y alerta si hay pérdida de peso.
- Migración con backfill: un pesaje inicial por animal con su `peso` actual.

## B. Reproducción

**Alcance**
- Eventos: monta/inseminación, diagnóstico de gestación, parto, destete, aborto.
- Modelo `EventoReproductivo(id, hembraId, machoId?, tipo, fecha, resultado?, observaciones?)` y `Parto` que pueda crear crías vinculadas con `padreId`/`madreId`.
- Cálculo de **fecha probable de parto** (≈ 283 días en bovinos) y recordatorios (ver `feature-salud-y-recordatorios.md`).
- Validaciones de dominio: la madre debe ser hembra y el padre macho; edad mínima reproductiva.
- Indicadores: intervalo entre partos, tasa de preñez, nacimientos por periodo.

## C. Genealogía

- Los campos `padreId` / `madreId` ya existen. Añadir endpoint `GET /ganado/:id/genealogia?generaciones=3` y vista de árbol.
- Evitar ciclos (un animal no puede ser su propio ancestro) y validar sexo de los padres.
- Mostrar descendencia directa en la ficha.

## Criterios de aceptación

- Registrar varios pesajes conserva todos; la gráfica refleja la serie.
- Un parto crea la cría con padres correctos y actualiza el estado reproductivo de la madre.
- El árbol genealógico muestra al menos 3 generaciones sin romperse con datos faltantes.

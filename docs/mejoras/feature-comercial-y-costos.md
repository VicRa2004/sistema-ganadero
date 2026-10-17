# Feature · Operaciones comerciales, costos y alimentación

## 1. Compras y ventas de ganado

**Hoy:** "baja" solo registra `fechaBaja` + `MotivoBaja`.

- Modelo `Transaccion(id, tipo COMPRA|VENTA, fecha, contraparte, total, moneda, documento?, observaciones)` y `TransaccionGanado(transaccionId, ganadoId, precio, pesoRegistro)`.
- Una venta da de baja automáticamente a los animales (motivo "Venta") dentro de la misma transacción.
- Una compra registra altas con procedencia.
- Bloquear la venta de animales con **período de retiro** vigente (ver feature de salud).
- Documento de movilización/guía: campo y adjunto (PDF/imagen) cumpliendo normas locales.

## 2. Costos y rentabilidad

- Registrar costos: alimento, medicina, veterinario, mano de obra, mantenimiento, otros (`Gasto(tipo, monto, fecha, terrenoId?, ganadoId?, loteId?)`).
- Costos derivados automáticos: el consumo de insumos con precio unitario (añadir `costoUnitario` a `Insumo` / entradas de stock).
- Reporte de rentabilidad por animal, terreno y periodo: ingresos por venta − costos acumulados.

## 3. Kardex de insumos

- `MovimientoInsumo(insumoId, tipo ENTRADA|SALIDA|AJUSTE, cantidad, costoUnitario?, motivo, referencia (sesión/tratamiento/alimentación), usuarioId, fecha)`.
- Hoy `abastecer`/`consumir` solo cambia `stock`; con kardex se puede auditar y calcular costos.
- Resuelve parcialmente la concurrencia de stock (M-9) al insertar movimientos y derivar stock.

## 4. Alimentación

- Raciones por grupo/terreno/lote con consumo diario esperado.
- Registro de suministro que descuenta insumos tipo `ALIMENTO` automáticamente.
- Alerta de autonomía: días de alimento restantes según consumo.

## 5. Lotes / grupos

- Entidad `Lote` para agrupar animales (engorda, destete, vientres) y operar sobre el grupo (pesaje masivo, vacunación, traslado, alimentación).

## Criterios de aceptación

- Una venta de N animales genera transacción, bajas y reporte en una sola operación atómica.
- El costo acumulado de un animal coincide con la suma de sus gastos e insumos aplicados.
- El stock de un insumo es igual a la suma de su kardex.

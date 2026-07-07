# Módulo de Lógica de Negocio: Tratamiento Médico

Este módulo es responsable del control y registro del tratamiento médico individualizado que se le administra a animales específicos que padecen alguna enfermedad o lesión.

---

## 1. Modelo de Dominio

La entidad principal `TratamientoMedico` define la receta y el estado de la intervención de salud de un animal.

### Atributos (Español)
- `id` (string): Identificador único del tratamiento (UUID).
- `ganadoId` (string): Referencia al animal enfermo.
- `diagnostico` (string): Causa o padecimiento diagnosticado (ej. "Mastitis infecciosa").
- `fechaInicio` (Date): Día en que inicia la administración del medicamento.
- `fechaFin` (Date): Día en que debe concluir el tratamiento.
- `activo` (boolean): Estatus del tratamiento.
- `insumoId` (string): Medicamento del inventario recetado.
- `dosisDiaria` (number): Cantidad diaria recomendada.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getGanadoId(): string`
- `getDiagnostico(): string`
- `getFechaInicio(): Date`
- `getFechaFin(): Date`
- `esActivo(): boolean`
- `getInsumoId(): string`
- `getDosisDiaria(): number`
- `finalizarTratamiento(): void` — Cambia el estatus `activo` a false.

---

## 2. Casos de Uso (Application)

* **`RecetarTratamientoUseCase`**
  - **Entrada:** ganadoId, diagnostico, fechaInicio, fechaFin, insumoId, dosisDiaria.
  - **Salida:** DTO del tratamiento médico programado.
  - **Flujo:** Comprueba la existencia del animal y del insumo. Valida que las fechas sean lógicas. Registra el tratamiento activo.

* **`RegistrarAplicacionDiariaUseCase`**
  - **Entrada:** tratamientoId, fechaAplicacion.
  - **Salida:** Confirmación de registro.
  - **Flujo:** Valida que el tratamiento esté activo. Descuenta del inventario de insumos la `dosisDiaria` aplicada en esa fecha específica (interactúa con `ConsumirInsumoUseCase`).

* **`FinalizarTratamientoUseCase`**
  - **Entrada:** tratamientoId.
  - **Salida:** DTO del tratamiento finalizado.
  - **Flujo:** Recupera la entidad, ejecuta `finalizarTratamiento()` y actualiza el repositorio.

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model TratamientoMedico {
  id          Int       @id @default(autoincrement()) @map("trt_id")
  ganadoId    Int       @map("trt_fkganado")
  diagnostico String    @map("trt_diagnostico") @db.VarChar(255)
  fechaInicio DateTime  @map("trt_fecha_inicio")
  fechaFin    DateTime  @map("trt_fecha_fin")
  activo      Boolean   @default(true) @map("trt_activo")
  insumoId    Int       @map("trt_fkinsumo")
  dosisDiaria Float     @map("trt_dosis_diaria")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  ganado      Ganado    @relation(fields: [ganadoId], references: [id], onDelete: Cascade)
  insumo      Insumo    @relation(fields: [insumoId], references: [id], onDelete: Restrict)

  @@map("tratamiento_medico")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (repositorio) al realizar consultas (filtrando `deletedAt: null`).


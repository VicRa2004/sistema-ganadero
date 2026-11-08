# Módulo de Lógica de Negocio: Tratamiento Médico

Este módulo es responsable del control y registro del tratamiento médico individualizado que se le administra a animales específicos que padecen alguna enfermedad o lesión.

---

## 1. Modelo de Dominio

La entidad principal `TratamientoMedico` define la receta y el estado de la intervención de salud de un animal.

### Atributos (Español)
- `id` (number): Identificador único autoincremental del tratamiento.
- `ganadoId` (number): Referencia al animal enfermo.
- `diagnostico` (string): Causa o padecimiento diagnosticado (ej. "Mastitis infecciosa").
- `fechaInicio` (Date): Día en que inicia la administración del medicamento.
- `fechaFin` (Date): Día en que debe concluir el tratamiento.
- `activo` (boolean): Estatus del tratamiento.
- `insumoId` (number): Medicamento del inventario recetado.
- `dosisDiaria` (number): Cantidad diaria recomendada.
- `veterinarioId` (number | null): Referencia opcional al médico veterinario que asignó el tratamiento.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): number`
- `getGanadoId(): number`
- `getDiagnostico(): string`
- `getFechaInicio(): Date`
- `getFechaFin(): Date`
- `esActivo(): boolean`
- `getInsumoId(): number`
- `getDosisDiaria(): number`
- `getVeterinarioId(): number | null`
- `finalizarTratamiento(): void` — Cambia el estatus `activo` a `false` (valida que no esté previamente finalizado).
- `actualizar(props): void` — Actualiza diagnóstico, periodo, insumo, dosis diaria, veterinario o estado validando invariantes del dominio.

---

## 2. Casos de Uso (Application)

* **`RecetarTratamientoUseCase`** (`POST /api/tratamientos-medicos`)
  - **Entrada:** `ganadoId`, `diagnostico`, `fechaInicio`, `fechaFin`, `insumoId`, `dosisDiaria`, `veterinarioId` (opcional).
  - **Salida:** `TratamientoMedicoDto` del tratamiento médico programado.
  - **Flujo:** Comprueba la existencia y pertenencia del animal (`GanadoAccessService`), del insumo y del veterinario opcional. Valida que las fechas y la dosis diaria sean lógicas. Registra el tratamiento activo.

* **`RegistrarAplicacionDiariaUseCase`** (`POST /api/tratamientos-medicos/aplicacion`)
  - **Entrada:** `tratamientoId`, `cantidadDosis` (opcional, por defecto `dosisDiaria` del tratamiento), `observaciones` (opcional).
  - **Salida:** `TratamientoMedicoDto` del tratamiento actualizado.
  - **Flujo:** Verifica acceso al tratamiento y que esté activo. Valida stock disponible del insumo y descuenta de forma atómica y transaccional mediante `TransactionRunner` + `InsumoRepository.descontarStock`.

* **`FinalizarTratamientoUseCase`** (`PATCH /api/tratamientos-medicos/:id/finalizar`)
  - **Entrada:** `id` del tratamiento.
  - **Salida:** `TratamientoMedicoDto` del tratamiento finalizado (`activo: false`).
  - **Flujo:** Recupera la entidad validando pertenencia, ejecuta `finalizarTratamiento()` y persiste en el repositorio.

* **`ActualizarTratamientoUseCase`** (`PUT /api/tratamientos-medicos/:id`)
  - **Entrada:** `id`, campos a actualizar (`diagnostico`, `fechaInicio`, `fechaFin`, `insumoId`, `dosisDiaria`, `veterinarioId`, `activo`).
  - **Salida:** `TratamientoMedicoDto` actualizado.
  - **Flujo:** Verifica acceso al tratamiento y pertenencia de `insumoId`/`veterinarioId` si cambian, aplica `actualizar()` en la entidad y guarda cambios.

* **`ObtenerTratamientoUseCase`** (`GET /api/tratamientos-medicos/:id`)
  - **Entrada:** `id` del tratamiento.
  - **Salida:** `TratamientoMedicoDto` enriquecido (`ganadoIdentificador`, `insumoNombre`, `insumoUnidad`, `veterinarioNombre`).

* **`ListarTratamientosUseCase`** (`GET /api/tratamientos-medicos`)
  - **Entrada:** `TratamientoMedicoFilters` (`page`, `limit`, `ganadoId?`, `activo?`, `insumoId?`, `veterinarioId?`, `search?`).
  - **Salida:** `Pagination<TratamientoMedicoDto>`.

* **`ListarTratamientosPorGanadoUseCase`** (`GET /api/tratamientos-medicos/ganado/:ganadoId`)
  - **Entrada:** `ganadoId`.
  - **Salida:** `TratamientoMedicoDto[]` para el historial clínico en la ficha del animal.

* **`EliminarTratamientoUseCase`** (`DELETE /api/tratamientos-medicos/:id`)
  - **Entrada:** `id` del tratamiento.
  - **Salida:** `void` (HTTP `204 No Content`, soft delete).

---

## 3. Persistencia (`schema.prisma`)

Modelo implementado en `api/prisma/schema.prisma`:

```prisma
model TratamientoMedico {
  id            Int       @id @default(autoincrement()) @map("trt_id")
  ganadoId      Int       @map("trt_fkganado")
  diagnostico   String    @map("trt_diagnostico") @db.VarChar(255)
  fechaInicio   DateTime  @map("trt_fecha_inicio")
  fechaFin      DateTime  @map("trt_fecha_fin")
  activo        Boolean   @default(true) @map("trt_activo")
  insumoId      Int       @map("trt_fkinsumo")
  dosisDiaria   Decimal   @map("trt_dosis_diaria") @db.Decimal(12, 3)
  veterinarioId Int?      @map("trt_fkveterinario")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime? @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  ganado      Ganado       @relation(fields: [ganadoId], references: [id], onDelete: Cascade)
  insumo      Insumo       @relation(fields: [insumoId], references: [id], onDelete: Restrict)
  veterinario Veterinario? @relation(fields: [veterinarioId], references: [id], onDelete: Restrict)

  @@map("tratamiento_medico")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (`softDeleteModels` en Prisma y repositorio) filtrando `deletedAt: null`.

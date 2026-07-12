# Módulo de Lógica de Negocio: Sesión Sanitaria

Este módulo gestiona las campañas de vacunación, desparasitación y chequeos generales masivos que se ejecutan sobre las cabezas de ganado.

---

## 1. Modelo de Dominio

Este módulo consta de dos entidades principales que organizan la sesión médica masiva.

### A. Entidad `SesionSanitaria`
Representa el evento o jornada de trabajo.

#### Atributos (Español)
- `id` (string): Identificador único de la sesión (UUID).
- `fecha` (Date): Día en que se ejecuta la jornada.
- `veterinarioId` (number): ID del médico veterinario responsable.
- `descripcion` (string): Diagnóstico o motivo de la sesión (ej: "Vacunación Anual contra Brucelosis").
- `insumoId` (string): Insumo del inventario consumido en la sesión (ej: vacunas, desparasitante).

#### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getFecha(): Date`
- `getVeterinarioId(): number`
- `getDescripcion(): string`
- `getInsumoId(): string`

---

### B. Entidad `AplicacionSanitaria`
Representa la dosis e historial sanitario atómico de un animal específico participante de la sesión.

#### Atributos (Español)
- `id` (string): Identificador único del registro (UUID).
- `sesionId` (string): ID de la sesión médica padre.
- `ganadoId` (string): Animal al que se le aplicó la dosis.
- `dosisAplicada` (number): Cantidad dosificada (ej. 2 ml, 1 dosis).
- `observaciones` (string): Notas individuales (ej: "Presentó alergia leve", "Fiebre").

#### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getSesionId(): string`
- `getGanadoId(): string`
- `getDosisAplicada(): number`
- `getObservaciones(): string`

---

## 2. Casos de Uso (Application)

* **`ProgramarSesionSanitariaUseCase`**
  - **Entrada:** Fecha, veterinarioId, descripción, insumoId, cantidadInsumoTotal.
  - **Salida:** DTO de la sesión sanitaria creada.
  - **Flujo:** Valida la existencia del insumo en inventario. Descuenta del inventario el stock total consumido en la jornada (interactúa con `ConsumirInsumoUseCase`).

* **`RegistrarResultadoAnimalUseCase`**
  - **Entrada:** sesionId, ganadoId, dosisAplicada, observaciones.
  - **Salida:** DTO del registro sanitario del animal.
  - **Flujo:** Comprueba que la sesión y el ganado existan. Registra la aplicación en el animal.

* **`ObtenerHistorialSanitarioGanadoUseCase`**
  - **Entrada:** ganadoId.
  - **Salida:** Lista de DTOs con todas las sesiones y aplicaciones recibidas por el animal a lo largo de su vida.

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model SesionSanitaria {
  id            Int       @id @default(autoincrement()) @map("ses_id")
  fecha         DateTime  @map("ses_fecha")
  veterinarioId Int       @map("ses_fkveterinario")
  descripcion   String    @map("ses_descripcion") @db.Text
  insumoId      Int       @map("ses_fkinsumo")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime? @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  insumo       Insumo                @relation(fields: [insumoId], references: [id], onDelete: Restrict)
  veterinario  Veterinario           @relation(fields: [veterinarioId], references: [id], onDelete: Restrict)
  aplicaciones AplicacionSanitaria[]

  @@map("sesion_sanitaria")
}

model AplicacionSanitaria {
  id            Int       @id @default(autoincrement()) @map("aps_id")
  sesionId      Int       @map("aps_fksesion")
  ganadoId      Int       @map("aps_fkganado")
  dosisAplicada Float     @map("aps_dosis")
  observaciones String?   @map("aps_observaciones") @db.Text
  createdAt     DateTime  @default(now()) @map("created_at")
  deletedAt     DateTime? @map("deleted_at")

  sesion SesionSanitaria @relation(fields: [sesionId], references: [id], onDelete: Cascade)
  ganado Ganado          @relation(fields: [ganadoId], references: [id], onDelete: Cascade)

  @@unique([sesionId, ganadoId])
  @@map("aplicacion_sanitaria")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (repositorio) al realizar consultas (filtrando `deletedAt: null`).


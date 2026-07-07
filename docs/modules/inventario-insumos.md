# Módulo de Lógica de Negocio: Inventario de Insumos

Este módulo gestiona el almacenamiento, abastecimiento y consumo de medicamentos, vacunas y alimento para el ganado.

---

## 1. Modelo de Dominio

La entidad principal `Insumo` define los atributos y comportamientos clave del inventario.

### Atributos (Español)
- `id` (string): Identificador único del insumo (UUID).
- `nombre` (string): Nombre del insumo (ej: "Ivermectina 1%", "Vacuna Triple").
- `tipo` (string): Categoría del insumo (`MEDICAMENTO`, `VACUNA`, `ALIMENTO`).
- `stock` (number): Cantidad física disponible.
- `stockMinimo` (number): Umbral de seguridad para alertas de reabastecimiento.
- `unidadMedida` (string): Unidad del stock (ej: `dosis`, `ml`, `kg`).
- `lote` (string): Código de lote de producción.
- `fechaCaducidad` (Date): Fecha de vencimiento del lote.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getNombre(): string`
- `getTipo(): string`
- `getStock(): number`
- `getStockMinimo(): number`
- `getUnidadMedida(): string`
- `getLote(): string`
- `getFechaCaducidad(): Date`
- `adicionarStock(cantidad: number): void` — Aumenta el stock disponible.
- `descontarStock(cantidad: number): void` — Reduce el stock (ej: consumo sanitario). Lanza error si el stock resultante es menor a cero.
- `esBajoStock(): boolean` — Retorna true si el stock actual es menor o igual al stock mínimo.

---

## 2. Casos de Uso (Application)

* **`RegistrarInsumoUseCase`**
  - **Entrada:** Nombre, tipo, stockInicial, stockMinimo, unidadMedida, lote, fechaCaducidad.
  - **Salida:** DTO del insumo creado.

* **`AbastecerInsumoUseCase`**
  - **Entrada:** id del insumo, cantidad a ingresar.
  - **Salida:** DTO con el stock actualizado.
  - **Flujo:** Recupera la entidad, llama a `adicionarStock(cantidad)` y guarda.

* **`ConsumirInsumoUseCase`**
  - **Entrada:** id del insumo, cantidad consumida.
  - **Salida:** DTO con el stock actualizado.
  - **Flujo:** Recupera la entidad, llama a `descontarStock(cantidad)` y guarda. Lanza alerta interna si el stock cae por debajo del mínimo.

* **`ObtenerInsumosCriticosUseCase`**
  - **Entrada:** Ninguna.
  - **Salida:** Lista de DTOs de insumos cuyo stock es inferior o igual a su stock mínimo.

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model Insumo {
  id             String    @id @default(uuid()) @map("ins_id")
  nombre         String    @map("ins_nombre") @db.VarChar(150)
  tipo           String    @map("ins_tipo") @db.VarChar(20) // MEDICAMENTO, VACUNA, ALIMENTO
  stock          Float     @map("ins_stock")
  stockMinimo    Float     @map("ins_stock_minimo")
  unidadMedida   String    @map("ins_unidad") @db.VarChar(20)
  lote           String    @map("ins_lote") @db.VarChar(50)
  fechaCaducidad DateTime  @map("ins_fecha_caducidad")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime? @updatedAt @map("updated_at")

  @@map("insumo")
}
```

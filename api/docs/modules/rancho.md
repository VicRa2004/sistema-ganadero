# Módulo de Lógica de Negocio: Rancho

Este módulo gestiona la información física y logística de las propiedades o ranchos donde reside el ganado.

---

## 1. Modelo de Dominio

La entidad principal `Rancho` define las capacidades de alojamiento y control territorial de la producción ganadera.

### Atributos (Español)
- `id` (string): Identificador único del rancho (UUID).
- `nombre` (string): Nombre comercial o descriptivo del rancho (ej: "Rancho San Antonio").
- `ubicacion` (string): Dirección o coordenadas de la propiedad.
- `extensionHectareas` (number): Tamaño total de la finca medido en hectáreas.
- `capacidadMaxima` (number): Número máximo de cabezas de ganado recomendadas para el espacio.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getNombre(): string`
- `getUbicacion(): string`
- `getExtensionHectareas(): number`
- `getCapacidadMaxima(): number`
- `actualizarInformacionFisica(nombre: string, ubicacion: string, extension: number, capacidad: number): void` — Permite editar los datos del rancho.

---

## 2. Casos de Uso (Application)

* **`RegistrarRanchoUseCase`**
  - **Entrada:** Nombre, ubicación, extensionHectareas, capacidadMaxima.
  - **Salida:** DTO del rancho creado.

* **`ActualizarRanchoUseCase`**
  - **Entrada:** id del rancho, nuevo nombre, nueva ubicación, nueva extension, nueva capacidad.
  - **Salida:** DTO actualizado.
  - **Flujo:** Busca el rancho, ejecuta `actualizarInformacionFisica()` y persiste los cambios.

* **`ObtenerCapacidadRanchoUseCase`**
  - **Entrada:** id del rancho.
  - **Salida:** DTO indicando capacidad máxima, cabezas de ganado alojadas actualmente y espacio disponible.
  - **Flujo:** Consulta el rancho y cuenta en el repositorio de Ganado los animales cuyo `ranchoId` sea el del rancho consultado.

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model Rancho {
  id                 Int       @id @default(autoincrement()) @map("rnch_id")
  nombre             String    @map("rnch_nombre") @db.VarChar(150)
  ubicacion          String    @map("rnch_ubicacion") @db.VarChar(255)
  extensionHectareas Float     @map("rnch_extension")
  capacidadMaxima    Int       @map("rnch_capacidad_max")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime? @updatedAt @map("updated_at")
  deletedAt          DateTime? @map("deleted_at")

  ganados            Ganado[]

  @@map("rancho")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (repositorio) al realizar consultas (filtrando `deletedAt: null`).


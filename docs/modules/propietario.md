# Módulo de Lógica de Negocio: Propietario

Este módulo gestiona la información de los dueños o propietarios legales del ganado y los ranchos integrados en el sistema.

---

## 1. Modelo de Dominio

La entidad principal `Propietario` modela a las personas o corporaciones dueñas de los activos ganaderos.

### Atributos (Español)
- `id` (EntityId): Identificador de la entidad.
- `nombre` (string): Nombre completo o razón social.
- `telefono` (string): Teléfono de contacto.
- `correo` (string): Correo electrónico del propietario.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string` (Heredado de Entity)
- `getNombre(): string`
- `getTelefono(): string`
- `getCorreo(): string`
- `actualizarDatosContacto(nuevoTelefono: string, nuevoCorreo: string): void` — Permite actualizar la información de contacto del propietario.

---

## 2. Casos de Uso (Application)

* **`RegistrarPropietarioUseCase`**
  - **Entrada:** Nombre, teléfono, correo.
  - **Salida:** DTO del propietario registrado.

* **`ActualizarDatosPropietarioUseCase`**
  - **Entrada:** id del propietario, nuevo nombre, nuevo teléfono, nuevo correo.
  - **Salida:** DTO actualizado.
  - **Flujo:** Recupera la entidad, aplica los cambios mediante sus métodos del dominio y persiste.

* **`ObtenerDetallePropietarioUseCase`**
  - **Entrada:** id del propietario.
  - **Salida:** DTO completo del propietario (puede incluir listado resumido de sus ranchos y cabezas de ganado asociadas).

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model Propietario {
  id        Int       @id @default(autoincrement()) @map("prop_id")
  nombre    String    @map("prop_nombre") @db.VarChar(255)
  telefono  String?   @map("prop_telefono") @db.VarChar(20)
  correo    String?   @map("prop_correo") @db.VarChar(128)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime? @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  ganados   Ganado[]

  @@map("propietario")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (repositorio) al realizar consultas (filtrando `deletedAt: null`).


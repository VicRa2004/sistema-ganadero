# Módulo de Lógica de Negocio: Raza

Este módulo implementa el catálogo referencial de razas para la correcta catalogación biológica del ganado.

---

## 1. Modelo de Dominio

La entidad principal `Raza` almacena los tipos genéticos y cualidades biológicas generales.

### Atributos (Español)
- `id` (string): Identificador único de la raza (UUID).
- `nombre` (string): Nombre genérico de la raza (ej: "Brahman", "Nelore", "Charolais").
- `descripcion` (string): Detalles zootécnicos u origen de la raza.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getNombre(): string`
- `getDescripcion(): string`

---

## 2. Casos de Uso (Application)

* **`RegistrarRazaUseCase`**
  - **Entrada:** Nombre, descripción.
  - **Salida:** DTO de la raza creada.
  - **Flujo:** Valida que el nombre de la raza no esté duplicado en el catálogo.

* **`ObtenerCatalogoRazasUseCase`**
  - **Entrada:** Ninguna.
  - **Salida:** Lista de DTOs con todas las razas registradas en el sistema.

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model Raza {
  id          String    @id @default(uuid()) @map("raz_id")
  nombre      String    @unique @map("raz_nombre") @db.VarChar(100)
  descripcion String?   @map("raz_descripcion") @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")

  @@map("raza")
}
```

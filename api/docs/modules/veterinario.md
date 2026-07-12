# Módulo de Lógica de Negocio: Veterinario

Este módulo gestiona la información y el catálogo de los médicos veterinarios del sistema. Permite identificar formalmente qué profesionales de la salud atienden a las cabezas de ganado en las sesiones sanitarias y los tratamientos médicos.

---

## 1. Modelo de Dominio

### Entidad `Veterinario`
Representa a un médico veterinario habilitado en la plataforma.

#### Atributos (Español)
- `id` (number): Identificador único autoincremental de la base de datos.
- `nombre` (string): Nombre completo del médico veterinario.
- `telefono` (string): Número telefónico de contacto.
- `cedulaProfesional` (string): Licencia o cédula profesional médica que lo habilita legalmente.
- `especialidad` (string | null): Especialidad médica (ej. Cirugía, Reproducción, Nutrición).

#### Métodos (Español - Sin Getters/Setters Nativos)
- `getNombre(): string`
- `getTelefono(): string`
- `getCedulaProfesional(): string`
- `getEspecialidad(): string | null`
- `actualizar(nombre: string, telefono: string, cedulaProfesional: string, especialidad: string | null): void`

---

## 2. Casos de Uso (Application)

* **`RegistrarVeterinarioUseCase`**
  - **Entrada:** nombre, telefono, cedulaProfesional, especialidad (opcional).
  - **Salida:** DTO del veterinario registrado.
  - **Flujo:** Valida que no exista otro veterinario con la misma cédula profesional registrada. Crea y persiste la entidad.

* **`ObtenerDetalleVeterinarioUseCase`**
  - **Entrada:** id (number).
  - **Salida:** DTO del veterinario.
  - **Flujo:** Recupera el veterinario por su ID. Lanza error si no existe o ha sido eliminado (soft delete).

* **`ListarVeterinariosUseCase`**
  - **Entrada:** page, limit, nombre (opcional), especialidad (opcional).
  - **Salida:** Lista paginada (`Pagination<VeterinarioOutputDto>`).
  - **Flujo:** Consulta la persistencia aplicando filtros de búsqueda parcial por nombre o especialidad.

* **`ActualizarVeterinarioUseCase`**
  - **Entrada:** id, nombre (opcional), telefono (opcional), cedulaProfesional (opcional), especialidad (opcional).
  - **Salida:** DTO del veterinario actualizado.
  - **Flujo:** Recupera el veterinario por su ID. Si la cédula profesional cambia, valida que no esté duplicada. Actualiza y persiste los cambios.

* **`EliminarVeterinarioUseCase`**
  - **Entrada:** id (number).
  - **Salida:** void.
  - **Flujo:** Valida la existencia del veterinario y realiza el borrado lógico (Soft Delete) en la base de datos.

---

## 3. Persistencia (Prisma)

Mapeo implementado en el archivo `schema.prisma`:

```prisma
model Veterinario {
  id                Int       @id @default(autoincrement()) @map("vet_id")
  nombre            String    @map("vet_nombre") @db.VarChar(255)
  telefono          String    @map("vet_telefono") @db.VarChar(20)
  cedulaProfesional String    @unique @map("vet_cedula") @db.VarChar(50)
  especialidad      String?   @map("vet_especialidad") @db.VarChar(100)
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime? @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  sesionesSanitarias  SesionSanitaria[]
  tratamientosMedicos TratamientoMedico[]

  @@map("veterinario")
}
```

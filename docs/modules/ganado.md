# Módulo de Lógica de Negocio: Ganado

Este módulo se encarga del control y la administración de todas las cabezas de ganado registradas en el sistema.

---

## 1. Modelo de Dominio

La entidad principal `Ganado` define los atributos y comportamientos clave del animal.

### Atributos (Español)
- `id` (string): Identificador único del sistema (UUID).
- `identificador` (string): Código de arete SINIGA (México). Físicamente el arete posee un número exclusivo de 8 dígitos (único a nivel nacional) y un número complementario de 4 dígitos (consecutivo local que podría llegar a repetirse entre distintos ganaderos).
- `peso` (number): Peso actual del animal en kilogramos.
- `edadEnMeses` (number): Edad calculada del animal.
- `sexo` (string): Macho o Hembra.
- `razaId` (string): Referencia a la raza del animal.
- `ranchoId` (string): Ubicación actual del animal.
- `propietarioId` (string): Dueño del animal.

### Métodos (Español - Sin Getters/Setters Nativos)
- `getId(): string`
- `getIdentificador(): string`
- `getPeso(): number`
- `getEdadEnMeses(): number`
- `getSexo(): string`
- `getRazaId(): string`
- `getRanchoId(): string`
- `getPropietarioId(): string`
- `registrarPesaje(nuevoPeso: number): void` — Valida y actualiza el peso del animal.
- `cambiarDeRancho(nuevoRanchoId: string): void` — Registra el traslado del animal.

---

## 2. Casos de Uso (Application)

Los casos de uso representan las transacciones y flujos del negocio ganadero:

* **`RegistrarGanadoUseCase`**
  - **Entrada:** Identificador, peso inicial, edad en meses, sexo, razaId, ranchoId, propietarioId.
  - **Salida:** DTO con los datos del ganado registrado.
  - **Flujo:** Valida la existencia de la raza, rancho y propietario antes de persistir el nuevo registro.

* **`RegistrarPesajeUseCase`**
  - **Entrada:** id del ganado, nuevo peso.
  - **Salida:** DTO con el peso actualizado.
  - **Flujo:** Recupera la entidad, ejecuta `registrarPesaje(nuevoPeso)` y la guarda en el repositorio.

* **`TrasladarGanadoUseCase`**
  - **Entrada:** id del ganado, id del rancho destino.
  - **Salida:** DTO con la nueva ubicación.
  - **Flujo:** Recupera la entidad, ejecuta `cambiarDeRancho(nuevoRanchoId)` y actualiza la persistencia.

* **`ObtenerFichaGanadoUseCase`**
  - **Entrada:** id o identificador (arete).
  - **Salida:** DTO completo del animal (incluye detalles de raza, rancho y propietario).

---

## 3. Persistencia (Prisma Suggestion)

Mapeo propuesto para el archivo `schema.prisma` (a implementar):

```prisma
model Ganado {
  id            Int        @id @default(autoincrement()) @map("gan_id")
  identificador String     @unique @map("gan_identificador") @db.VarChar(50)
  peso          Float      @map("gan_peso")
  edadEnMeses   Int        @map("gan_edad_meses")
  sexo          SexoGanado @map("gan_sexo")
  razaId        Int        @map("gan_fkraza")
  ranchoId      Int        @map("gan_fkrancho")
  propietarioId Int        @map("gan_fkpropietario")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime?  @updatedAt @map("updated_at")
  deletedAt     DateTime?  @map("deleted_at")

  raza                 Raza                  @relation(fields: [razaId], references: [id], onDelete: Restrict)
  rancho               Rancho                @relation(fields: [ranchoId], references: [id], onDelete: Restrict)
  propietario          Propietario           @relation(fields: [propietarioId], references: [id], onDelete: Restrict)
  aplicacionesSanitarias AplicacionSanitaria[]
  tratamientosMedicos  TratamientoMedico[]

  @@map("ganado")
}
```

> [!NOTE]
> **Nota de Diseño (Soft Delete):** La entidad de dominio no expone la propiedad `deletedAt` ya que es un detalle de persistencia. La exclusión de registros eliminados suavemente se maneja a nivel de infraestructura (repositorio) al realizar consultas (filtrando `deletedAt: null`).


---
name: crear-modulo
description: Guía detallada y obligatoria para crear un nuevo módulo en el sistema ganadero siguiendo DDD, arquitectura hexagonal, TypeScript con TSyringe y las reglas específicas del proyecto sobre idioma y métodos de acceso.
---

# Crear Módulo en el Sistema Ganadero

Esta skill define la estructura, las reglas de nomenclatura y el proceso para crear un nuevo módulo dentro de la aplicación.

> [!IMPORTANT]
> - Antes de diseñar o codificar un módulo, consulta la guía central [modulo_guia.md](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modulo_guia.md) y su respectiva especificación funcional dentro de la carpeta [docs/modules/](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/).
> - **Ubicación de Módulos:**
>   - **Módulos de Negocio Ganadero:** Deben crearse dentro del directorio `src/modules/<nombre_modulo>/`.
>   - **Módulos Genéricos o Transversales:** Todo módulo o utilidad que sea de uso general o soporte compartido por toda la aplicación (por ejemplo, el módulo de gestión de usuarios `user`) debe colocarse dentro de `src/core/` y no en `src/modules/`.

## Convenciones Críticas

### 1. Convención de Idioma Mixto
- **Lógica de negocio específica del sistema:** Usar **Español**. Esto incluye nombres de clases del dominio, atributos y métodos de la lógica interna de negocio.
  - *Ejemplos:* Entidad `Ganado`, método `obtenerPeso()`, método `getEdad()`, atributos `peso`, `identificador`.
- **Conceptos estándar, patrones y utilidades técnicas:** Usar **Inglés**. Esto aplica a patrones de diseño, conceptos genéricos de arquitectura (DDD) e infraestructura de software.
  - *Ejemplos:* `EventBus`, `PasswordHasher`, `UserRepository` (interfaz), `CreateUserUseCase`, `CreateUserController`, `UserRouter`, `PrismaUserRepository` (infraestructura).

### 2. Prohibición de Getters/Setters Nativos
- **Prohibido** el uso de las palabras clave `get` y `set` nativas de TypeScript en las entidades u otros objetos (ej: `get peso()` o `set peso(...)`).
- **Obligatorio** usar métodos regulares para el acceso y modificación de datos: `getPropiedad()`, `setPropiedad()`.
  - *Correcto:* `getNombre()`, `getEdad()`, `setEdad(edad: number)`
  - *Incorrecto:* `get nombre()`, `get edad()`, `set edad(edad: number)`

### 3. Arquitectura Hexagonal y DDD
- **Domain:** Totalmente desacoplado de frameworks e infraestructura (sin Prisma, sin Hono, sin Zod). Contiene entidades, interfaces de repositorios, interfaces de servicios y errores específicos de dominio.
- **Application:** Contiene los casos de uso (`run`), DTOs y mappers. Se inyectan interfaces del dominio mediante `@inject("Token")` de TSyringe. Está prohibido devolver entidades de dominio hacia HTTP; siempre transformar a DTO usando Mappers.
- **Infrastructure:** Implementa las interfaces de repositorio (Prisma) y de servicios, y contiene el transporte HTTP (controladores, rutas, middlewares y esquemas Zod).

### 4. Alineación de Identificadores (Core)
- Para mantener la compatibilidad con el Core (`Entity`, `EntityId`), los nuevos módulos de negocio deben utilizar identificadores de tipo **`Int` autoincrementales** en la persistencia y base de datos (evitando el uso de UUIDs como claves primarias).

### 5. Eliminación Suave (Soft Delete)
- **Desacoplamiento:** El dominio **no debe** tener conocimiento del atributo `deletedAt` (no se expone en la entidad). Es un detalle puramente de persistencia.
- **Filtrado en Repositorios:** La exclusión de registros eliminados se gestiona a nivel de repositorio (Infraestructura). En cualquier consulta (`findUnique`, `findFirst`, `findMany`), se debe aplicar el filtro `deletedAt: null`.
- **Borrado Lógico:** El método para eliminar un registro en el repositorio no realiza un delete físico en la base de datos, sino que realiza una actualización seteando `deletedAt = new Date()`.


---

## Estructura de Directorios

Cada módulo nuevo debe ubicarse en `src/modules/<nombre>/` y seguir esta estructura:

```text
src/modules/<nombre>/
├── domain/
│   ├── error/             ← Errores del dominio que heredan de BaseError
│   ├── repository/        ← Interfaces de repositorio e interfaces de filtros (ej. GanadoFilters.ts)
│   ├── service/           ← Interfaces de servicios externos (Inglés, ej. ValidadorIdentificador.ts)
│   └── <Entidad>.ts       ← Clase de entidad (Español, ej. Ganado.ts)
├── application/
│   ├── dtos/              ← DTOs para Casos de Uso y/o Queries (ej. GanadoOcupacionDto.ts)
│   ├── mappers/           ← Transformadores Entidad -> DTO decorados con @injectable()
│   ├── queries/           ← Interfaces de consultas complejas de lectura (ej. GanadoOcupacionQuery.ts)
│   └── useCases/          ← Casos de uso con método principal 'run'
└── infrastructure/
    ├── repository/        ← Implementación de repositorios usando Prisma (ej. PrismaGanadoRepository.ts)
    ├── queries/           ← Implementación de consultas complejas usando Prisma (ej. PrismaGanadoOcupacionQuery.ts)
    ├── service/           ← Implementaciones de servicios reales
    └── http/
        ├── controllers/   ← Un controlador por caso de uso/query, heredan de BaseController
        ├── middlewares/
        ├── routes/        ← Clases router inyectables, definen endpoints
        └── schemas/       ← Validaciones de entrada de Zod
```

---

## Proceso de Creación Paso a Paso (Inside-Out)

### Paso 1: Definir el Dominio

1. **Entidad (`domain/Ganado.ts`):**
   Usa un constructor privado, un método estático `create`/`reconstitute` para instanciar, y métodos normales para obtener y modificar valores.

   ```typescript
   export class Ganado {
     private constructor(
       private readonly id: string,
       private identificador: string,
       private peso: number,
       private edadEnMeses: number
     ) {}

     public static create(id: string, identificador: string, peso: number, edadEnMeses: number): Ganado {
       return new Ganado(id, identificador, peso, edadEnMeses);
     }

     public getId(): string {
       return this.id;
     }

     public getIdentificador(): string {
       return this.identificador;
     }

     public getPeso(): number {
       return this.peso;
     }

     public getEdadEnMeses(): number {
       return this.edadEnMeses;
     }

     public registrarPesaje(nuevoPeso: number): void {
       if (nuevoPeso <= 0) {
         throw new Error("El peso debe ser mayor a 0");
       }
       this.peso = nuevoPeso;
     }
   }
   ```

2. **Interfaz de Repositorio (`domain/repository/GanadoRepository.ts`):**
   ```typescript
   import type { Ganado } from "../Ganado";

   export interface GanadoRepository {
     findById(id: string): Promise<Ganado | null>;
     save(ganado: Ganado): Promise<void>;
   }
   ```

3. **Errores del Dominio (`domain/error/GanadoNotFoundError.ts`):**
   ```typescript
   import { BaseError } from "@/core/shared/domain/error/BaseError";

   export class GanadoNotFoundError extends BaseError {
     constructor(id: string) {
       super(`Ganado con ID ${id} no fue encontrado`, 404);
     }
   }
   ```

### Paso 2: Definir la Aplicación

1. **DTOs (`application/dtos/RegistrarGanadoDto.ts`):**
   ```typescript
   export interface RegistrarGanadoInputDto {
     identificador: string;
     peso: number;
     edadEnMeses: number;
   }

   export interface GanadoOutputDto {
     id: string;
     identificador: string;
     peso: number;
     edadEnMeses: number;
   }
   ```

2. **Mappers (`application/mappers/GanadoMapper.ts`):**
   ```typescript
   import { injectable } from "tsyringe";
   import type { Ganado } from "../../domain/Ganado";
   import type { GanadoOutputDto } from "../dtos/RegistrarGanadoDto";

   @injectable()
   export class GanadoMapper {
     public toDto(ganado: Ganado): GanadoOutputDto {
       return {
         id: ganado.getId(),
         identificador: ganado.getIdentificador(),
         peso: ganado.getPeso(),
         edadEnMeses: ganado.getEdadEnMeses()
       };
     }
   }
   ```

3. **Caso de Uso (`application/useCases/RegistrarGanadoUseCase.ts`):**
   El caso de uso debe usar inyección de dependencias, el decorador `@injectable()` y el método `run()`.

   ```typescript
   import { inject, injectable } from "tsyringe";
   import { Ganado } from "../../domain/Ganado";
   import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
   import type { RegistrarGanadoInputDto, GanadoOutputDto } from "../dtos/RegistrarGanadoDto";
   import { GanadoMapper } from "../mappers/GanadoMapper";

   @injectable()
   export class RegistrarGanadoUseCase {
     constructor(
       @inject("GanadoRepository") private readonly ganadoRepository: GanadoRepository,
       private readonly mapper: GanadoMapper
     ) {}

     public async run(dto: RegistrarGanadoInputDto): Promise<GanadoOutputDto> {
       const id = crypto.randomUUID(); // Generación nativa
       const ganado = Ganado.create(id, dto.identificador, dto.peso, dto.edadEnMeses);
       
       await this.ganadoRepository.save(ganado);
       return this.mapper.toDto(ganado);
     }
   }
   ```

### Paso 3: Definir la Infraestructura

1. **Repositorio Prisma (`infrastructure/repository/PrismaGanadoRepository.ts`):**
   Implementa la interfaz del dominio.

   ```typescript
   import { injectable } from "tsyringe";
   import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
   import { Ganado } from "../../domain/Ganado";
   import { PrismaClient } from "@prisma/client"; // Asumiendo cliente global configurado

    @injectable()
    export class PrismaGanadoRepository implements GanadoRepository {
      constructor(private readonly prisma: PrismaClient) {}

      public async findById(id: number): Promise<Ganado | null> {
        // Importante: Filtrar por deletedAt: null para ignorar eliminados suaves
        const record = await this.prisma.ganado.findFirst({
          where: { id, deletedAt: null }
        });
        if (!record) return null;
        return Ganado.create(record.id, record.identificador, record.peso, record.edadEnMeses);
      }

      public async save(ganado: Ganado): Promise<void> {
        await this.prisma.ganado.upsert({
          where: { id: ganado.getId() },
          update: {
            identificador: ganado.getIdentificador(),
            peso: ganado.getPeso(),
            edadEnMeses: ganado.getEdadEnMeses()
          },
          create: {
            id: ganado.getId(),
            identificador: ganado.getIdentificador(),
            peso: ganado.getPeso(),
            edadEnMeses: ganado.getEdadEnMeses()
          }
        });
      }

      // Ejemplo de eliminación suave en infraestructura
      public async delete(id: number): Promise<void> {
        await this.prisma.ganado.update({
          where: { id },
          data: { deletedAt: new Date() }
        });
      }
    }
   ```

2. **Controlador HTTP (`infrastructure/http/controllers/RegistrarGanadoController.ts`):**
   Hereda de `BaseController` y usa `this.executeSafely()`.

   ```typescript
   import { injectable } from "tsyringe";
   import type { Context } from "hono";
   import { BaseController } from "@/core/shared/infrastructure/http/BaseController";
   import { RegistrarGanadoUseCase } from "../../../application/useCases/RegistrarGanadoUseCase";

   @injectable()
   export class RegistrarGanadoController extends BaseController {
     constructor(private readonly registrarGanadoUseCase: RegistrarGanadoUseCase) {
       super();
     }

     public run = async (c: Context): Promise<Response> => {
       return this.executeSafely(c, async () => {
         const body = await c.req.json();
         // Validaciones correspondientes (ej: Zod parse)
         const result = await this.registrarGanadoUseCase.run(body);
         return this.created(c, result);
       });
     };
   }
   ```

3. **Rutas HTTP (`infrastructure/http/routes/GanadoRouter.ts`):**
   Clase decorada con `@injectable()`, inyecta controladores por constructor y asigna los endpoints usando `.bind()`.

   ```typescript
   import { injectable } from "tsyringe";
   import { Hono } from "hono";
   import { RegistrarGanadoController } from "../controllers/RegistrarGanadoController";

   @injectable()
   export class GanadoRouter {
     public readonly router: Hono;

     constructor(
       private readonly registrarController: RegistrarGanadoController
     ) {
       this.router = new Hono();
       this.router.post("/", this.registrarController.run.bind(this.registrarController));
     }
   }
   ```

### Paso 4: Registrar en el Contenedor de Inyección de Dependencias

Registrar la asociación de tu repositorio y servicios en `src/core/shared/infrastructure/di/container.ts`:

```typescript
import { PrismaGanadoRepository } from "@/modules/ganado/infrastructure/repository/PrismaGanadoRepository";

container.register("GanadoRepository", { useClass: PrismaGanadoRepository });
```

---

## Directrices Avanzadas: Filtros, Queries Complejas y Paginación

### 1. Filtros en el Dominio (`domain/repository/GanadoFilters.ts`)
Cuando necesites filtros en consultas, encapsúlalos en una interfaz dedicada dentro del dominio y añade las propiedades de paginación obligatorias:

```typescript
export interface GanadoFilters {
  page: number;
  limit: number;
  // Filtros de negocio opcionales
  identificador?: string;
  ranchoId?: string;
}
```

### 2. Paginación Estándar (`Pagination<T>`)
Toda colección paginada debe retornar la estructura común de [Pagination.ts](file:///home/victor-raul/proyectos/sistema-ganadero/src/core/shared/domain/Pagination.ts):

```typescript
import type { Pagination } from "@/core/shared/domain/Pagination";

// Retorno en Repositorios o Casos de Uso
async find(filters: GanadoFilters): Promise<Pagination<Ganado>>;
```

### 3. Consultas Complejas (Queries en Application)
Para vistas que no se correspondan con una sola entidad o requieran joins complejos (por ejemplo, reporte de ocupación física de ranchos):

1. **Definir DTO de salida (`application/dtos/GanadoOcupacionDto.ts`):**
   ```typescript
   export interface RanchoOcupacionDto {
     ranchoId: string;
     nombreRancho: string;
     cabezasRegistradas: number;
     capacidadMaxima: number;
     porcentajeOcupacion: number;
   }
   ```

2. **Crear interfaz de Query (`application/queries/RanchoOcupacionQuery.ts`):**
   ```typescript
   import type { Pagination } from "@/core/shared/domain/Pagination";
   import type { RanchoOcupacionDto } from "../dtos/GanadoOcupacionDto";

   export interface RanchoOcupacionQueryFilters {
     page: number;
     limit: number;
     nombreRancho?: string;
   }

   export interface RanchoOcupacionQuery {
     obtenerOcupacion(filters: RanchoOcupacionQueryFilters): Promise<Pagination<RanchoOcupacionDto>>;
   }
   ```

3. **Crear el Caso de Uso que la consume (`application/useCases/ObtenerOcupacionRanchosUseCase.ts`):**
   *Los controladores nunca llaman a la query de forma directa; siempre inyectan el caso de uso.*
   ```typescript
   import { inject, injectable } from "tsyringe";
   import type { Pagination } from "@/core/shared/domain/Pagination";
   import type { RanchoOcupacionQuery, RanchoOcupacionQueryFilters } from "../queries/RanchoOcupacionQuery";
   import type { RanchoOcupacionDto } from "../dtos/GanadoOcupacionDto";

   @injectable()
   export class ObtenerOcupacionRanchosUseCase {
     constructor(
       @inject("RanchoOcupacionQuery") private readonly query: RanchoOcupacionQuery
     ) {}

     public async run(filters: RanchoOcupacionQueryFilters): Promise<Pagination<RanchoOcupacionDto>> {
       return this.query.obtenerOcupacion(filters);
     }
   }
   ```

4. **Implementar en Infraestructura (`infrastructure/queries/PrismaRanchoOcupacionQuery.ts`):**
   ```typescript
   import { injectable } from "tsyringe";
   import { PrismaClient } from "@prisma/client";
   import type { Pagination } from "@/core/shared/domain/Pagination";
   import type { RanchoOcupacionQuery, RanchoOcupacionQueryFilters } from "../../application/queries/RanchoOcupacionQuery";
   import type { RanchoOcupacionDto } from "../../application/dtos/GanadoOcupacionDto";

   @injectable()
   export class PrismaRanchoOcupacionQuery implements RanchoOcupacionQuery {
     constructor(private readonly prisma: PrismaClient) {}

     public async obtenerOcupacion(filters: RanchoOcupacionQueryFilters): Promise<Pagination<RanchoOcupacionDto>> {
       const skip = (filters.page - 1) * filters.limit;
       
       // Lógica de consulta (ej. prisma.$queryRaw o joins optimizados)
       // ...

       return {
         data: [], // Datos mapeados
         page: filters.page,
         totalItems: 0,
         totalPages: 0
       };
     }
   }
   ```

5. **Registrar la Query en el Contenedor de Inyección:**
   ```typescript
   import { PrismaRanchoOcupacionQuery } from "@/modules/ganado/infrastructure/queries/PrismaRanchoOcupacionQuery";

   container.register("RanchoOcupacionQuery", { useClass: PrismaRanchoOcupacionQuery });
   ```


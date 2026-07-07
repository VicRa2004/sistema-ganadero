---
name: crear-modulo
description: Guía detallada y obligatoria para crear un nuevo módulo en el sistema ganadero siguiendo DDD, arquitectura hexagonal, TypeScript con TSyringe y las reglas específicas del proyecto sobre idioma y métodos de acceso.
---

# Crear Módulo en el Sistema Ganadero

Esta skill define la estructura, las reglas de nomenclatura y el proceso para crear un nuevo módulo de negocio dentro del directorio `src/modules/`.

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

---

## Estructura de Directorios

Cada módulo nuevo debe ubicarse en `src/modules/<nombre>/` y seguir esta estructura:

```text
src/modules/<nombre>/
├── domain/
│   ├── error/             ← Errores del dominio que heredan de BaseError
│   ├── repository/        ← Interfaces de repositorio (Inglés, ej. GanadoRepository.ts)
│   ├── service/           ← Interfaces de servicios externos (Inglés, ej. ValidadorIdentificador.ts)
│   └── <Entidad>.ts       ← Clase de entidad (Español, ej. Ganado.ts)
├── application/
│   ├── dtos/              ← Tipos o interfaces DTO (Inglés, ej. RegistrarGanadoDto.ts)
│   ├── mappers/           ← Transformadores Entidad -> DTO decorados con @injectable()
│   └── useCases/          ← Casos de uso con método principal 'run'
└── infrastructure/
    ├── repository/        ← Implementación real usando Prisma (ej. PrismaGanadoRepository.ts)
    ├── service/           ← Implementaciones de servicios reales
    └── http/
        ├── controllers/   ← Un controlador por caso de uso, heredan de BaseController
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

     public async findById(id: string): Promise<Ganado | null> {
       const record = await this.prisma.ganado.findUnique({ where: { id } });
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

Registrar la asociación en `src/core/shared/infrastructure/di/container.ts`:

```typescript
import { PrismaGanadoRepository } from "@/modules/ganado/infrastructure/repository/PrismaGanadoRepository";

container.register("GanadoRepository", { useClass: PrismaGanadoRepository });
```

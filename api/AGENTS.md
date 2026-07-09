# Reglas del Proyecto - Sistemas Ganadero

## Stack

- **Runtime:** Bun. Instalar paquetes con versión exacta: `bun add -E <paquete>`
- **Framework:** Hono
- **DB:** Solo Prisma con PostgreSQL
- **Idioma de respuesta:** Español

## Dependencias

Antes de instalar cualquier paquete, revisar `package.json` para confirmar si ya existe.

## Arquitectura

- `src/` — todo el código
- `src/core/` — base general, soporte compartido y módulos transversales/genéricos (ej. `user`).
- `src/modules/<nombre>/{domain,application,infrastructure}` — lógica de negocio específica del dominio ganadero. Prohibido colocar aquí lógica genérica de la aplicación.
- `/docs` — documentación funcional y guías. Destaca [modulo_guia.md](file:///home/victor-raul/proyectos/sistema-ganadero/api/docs/modulo_guia.md) como índice central y los archivos en [docs/modules/](file:///home/victor-raul/proyectos/sistema-ganadero/api/docs/modules/) para especificaciones por módulo.


## Capas

### Domain

- Interfaces, errores (extendiendo `BaseError`) y modelos. Sin dependencias de frameworks.
- **Filtros:** Si se requieren filtros de búsqueda, definirlos en una interfaz dentro de un archivo `<Entidad>Filters.ts` en el dominio, incluyendo siempre `page: number` y `limit: number`.

### Application

- Método principal de Use Cases: `run` (nunca `execute`).
- Prohibido devolver entidades de dominio hacia HTTP. Usar Mappers y DTOs.
- **Queries Complejas:** Para lecturas complejas o combinación de agregados, ubicar interfaces en `application/queries/`. Deben ser llamadas por controladores a través de un Caso de Uso (nunca directamente). Respuestas paginadas deben usar `Pagination<T>`.

### Infrastructure — HTTP

Todo en `infrastructure/http/`: Rutas, Controladores, Middlewares, Schemas.

**Controladores** — uno por caso de uso en `http/controllers/`:

- Heredan de `BaseController`, usan `this.executeSafely()`
- Método: `run(req, res)`

**Rutas** — clases en `http/routes/` decoradas con `@injectable()`:

- Inyectar controladores por constructor
- `this.router = Router()` interno
- Bind de métodos: `this.router.get("/", this.ctrl.run.bind(this.ctrl))`
- Prohibido usar `container.resolve()` en la declaración de rutas

## Inyección de dependencias (TSyringe)

- `@injectable()` obligatorio en: Casos de Uso, Controladores, Repos, Mappers.
- Prohibido instanciar con `new`.
- **Uso Obligatorio de String Tokens con `@inject`:** Debido a que el linter de Biome fuerza a usar `import type` para las clases que solo se usen en posiciones de tipo del constructor, el compilador descarta sus referencias en runtime y TSyringe no puede inyectarlas de forma automática por tipo de clase (arrojaría el error `TypeInfo not known for "Object"`).
- **Regla de Inyección:** Se debe inyectar **SIEMPRE** mediante tokens de texto con `@inject("TokenString")` tanto en Routers, Controladores como en Casos de Uso.
  - *Ejemplo:* `constructor(@inject("CreateUserUseCase") private readonly createUserUseCase: CreateUserUseCase) {}`
- **Registro Centralizado:** Todas las clases de Casos de Uso, Controladores, Mappers y Repositorios deben registrarse explícitamente en el contenedor central `src/core/shared/infrastructure/di/container.ts` asociándolos a su token string correspondiente.
  - *Ejemplo:* `container.register("CreateUserUseCase", { useClass: CreateUserUseCase });`

## Convenciones de Código y Nomenclatura

- **Getters/Setters:** Prohibido el uso de getters y setters nativos de TypeScript (`get ` y `set ` en métodos). En su lugar, usar métodos normales (ej: `getNombre()`, `setNombre()`).
- **Idioma Mixto:**
  - Usar **Español** para la lógica interna y del dominio (ej: entidad `Ganado`, `getEdad()`, atributo `peso`).
  - Usar **Inglés** para conceptos de diseño estandarizados, patrones arquitectónicos (DDD) e infraestructura (ej: `EventBus`, `UserRepository`, `CreateUserUseCase`).

## Skills de Asistencia Local

- Para crear un nuevo módulo, apóyate en la skill local `crear-modulo` (`api/.agents/skills/crear-modulo/SKILL.md`), la cual te guiará usando [modulo_guia.md](file:///home/victor-raul/proyectos/sistema-ganadero/api/docs/modulo_guia.md) y sus respectivas fichas técnicas en [docs/modules/](file:///home/victor-raul/proyectos/sistema-ganadero/api/docs/modules/).
- Para auditar y evaluar un módulo, apóyate en la skill local `evaluar-modulo` (`api/.agents/skills/evaluar-modulo/SKILL.md`).


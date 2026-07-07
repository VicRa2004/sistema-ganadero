---
name: evaluar-modulo
description: Guía de auditoría y evaluación técnica para verificar que un módulo nuevo o modificado cumpla rigurosamente con DDD, arquitectura hexagonal, inyección de dependencias y las convenciones del proyecto.
---

# Evaluar Módulo en el Sistema Ganadero

Esta skill define el checklist y protocolo que se debe seguir para auditar, evaluar y probar un módulo dentro del proyecto. Debe ejecutarse cada vez que se finalice la creación o modificación de un módulo.

---

## checklist de Auditoría

### 1. Independencia y DDD (Hexagonal)
- [ ] **Aislamiento de Domain:** Abre todos los archivos dentro de `domain/` y asegúrate de que no importan nada relacionado con `infrastructure/` o dependencias externas (ej. `@prisma/client`, `hono`, `zod`, `jsonwebtoken`, `bcrypt`). Sólo deben importar otros elementos del dominio u objetos compartidos en `core/shared/domain/`.
- [ ] **Aislamiento de Application:** Verifica que los archivos en `application/` interactúen con el dominio o dependencias externas sólo a través de interfaces inyectadas. No deben depender de bases de datos o detalles de transporte HTTP.
- [ ] **Mappers y DTOs:** Comprueba que ningún caso de uso retorne una entidad de dominio directamente al exterior. Deben transformarse a DTOs mediante Mappers antes de salir de la capa de aplicación.
- [ ] **Filtros en el Dominio:** Verificar que los filtros se ubiquen en un archivo `<Entidad>Filters.ts` en el dominio y posean obligatoriamente los parámetros `page: number` y `limit: number`.
- [ ] **Queries Complejas:** Comprobar que las consultas complejas de lectura estén en `application/queries/` y que los controladores las consuman estrictamente a través de un Caso de Uso (nunca de forma directa).

### 2. Estilo de Código y TypeScript
- [ ] **Sin Getters/Setters Nativos:** Verifica que no existan las palabras clave `get ` y `set ` precediendo métodos en clases de entidades.
  - *Correcto:* `public getEdad(): number`
  - *Incorrecto:* `public get edad(): number`
- [ ] **Regla de Idioma Mixto:**
  - *Español:* Nombres de entidades del dominio, propiedades y métodos que representen lógica de negocio interna (ej: `Ganado`, `peso`, `categoria`, `obtenerPeso()`, `getEdad()`).
  - *Inglés:* Nombres de interfaces de repositorios/servicios, casos de uso, controladores, routers y utilidades técnicas (ej: `UserRepository`, `CreateUserUseCase`, `PasswordHasher`, `CreateUserController`).
- [ ] **Paginación Estándar:** Comprobar que todas las respuestas de listas paginadas utilicen la estructura genérica `Pagination<T>`.

### 3. Inyección de Dependencias (TSyringe)
- [ ] **Decorador `@injectable()`:** Obligatorio en Casos de Uso, Controladores, Mappers y la implementación de Repositorios.
- [ ] **Uso de `@inject`:** Las interfaces del dominio deben inyectarse mediante `@inject("TokenName")` en los constructores.
- [ ] **Sin Instanciación Manual (`new`):** Prohibido instanciar clases inyectables con `new` dentro de la lógica del sistema (excepto en tests unitarios para mockear el entorno).
- [ ] **Registro en Contenedor:** Comprobar que las interfaces implementadas estén mapeadas a su clase concreta en `src/core/shared/infrastructure/di/container.ts`.

### 4. Cumplimiento Funcional y Documentación
- [ ] **Ficha Técnica de Módulo:** Compara la lógica implementada contra la ficha de diseño respectiva en [docs/modules/](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/). Valida que se hayan codificado todas las propiedades del dominio, métodos de negocio y casos de uso requeridos.
- [ ] **Alineación con el Catálogo:** Verifica que las reglas generales y estado del módulo estén de acuerdo con [modulo_guia.md](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modulo_guia.md).

---

## Protocolo de Pruebas Técnicas

Para validar la estabilidad y la corrección técnica del código, ejecuta de forma rigurosa los siguientes comandos:

### 1. Formato y Linter (Biome)
Ejecuta Biome para verificar que el estilo del código y la sintaxis sean correctos:
```bash
bun biome check src/modules/<nombre>
```
*Si hay errores, corrígelos antes de continuar.*

### 2. Validación de Tipado (TypeScript)
Compila los tipos de forma estricta para garantizar la integridad de las firmas y contratos de datos:
```bash
bunx tsc --noEmit
```

### 3. Pruebas Unitarias y E2E (Bun Test)
Ejecuta las pruebas asociadas al módulo:
```bash
bun test src/modules/<nombre>
```
- **Tests Unitarios:** Ubicados junto a las entidades o casos de uso (`.spec.ts`). Deben probar la lógica de negocio simulando (mockeando) los repositorios de infraestructura.
- **Tests E2E:** Ubicados en `infrastructure/http/routes/` (`.e2e.spec.ts`). Deben levantar la app y probar los endpoints HTTP reales usando `DATABASE_URL_TEST` para verificar el ciclo completo.

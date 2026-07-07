# Guía de Módulos (Hexagonal & DDD)

Este documento centraliza las directrices arquitectónicas para el diseño y la creación de módulos, y contiene el inventario actual de los módulos que componen el sistema ganadero.

---

## 1. Directrices Generales de Diseño

Para garantizar un código limpio, rápido en infraestructura y fácil de mantener, todos los módulos deben seguir rigurosamente los siguientes principios:

### A. Arquitectura Hexagonal (Inside-Out)
El flujo de desarrollo y dependencias va siempre de adentro hacia afuera:
1. **Domain:** Núcleo puro del negocio. Contiene la entidad principal, interfaces de repositorios/servicios y errores del dominio. Totalmente aislado (prohibidos imports de `@prisma/client`, `hono`, `zod`, etc.).
2. **Application:** Contiene los casos de uso (`run`), DTOs y mappers. Se comunica con el dominio y la infraestructura externa a través de abstracciones (interfaces inyectadas).
3. **Infrastructure:** Contiene los detalles concretos de tecnología. Repositorios de Prisma, rutas de Hono, controladores HTTP, esquemas de validación Zod y middlewares de seguridad.

### B. Convención de Idioma Mixto
- **Lógica de negocio del dominio (Español):** Toda la lógica específica del ganado, ranchos y dueños se escribe en español.
  - *Ejemplos:* Clase `Ganado`, método `obtenerPeso()`, propiedad `edadEnMeses`, clase `Propietario`.
- **Términos de diseño, infraestructura y patrones (Inglés):** Conceptos globales de software, patrones de arquitectura e infraestructura se escriben en inglés.
  - *Ejemplos:* `EventBus`, `PasswordHasher`, `UserRepository`, `CreateUserUseCase`, `CreateUserController`, `PrismaUserRepository`, `Hono`.

### C. Acceso a Datos (Sin Getters/Setters Nativos)
- **Prohibido** usar las palabras clave nativas `get` o `set` en clases y objetos (ej. `get peso()`).
- **Obligatorio** usar métodos clásicos para interactuar con los datos (ej. `getPeso()`, `registrarPesaje()`).

### D. Inyección de Dependencias (TSyringe)
- Decorar con `@injectable()` los casos de uso, controladores, mappers y repositorios de infraestructura.
- Inyectar las interfaces mediante `@inject("TokenName")` en los constructores.
- Registrar el mapeo de interfaces a implementaciones en `src/core/shared/infrastructure/di/container.ts`.

---

## 2. Inventario y Estado de los Módulos

El sistema distingue entre módulos transversales de la aplicación y módulos dedicados a la lógica del negocio ganadero.

### A. Módulos de Soporte e Infraestructura
*Estos módulos gestionan el acceso y seguridad del sistema general. Ya se encuentran implementados.*
* **`auth`** (`src/modules/auth/`): Autenticación de usuarios, emisión y rotación segura de JWTs.
* **`authorization`** (`src/modules/authorization/`): Control de accesos atómico basado en recursos y acciones (RBAC/ABAC).

### B. Módulos Transversales del Core
*Estos módulos son compartidos por múltiples secciones de la aplicación y su lógica es general. Deben ubicarse en `src/core/`.*
* **`user`** (`src/core/user/`): Gestión y persistencia de cuentas de usuario de la plataforma.

### C. Módulos de Lógica de Negocio Ganadero
*Módulos enfocados de manera exclusiva en las reglas del negocio ganadero. Se ubican en `src/modules/` y se encuentran por implementar o en desarrollo inicial:*

1. **[Ganado](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/ganado.md)** (`src/modules/ganado/`) — *Por implementar*  
   Control individual del ganado: pesaje, edad, sexo, asignación a ranchos e historial de salud.
2. **[Inventario de Insumos](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/inventario-insumos.md)** (`src/modules/inventario-insumos/`) — *Por implementar*  
   Administración de medicamentos, vacunas y alimentos del rancho. Control de existencias y alertas de bajo stock.
3. **[Propietario](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/propietario.md)** (`src/modules/propietario/`) — *En desarrollo (solo posee entidad básica)*  
   Administración de los dueños legales de los animales y ranchos asociados.
4. **[Rancho](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/rancho.md)** (`src/modules/rancho/`) — *Por implementar*  
   Definición y capacidad de las fincas/ranchos de producción.
5. **[Raza](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/raza.md)** (`src/modules/raza/`) — *Por implementar*  
   Catálogo de razas de ganado y sus características.
6. **[Sesión Sanitaria](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/sesion-sanitaria.md)** (`src/modules/sesion-sanitaria/`) — *Por implementar*  
   Jornadas de atención médica masiva (vacunaciones, desparasitaciones conjuntas).
7. **[Tratamiento Médico](file:///home/victor-raul/proyectos/sistema-ganadero/docs/modules/tratamiento-medico.md)** (`src/modules/tratamiento-medico/`) — *Por implementar*  
   Recetas, aplicaciones diarias de medicamentos y seguimiento a animales enfermos de forma individual.
